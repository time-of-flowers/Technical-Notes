// ==UserScript==
// @name         HV BattleUI MoreBeautiful
// @namespace    HVBUIMB
// @description  显示伤害数字，主动攻击将造成怪物窗体抖动
// @author       time_of_flower
// @version      v0.60
// @icon         data:image/png;base64,UklGRjACAABXRUJQVlA4TCQCAAAvG8AGEL/jJLZtUVlyyyu//PL3T0AEJBGQyKuZF4JpJElCWo5EvkQSCvlHgUSuZCFJkqDEwsXFe949f7Fx/tWmbcCM6bkDUJBARGDEglkYoRCCECOQIBYMI4IQQQnb8x84URCLiY1BKIqiEIcvEUzxwQvvcwiyZhtn5v+EYChCJAbDVMhxvJIIkucbt4MYc9AhRoRv5rnESBI2fj82lutKd573dxuDRMm2Tbu6K3au7z3Z+5zYtm3btpPn9//HnzBnRP8ZuG3bSOre7d0rItOzoUVkqlTACtAtPAoATs2ot28BVv3F1vevr8/4zGTtx+PNn9+r835SDs6wt1U9OWEdPr+vkvP/AS+U463Mop4YjxYIVufhC0A5v9rT42OVf388edoE8CleQ4+NKjl5WZ2bd1Ih510nsFneV6MjSgBvQvokS3lqZNgUwHNMofvgDj8RHR6qEyBU5fVEDw1aLgJ02H+oHhzQ2ZAc3euBfjN7BFllMBunur8PAhRLCE5PVF+P3twuzFsSj3P/QNBZiGZPp15YKlz10RVdbw7d2W7epmX1n8tV+hwAaer2VrV/cRcOQ7c2RfOlyANJH4xktKlR3V8ehWIlGW2sr1neOpVVBpRcQ6rraebmsEBCkKaubzDXWVLOoJ+YWEsbqqnBKmPKIAMCjF0mVXO9lTaqjJWE+LuzAiSjLU1WgDoGzwFUtD3S0dbegbbWZrQ0odktW9nR3dUbAQ==
// @match        *://*.hentaiverse.org/*
// @match        *://*.hentaiverse.org/isekai/*
// @exclude      *hentaiverse.org/equip/*
// @exclude      *hentaiverse.org/isekai/equip/*
// @grant        GM_getResourceURL
// @grant        GM_addStyle
// @resource     SpiritBurnBG https://i.mji.rip/2025/09/10/1a8cbedd20b7b8b383364b467d746d5c.gif
// @resource     VoidDamageBG https://pixeljoint.com/files/icons/full/starfield.png
// @resource     GothicFlames https://cdn.jsdelivr.net/gh/time-of-flowers/Technical-Notes@main/HV%E8%84%9A%E6%9C%AC/Gothic%20Flames.woff2
// @run-at document-end
// ==/UserScript==

(function() {
    'use strict';
    /** 参数配置 **/
    function cfgLoader(){
        const Config = {};
        Config.Shake_Time = 250;
        Config.Damage_Lifetime = 1000;
        Config.DAMAGE_PARAMS = { offsetY: 35, offsetX: 80, floatHeight: 10 };
        Config.RETRY_ATTEMPTS = 5;
        Config.RETRY_DELAY = 500;
        Config.Enable_Custom_Bar = true;
        Config.isAjaxRound = JSON.parse(localStorage.getItem("HVmbcfg")).ajaxRound || false;
        RegexPatterns = {
            bar : /^\/(isekai\/)?y\/bar_(red|green|bgreen|dgreen|blue)\.png$/,
            spikeShield : /Your\s+spike\s+shield\s+hits\s+(.+?)\s+for\s+(\d+)\s+points\s+of\s+(\w+)\s+damage/i,
            bleedingWound : /Bleeding\s+Wound\s+hits\s+(.+?)\s+for\s+(\d+)\s+damage/i,
            activeAttack : /\b(?:hit|hits|crit|blasts)\s+(.+?)\s+for\s+(\d+)\s+(\w+)\s+damage/i,
        };
        damagePatterns = [
            { regex: RegexPatterns.spikeShield,
             getType: match => match[3].toLowerCase(),
             isCrit: false,
             onlyPassive: true },
            { regex: RegexPatterns.bleedingWound,
             getType: () => "physical",
             isCrit: false,
             onlyPassive: true },
            { regex: RegexPatterns.activeAttack,
             getType: match => match[3].toLowerCase(),
             isCrit: text => /(crit|blasts)/i.test(text),
             onlyPassive: false }
        ];
        Config.SVG_MAP = {
            spirit_on: 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(`
            <svg width="414" height="8" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="8" fill="#DF7B30">
                <animate attributeName="fill" values="#931F6F;#BE1E56;#DF3030;#DE4C2B;#DF7B30;#DE4C2B;#DF3030;#BE1E56;#931F6F;" dur="0.5s" repeatCount="indefinite"/>
            </rect>
            </svg>`))),

            spirit_off: 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(`
            <svg width="414" height="8" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="spiritGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#FD171D"/>
                <stop offset="50%" stop-color="#FCB045"/>
                <stop offset="100%" stop-color="#FD171D"/>
                </linearGradient>
                <linearGradient id="spiritPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
                <stop offset="25%" stop-color="#FCB045" stop-opacity="0.2"/>
                <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.6"/>
                <stop offset="75%" stop-color="#FCB045" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="8" fill="url(#spiritGrad)"/>
            <rect width="100%" height="8" fill="url(#spiritPulseGrad)">
                <animate attributeType="XML" attributeName="x" from="-100%" to="100%" dur="2s" repeatCount="indefinite"/>
            </rect>
            </svg>`))),

            health_none: 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(`
            <svg width="414" height="8" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="healthNoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#78FF7C" />
                <stop offset="50%" stop-color="#A8FF78" />
                <stop offset="100%" stop-color="#78FF7C" />
                </linearGradient>
            </defs>
            <rect width="100%" height="8" fill="url(#healthNoneGrad)" />
            </svg>`))),

            health_sparkoflife: 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(`
            <svg width="414" height="8" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="healthSparkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#155799" />
                <stop offset="50%" stop-color="#159957" />
                <stop offset="100%" stop-color="#155799" />
                </linearGradient>
                <linearGradient id="sparkOverlay" x1="25%" y1="60%" x2="75%" y2="40%">
                <stop offset="0%" stop-color="white" stop-opacity="0"/>
                <stop offset="25%" stop-color="#e0eafc" stop-opacity="0.2"/>
                <stop offset="50%" stop-color="#cfdef3" stop-opacity="0.4"/>
                <stop offset="75%" stop-color="#e0eafc" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="white" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="8" fill="url(#healthSparkGrad)"/>
            <rect width="100%" height="8" fill="url(#sparkOverlay)">
                <animate attributeType="XML" attributeName="x" from="-100%" to="100%" dur="2s" repeatCount="indefinite"/>
            </rect>
            </svg>`))),

            magic: 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(`
            <svg width="414" height="8" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="magicGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#2980B9" />
                <stop offset="25%" stop-color="#6DD5FA" />
                <stop offset="50%" stop-color="#FFFFFF" />
                <stop offset="75%" stop-color="#6DD5FA" />
                <stop offset="100%" stop-color="#2980B9" />
                </linearGradient>
                <linearGradient id="magicPulseGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0"/>
                <stop offset="25%" stop-color="#66ccff" stop-opacity="0.2"/>
                <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.6"/>
                <stop offset="75%" stop-color="#66ccff" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
                </linearGradient>
            </defs>
            <rect width="100%" height="8" fill="url(#magicGrad)"/>
            <rect width="100%" height="8" fill="url(#magicPulseGrad)">
                <animate attributeType="XML" attributeName="x" from="100%" to="-100%" dur="2s" repeatCount="indefinite"/>
            </rect>
            </svg>`)))
        };
        const SpiritBurnBGUrl = GM_getResourceURL("SpiritBurnBG");
        const VoidDamageBGUrl = GM_getResourceURL("VoidDamageBG");
        const fontUrl = GM_getResourceURL("GothicFlames");
        Config.styleText = `
                /* 伤害数字基础属性 */
                @font-face {
                    font-family: "myFont";
                    src: url("${fontUrl}") format("woff2");
                }
                .hv-damage-base {
                    position: absolute;
                    pointer-events: none;
                    font-weight: bold;
                    font-family: "myFont", arial, sans-serif;
                    font-size: 30px;
                    z-index: 999;
                    opacity: 1;
                }
                /* 不同伤害类型 slashing, piercing, crushing, Bleeding Wound均计算为物理 */
                .hv-damage-physical {
                    background:linear-gradient(120deg,#ff0000,#ffb600,#fff600,#a5ff00,#00a9ff,#0400ff,#8a00fc,#ff00e9,#ff0059);
                    -webkit-background-clip: text;-webkit-text-fill-color: transparent;
                    /*-webkit-text-stroke: 1px Gray;*/
                    filter:drop-shadow(2px 2px 2px rgba(255,0,0,0.2))
                        drop-shadow(-2px 2px 2px rgba(0,169,255,0.2))
                        drop-shadow(2px -2px 2px rgba(138,0,252,0.2))
                        drop-shadow(0 0 6px rgba(0,0,0,0.5));
                }
                .hv-damage-fire {
                    background: linear-gradient(to right, #ED213A, #93291E);
                    -webkit-background-clip: text;-webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 8px rgba(255,0,0,0.8));}
                .hv-damage-cold {
                    background: linear-gradient(to right, #00B4DB, #0083B0);
                    -webkit-background-clip: text;-webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 8px rgba(0,0,255,0.8));}
                .hv-damage-wind {
                    background: linear-gradient(to right, #A8FF78, #78FFD6);
                    -webkit-background-clip: text;-webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 8px rgba(0,255,0,0.8));}
                .hv-damage-elec {
                    background: linear-gradient(to right, #FDC830, #F37335);
                    -webkit-background-clip: text;-webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 8px rgba(255,255,0,0.8));}
                .hv-damage-holy {
                    background: linear-gradient(to right, #1CD8D2, #93EDC7);
                    -webkit-background-clip: text;-webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 8px rgba(0,255,255,0.8));}
                .hv-damage-dark {
                    background: linear-gradient(to right, #AD5389, #3C1053);
                    -webkit-background-clip: text;-webkit-text-fill-color: transparent;
                    filter: drop-shadow(0 0 8px rgba(255,0,255,0.8));}
                .hv-damage-void {
                    background-image: url("${VoidDamageBGUrl}");
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(0px 0px 5px rgba(3, 0, 30, 0.5));
                }

                .hv-damage-normal {
                    animation: hv-damagekeyframes-normal ${Config.Damage_Lifetime}ms ease forwards;
                }
                .hv-damage-crit {
                    animation: hv-damagekeyframes-crit ${Config.Damage_Lifetime}ms ease forwards;
                }

                /* 伤害数字显示动画关键帧 */
                @keyframes hv-damagekeyframes-normal {
                    0% {opacity: 1;transform: translateY(0) scale(1.5);}
                    25% {opacity: 1;transform: translateY(-5px) scale(1);}
                    50% {transform: translateY(-10px) scale(1);}
                    100% {opacity: 0;transform: translateY(-50px) scale(1);}
                }
                @keyframes hv-damagekeyframes-crit {
                    0% {opacity: 1; transform: translateY(0) scale(2);}
                    25% {opacity: 1; transform: translateY(-5px) scale(1.5);}
                    50% {transform: translateY(-10px) scale(1.5);}
                    100% {opacity: 0;transform: translateY(-50px) scale(1.5);}
                }

                /* 怪物抖动动画 */
                .hv-shake-normal {
                animation: hv-shakekeyframes-normal ${Config.Shake_Time}ms ease forwards;
                }
                @keyframes hv-shakekeyframes-normal {
                0%   { transform: translateX(0); }
                25%  { transform: translateX(5px); }
                50%  { transform: translateX(10px); }
                75%  { transform: translateX(5px); }
                100% { transform: translateX(0); }
                }
                .hv-shake-crit {
                animation: hv-shakekeyframes-crit ${Config.Shake_Time}ms ease forwards;
                }
                @keyframes hv-shakekeyframes-crit {
                0%   { transform: translateX(0); }
                25%  { transform: translateX(20px); }
                50%  { transform: translateX(-10px); }
                75%  { transform: translateX(5px); }
                100% { transform: translateX(0); }
                }

                #pane_vitals.spiritOn #vcp::before {
                content: "";
                pointer-events: none;
                position: absolute;
                top: -27px;
                left: -33px;
                width: 466px;
                height: 44px;
                background: url("${SpiritBurnBGUrl}");
                z-index: -1;
                }
            `;
        return Config
    }
    function mapLoader(){
        const AtoB = {};
        AtoB.damageTypeToClass = {
            physical: "hv-damage-physical", void: "hv-damage-void",
            fire: "hv-damage-fire", cold: "hv-damage-cold", wind: "hv-damage-wind",
            elec: "hv-damage-elec", holy: "hv-damage-holy", dark: "hv-damage-dark"
        };
        AtoB.barToSVG = {
            "bar_red.png": () => SpiritOn ? cfg.SVG_MAP.spirit_on : cfg.SVG_MAP.spirit_off,
            "bar_green.png": () => cfg.SVG_MAP.health_none,
            "bar_bgreen.png": () => cfg.SVG_MAP.health_none,
            "bar_dgreen.png": () => cfg.SVG_MAP.health_sparkoflife,
            "bar_blue.png": () => cfg.SVG_MAP.magic
        };
        return AtoB
    }
    /** 用于管理伤害数字div池的类 **/
    class TextPool {
        constructor(initialSize, maxSize) {
            this.pool = [];
            this.maxSize = maxSize;
            for (let i = 0; i < initialSize; i++) this.pool.push(this._createDamageDiv());
        }
        _createDamageDiv() {
            const div = document.createElement('div');
            div.classList.add('hv-damage-base');
            div.style.display = 'none';
            div._activeClasses = []; // 用于记录当前被加上的可清理类
            document.body.appendChild(div);
            return div;
        }
        acquire() {
            if ((this.pool.length === 0) && (this.pool.length < this.maxSize)) {
                this.pool.push(this._createDamageDiv());
            };
            const div = this.pool.pop();
            div.style.display = 'block';
            return div;
        }

        release(div) {
            if (!div) return;
            div.style.display = 'none';
            div.textContent = '';
            if (div._activeClasses) {
                div._activeClasses.forEach(cls => div.classList.remove(cls));
                div._activeClasses = [];
            }
            if (this.pool.length < this.maxSize) {this.pool.push(div);}
            else {div.remove();}
        }
    }

    /* ??? 该项功能有待实现自动检测: barType: true Standard , false Utilitarian */
    let cfg = {}, barType = true, lastSpiritOn = null, SpiritOn = false, map = {} ,
        damageTextPool = null, RegexPatterns = {}, damagePatterns = [];

    checkDom();
    /** 检查是否符合初始化条件 **/
    function checkDom() {
        const battleMain = document.getElementById('battle_main');
        if (battleMain) {
            cfg = cfgLoader();
            map = mapLoader();
            if (document.getElementById('dvbc')) {barType = true;}
            else { barType = false; }
            init();
            console.log('init: refresh');
            if (cfg.isAjaxRound) {
                document.addEventListener('DOMContentLoaded', function () {
                    console.log('init: DOMContentLoaded');
                    init();
                });
            }
            hookXHR();
        } else {
            console.warn('This is not a battle page. Element #pane_vitals not found');
        }
    }
    /** 初始化 **/
    function init(){
        const vitals = document.getElementById('pane_vitals');
        const style = document.createElement('style');
        style.textContent = cfg.styleText;
        document.head.appendChild(style);
        updateMonsterMap(cfg.RETRY_ATTEMPTS,cfg.RETRY_DELAY);
        damageTextPool = new TextPool(Object.keys(map.monsterNameToId).length,Object.keys(map.monsterNameToId).length * cfg.Damage_Lifetime / cfg.Shake_Time);
        if (cfg.Enable_Custom_Bar){spiritVisualEffect();}
        var obs = new MutationObserver((mutationsList, observer)=>{
            if(cfg.Enable_Custom_Bar){spiritVisualEffect();}
        });
        obs.observe(vitals, { childList: true });
    }
    /** 更新怪物列表 **/
    function updateMonsterMap(maxAttempts = 3, retryDelay = 300, attempt = 0) {
        if (attempt >= maxAttempts) {
            console.warn(`updateMonsterMap has reached the maximum number of retries (${maxAttempts})`);
        }
        const nodes = [...document.getElementById('pane_monster').children].filter(el => el.id.startsWith('mkey_'));

        if (nodes.length === 0) {
            setTimeout(() => updateMonsterMap(maxAttempts, attempt + 1), retryDelay);
        }
        if (nodes.length > 0){
            map.monsterNameToId = {};
            nodes.forEach(node => {
                const id = node.id;
                const nameNode = node.querySelector('.btm3');
                if (nameNode) {
                    const name = nameNode.textContent.trim();
                    map.monsterNameToId[name] = id;
                }
            });
        }
    }
    /** 血条样式覆盖 **/
    function spiritVisualEffect(){
        const paneVitals = document.getElementById('pane_vitals');
        if (!paneVitals) return;

        const paneAction = document.getElementById('pane_action');
        if (!paneAction) return;

        // SpiritOn 判断
        if (paneAction.querySelector('img[src$="spirit_a.png"]')) { SpiritOn = true; }
        else if (paneAction.querySelector('img[src$="spirit_s.png"], img[src$="spirit_n.png"]')) { SpiritOn = false;}
        if ((SpiritOn !== lastSpiritOn) && barType) {
            if (SpiritOn) {paneVitals.classList.add('spiritOn');}
            else {paneVitals.classList.remove('spiritOn');}
            lastSpiritOn = SpiritOn;
        }

        Array.from(paneVitals.getElementsByTagName('img')).filter(img => RegexPatterns.bar.test(img.getAttribute('src'))).forEach(originalImg => {
            const src = originalImg.getAttribute('src');
            let overlay = originalImg.parentNode.querySelector('img.custom-dynamic-bar');

            if (!overlay) {
                overlay = document.createElement('img');
                overlay.className = 'custom-dynamic-bar';
                overlay.style.width = (originalImg.width || parseFloat((originalImg.style.width.match(/([\d.]+)px/) || [])[1]) || 100) + 'px';
                originalImg.parentNode.insertBefore(overlay, originalImg);
            }

            // 根据血条类型设置 SVG
            for (const key in map.barToSVG) {
                if (src.includes(key)) {
                    overlay.src = map.barToSVG[key]();
                    break;
                }
            }

            originalImg.style.display = 'none';
        });
    }
    /** Hook XHR **/
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

        for (const [id, dmgObj] of Object.entries(damageMap)) {
            const obj = prepareDamageElement(id, dmgObj.total, dmgObj.isCrit , dmgObj.onlyPassive,dmgObj.mainType);
            if (obj) {
                animQueue.push(obj);
            }
        }
        animQueue.forEach(obj => obj.trigger());
    }
    /** 解析玩家伤害 **/
    function parsePlayerDamage(logs) {
        const result = {};
        logs.forEach(entry => {
            const text = entry.t;
            let targetNameInLog = null, damage = 0, damageType = "unknown", isCrit = false, onlyPassive = true;
            for (const pattern of damagePatterns) {
                const match = text.match(pattern.regex);
                if (match) {
                    targetNameInLog = match[1].trim();
                    damage = parseInt(match[2], 10);
                    damageType = typeof pattern.getType === 'function' ? pattern.getType(match) : pattern.getType;
                    isCrit = typeof pattern.isCrit === 'function' ? pattern.isCrit(text) : pattern.isCrit;
                    onlyPassive = pattern.onlyPassive;
                    break;
                }
            }
            if (!targetNameInLog) return;

            if (["slashing", "piercing", "crushing"].includes(damageType)) {
                damageType = "physical";
            }
            const targetId = map.monsterNameToId[targetNameInLog];
            if (!targetId) return;

            if (!result[targetId]) { result[targetId] = { total: 0, isCrit: false, onlyPassive: true, types: {} };}
            result[targetId].total += damage;
            if (!result[targetId].types[damageType]) {
                result[targetId].types[damageType] = 0;
            }
            result[targetId].types[damageType] += damage;
            if (isCrit) result[targetId].isCrit = true;
            if (!onlyPassive) result[targetId].onlyPassive = false;
        });
        Object.keys(result).forEach(targetId => {
            const typeEntries = Object.entries(result[targetId].types);
            if (typeEntries.length > 0) {
                typeEntries.sort((a, b) => b[1] - a[1]);
                result[targetId].mainType = typeEntries[0][0];
            }
        });
        //console.log(result);检视
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
    function prepareDamageElement(targetId, damage, isCrit, onlyPassive, damageType) {
        const targetElem = document.getElementById(targetId);
        if (!targetElem) return null;

        const dmgElem = damageTextPool.acquire();
        dmgElem.textContent = damage;

        const critClass = isCrit ? 'hv-damage-crit' : 'hv-damage-normal';
        const typeClass = map.damageTypeToClass[damageType] || 'hv-damage-physical';
        dmgElem.classList.add(critClass, typeClass);
        dmgElem._activeClasses = [critClass, typeClass];

        const rect = targetElem.getBoundingClientRect();
        const pos = calcPosition(rect, dmgElem, cfg.DAMAGE_PARAMS);
        dmgElem.style.left = `${pos.left}px`;
        dmgElem.style.top = `${pos.top}px`;

        const shakeClass = isCrit ? 'hv-shake-crit' : 'hv-shake-normal';

        return {
            trigger: () => {
                if (!onlyPassive) {
                    targetElem.classList.add(shakeClass);
                    setTimeout(() => targetElem.classList.remove(shakeClass), cfg.Shake_Time);
                }
                setTimeout(() => damageTextPool.release(dmgElem), cfg.Damage_Lifetime);
            }
        };
    }
})();
