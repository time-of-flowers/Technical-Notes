// ==UserScript==
// @name         HV Damagenumber Rebron
// @namespace    rehvdamagenumberre
// @description  显示伤害数字，从html读取怪物列表，从xhr处理伤害，动画参数结构化
// @author       time_of_flower & ChatGPT
// @version      v0.34
// @match        *://*hentaiverse.org/?s=Battle*
// @match        *://*hentaiverse.org/isekai/?s=Battle*
// @run-at document-end
// ==/UserScript==

(function() {
    'use strict';

    /** 参数配置 **/
    const Shake_Time = 250; // 怪物框体抖动动画时间，需小于实际turn时间，理论turn时间不小于250
    const Damage_Lifetime = 800; // 伤害数字显示持续时间
    const DAMAGE_PARAMS = {offsetY: 35, offsetX: 80, floatHeight: 10 };
    const MIN_DAMAGE_DISPLAY = 99;
    const style = document.createElement('style');
    style.textContent = `
        /* 伤害数字基础属性 */
        .hv-damage {
            position: absolute;
            pointer-events: none;
            font-weight: bold;
            font-family: "g_comichorrorR_free-Regular","Arial", sans-serif;
            font-size: 30px;
            z-index: 999;
            opacity: 1;
        }

        /* 伤害数字显示动画 */
        @keyframes hv-damagekeyframes-normal {
            0% {opacity: 1;transform: translateY(0) scale(1.5);}
            25% {transform: translateY(-5px) scale(1.2);}
            50% {transform: translateY(-15px) scale(1);}
            100% {opacity: 0;transform: translateY(-30px) scale(1);}
        }
        .hv-damage-normal {
            color: white;
            -webkit-text-stroke: 1px Gray;
            animation: hv-damagekeyframes-normal ${Damage_Lifetime}ms ease forwards;
        }

        @keyframes hv-damagekeyframes-crit {
            0% {opacity: 1;transform: translateY(0) scale(2);}
            25% {transform: translateY(-5px) scale(1.8);}
            50% {transform: translateY(-15px) scale(1.5);}
            100% {opacity: 0;transform: translateY(-30px) scale(1.5);}
        }
        .hv-damage-crit {
            color: #DC143C;
            text-shadow: 0 0 8px rgba(255,10,0,1);
            animation: hv-damagekeyframes-crit ${Damage_Lifetime}ms ease forwards;
        }

        /* 怪物抖动动画 */
        @keyframes hv-shakekeyframes-normal {
          0%   { transform: translateX(0); }
          25%  { transform: translateX(10px); }
          50%  { transform: translateX(-6px); }
          75%  { transform: translateX(2px); }
          100% { transform: translateX(0); }
        }
        .hv-shake-normal {
          animation: hv-shakekeyframes-normal ${Shake_Time}ms ease forwards;
        }

        @keyframes hv-shakekeyframes-crit {
          0%   { transform: translateX(0); }
          25%  { transform: translateX(20px); }
          50%  { transform: translateX(-10px); }
          75%  { transform: translateX(5px); }
          100% { transform: translateX(0); }
        }
        .hv-shake-crit {
          animation: hv-shakekeyframes-crit ${Shake_Time}ms ease forwards;
        }
    `;
    document.head.appendChild(style);

    let nameToId = {};
    waitForMonsters();
    function waitForMonsters() {
        const nodes = document.querySelectorAll('[id^="mkey_"]');
        if (nodes.length > 0) {
            updateMonsterMap();
        } else {
            setTimeout(waitForMonsters, 500);
        }
    }
    function updateMonsterMap() {
        const nodes = document.querySelectorAll('[id^="mkey_"]');
        nameToId = {};
        nodes.forEach(node => {
            const id = node.id;
            const nameNode = node.querySelector('.btm3');
            if (nameNode) {
                const name = nameNode.textContent.trim();
                nameToId[name] = id;
            }
        });
    }

    /** Hook XHR **/
    hookXHR();
    function hookXHR() {
        const oldOpen = XMLHttpRequest.prototype.open;
        const oldSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function(method, url) {
            this._targetURL = url;
            return oldOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function() {
            this.addEventListener('load', function() {
                try {
                    const data = JSON.parse(this.responseText);
                    if (data && data.textlog) {
                        handleGameResponse(data);
                    }
                } catch (err) {}
            });
            return oldSend.apply(this, arguments);
        };
    }
    /** 计算伤害与执行动画逻辑 **/
    function handleGameResponse(data) {
        const damageMap = parsePlayerDamage(data.textlog);
        const animQueue = [];
        const fragment = document.createDocumentFragment();

        for (const [id, dmgObj] of Object.entries(damageMap)) {
            const obj = prepareDamageElement(id, dmgObj.value, dmgObj.isCrit);
            if (obj) {
                fragment.appendChild(obj.elem);
                animQueue.push(obj);
            }
        }
        document.body.appendChild(fragment);

        // 双层 requestAnimationFrame 确保初始位置渲染后再执行动画
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                animQueue.forEach(obj => obj.trigger());
            });
        });
    }

    /** 解析玩家伤害 **/
    function parsePlayerDamage(logs) {
        const result = {};
        logs.forEach(entry => {
            const text = entry.t;
            const match = text.match(/\b(?:hit|hits|crit|crits)\s+(.+?)\s+for\s+(\d+)\b/i);
            if (!match) return;

            const targetNameInLog = match[1].trim();
            const damage = parseInt(match[2], 10);
            const isCrit = /crit/i.test(text);

            const targetId = nameToId[targetNameInLog];
            if (!targetId) return;

            if (!result[targetId]) result[targetId] = { value: 0, isCrit: false };
            result[targetId].value += damage;
            if (isCrit) result[targetId].isCrit = true;
        });
        return result;
    }

    /** 计算伤害数字位置 **/
    function calcPosition(rect, elem, params, extraY = 0) {
        return {
            left: rect.left + window.scrollX + rect.width / 2 - elem.offsetWidth / 2 + params.offsetX,
            top: rect.top + window.scrollY + rect.height / 2 - elem.offsetHeight / 2 - params.offsetY - extraY
        };
    }

    /** 准备动画元素（不触发动画） **/
    function prepareDamageElement(targetId, damage, isCrit) {
        if (damage < MIN_DAMAGE_DISPLAY) return null;
        const targetElem = document.getElementById(targetId);
        if (!targetElem) return null;

        const dmgElem = document.createElement('div');
        dmgElem.textContent = damage;
        dmgElem.className = isCrit ? 'hv-damage hv-damage-crit' : 'hv-damage hv-damage-normal';
        dmgElem.style.visibility = 'hidden';

        // 插入后才能获取 offsetWidth 和 offsetHeight
        document.body.appendChild(dmgElem);
        const rect = targetElem.getBoundingClientRect();
        const pos = calcPosition(rect, dmgElem, DAMAGE_PARAMS);
        dmgElem.style.left = `${pos.left}px`;
        dmgElem.style.top = `${pos.top}px`;
        dmgElem.style.visibility = 'visible';
        dmgElem.remove(); // 先移除，等 fragment 统一插入
        const shakeClass = isCrit ? 'hv-shake-crit' : 'hv-shake-normal';

        return {
            elem: dmgElem,
            trigger: () => {
                // 怪物抖动
                targetElem.classList.add(shakeClass);
                setTimeout(() => {
                    targetElem.classList.remove(shakeClass);
                }, Shake_Time);

                // 伤害数字延迟清除（使用 CSS 动画时间）
                setTimeout(() => {
                    dmgElem.remove();
                }, Damage_Lifetime);
            }
        };
    }
})();
