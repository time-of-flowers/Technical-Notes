// ==UserScript==
// @name         HVIVAS
// @namespace    HVIVAS
// @description  Hentaiverse Integrated Visual Augmentation System
// @author       time_of_flower
// @version      alpha0.95
// @icon         https://youke1.picui.cn/s1/2025/10/11/68ea24f68bb40.png
// @match        *://*.hentaiverse.org/*
// @match        *://*.hentaiverse.org/isekai/*
// @exclude      *hentaiverse.org/equip/*
// @exclude      *hentaiverse.org/isekai/equip/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      api.github.com
// @connect      raw.githubusercontent.com
// @run-at document-end
// ==/UserScript==

// 在存储中手动设置resetBasicArtResDB来重新加载基础美术资源

(function() {
    'use strict';
    const EnableSwitch = {
        EnableVerificationCodeAssistant : true,
        EnableCustomBar : true,
        EnableDamageNum : true,
        EnableHitAnima :true,
        EnableAjaxRound : (JSON.parse(localStorage.getItem("HVmbcfg") || "{}").ajaxRound) || false,
        EnableAvatar : true,
        EnableBackgroundImg : true,
    }
    function cfgLoader(){
        const Config = {
            Shake_Time : 250,
            Damage_Lifetime : 1000,
            DAMAGE_PARAMS : { offsetY: 35, offsetX: 80, floatHeight: 10 },
            RETRY_ATTEMPTS : 5,
            RETRY_DELAY : 500,
            MIN_INTERVAL : 255,
            LowHealthAvatarUrl : resourcesUrl.SpaSwimsuitDavi,
            SpiritOnAvatarUrl : resourcesUrl.SpaLoveHateDavi,
            NormalAvatarUrl : resourcesUrl.SpaAlteredDavi,
            VictoryAudioUrl : resourcesUrl.VictoryAudio,
            FailedAudioUrl : resourcesUrl.FailedAudio,
        };
        Config.SVGTexture = {
            spirit_on: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg width="414" height="8" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="8" fill="#DF7B30">
                <animate attributeName="fill" values="#931F6F;#BE1E56;#DF3030;#DE4C2B;#DF7B30;#DE4C2B;#DF3030;#BE1E56;#931F6F;" dur="0.5s" repeatCount="indefinite"/>
            </rect>
            </svg>`),

            spirit_off: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
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
            </svg>`),

            health_none: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
            <svg width="414" height="8" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="healthNoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#78FF7C" />
                <stop offset="50%" stop-color="#A8FF78" />
                <stop offset="100%" stop-color="#78FF7C" />
                </linearGradient>
            </defs>
            <rect width="100%" height="8" fill="url(#healthNoneGrad)" />
            </svg>`),

            health_sparkoflife: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
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
            </svg>`),

            magic: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
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
            </svg>`)
            };
        Config.cssStyleText = `
            @font-face {
                font-family: "myFont"; src: url("${resourcesUrl.GothicFlames}") format("woff2");
            }
            .hv-damage-base {
                position: absolute; pointer-events: none; z-index: 999;
                font-family: "myFont", arial, sans-serif; font-weight: bold; font-size: 30px; opacity: 1;
            }
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
                background-image: url("${resourcesUrl.VoidDamageBG}");
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
                content: ""; pointer-events: none;
                position: absolute; top: -27px; left: -33px; width: 466px; height: 44px;
                background: url("${resourcesUrl.SpiritBurnBG}"); z-index: -1;
            }
        `;
        return Config
    }
    function mapRuleLoader(){
        const AtoB = {};
        AtoB.barToSVG = {
            "bar_red.png": () => SpiritOn ? cfg.SVGTexture.spirit_on : cfg.SVGTexture.spirit_off,
            "bar_green.png": () => cfg.SVGTexture.health_none,
            "bar_bgreen.png": () => cfg.SVGTexture.health_none,
            "bar_dgreen.png": () => cfg.SVGTexture.health_sparkoflife,
            "bar_blue.png": () => cfg.SVGTexture.magic
        };
        AtoB.damageTypeToClass = {
            physical: "hv-damage-physical", void: "hv-damage-void",
            fire: "hv-damage-fire", cold: "hv-damage-cold", wind: "hv-damage-wind",
            elec: "hv-damage-elec", holy: "hv-damage-holy", dark: "hv-damage-dark"
        };
        RegexPatterns = {
            bar : /^\/(isekai\/)?y\/bar_(red|green|bgreen|dgreen|blue)\.png$/,
            counterAttack_and_spikeShield : /(?:Your\s+spike\s+shield\s+hits|You\s+counter)\s+(.+?)\s+for\s+(\d+)\s+points\s+of\s+(\w+)\s+damage/i,
            damageOverTime : /(?:Bleeding\s+Wound|Spreading\s+Poison|Vital\s+Theft|Ripened\s+Soul|Burning\s+Soul)\s+hits\s+(.+?)\s+for\s+(\d+)\s+damage/i,
            activeAttack : /\b(?:hit|hits|crit|crits|blasts)\s+(.+?)\s+for\s+(\d+)\s+(\w+)\s+damage/i,
        };
        damagePatterns = [
            { regex: RegexPatterns.counterAttack_and_spikeShield,
             getType: match => match[3].toLowerCase(),
             isCrit: false,
             onlyPassive: true },
            { regex: RegexPatterns.damageOverTime,
             getType: () => "physical",
             isCrit: false,
             onlyPassive: true },
            { regex: RegexPatterns.activeAttack,
             getType: match => match[3].toLowerCase(),
             isCrit: text => /(crit|blasts)/i.test(text),
             onlyPassive: false }
        ];
        return AtoB
    }
    function backgroudimgLoader(){
        let cache = GM_getValue('wallpaper_cache', null),
            queue = GM_getValue('used_wallpapers', []);
        //let cache = { ...rawCache, images: rawCache.images.filter(img => !img.startsWith('NIKKE')) };
        if (!Array.isArray(queue)) queue = [];
        const now = Date.now(),needRefresh = !cache || !Array.isArray(cache.images) || now - cache.fetchedAt > 15 * 24 * 3600000 || cache.manualRefresh;
        function applyWallpaper(images, queue) {
            const used = new Set(queue);
            const avail = images.filter(n => !used.has(n));
            if (!avail.length) return;
            const chosen = avail[Math.floor(Math.random() * avail.length)];
            queue.push(chosen);
            while (queue.length > cache.queue_threshold) { queue.shift(); }
            GM_setValue('used_wallpapers', queue);
            GM_addStyle(`body { background-image: url("https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/bg/${chosen}");
                         background-size: cover; background-position-y: ` + (chosen.includes("aos") ? "30%" : "center") + `; background-repeat: no-repeat; }
                         #csp { margin: 0 auto; background-color: rgba(237,235,223,0.5);}`);
        }
        if (needRefresh) {
            console.log("[HVIVAS] BGDB Needs update");
            GM_xmlhttpRequest({ method: 'GET', url: 'https://raw.githubusercontent.com/time-of-flowers/Assets-for-HVIVAS/main/bg/bg_index.json',
                onload: r => {
                    try {
                        const data = JSON.parse(r.responseText); const imgs = data.images;
                        if (!imgs.length) return;
                        cache = { images: imgs, fetchedAt: now, manualRefresh: false , queue_threshold : Math.floor(imgs.length * 0.6)};
                        GM_setValue('wallpaper_cache', cache);
                        console.log("[HVIVAS] BGDB Update completed");
                        applyWallpaper(cache.images, queue);
                    } catch { return; }
                }
            });
            return;
        }
        applyWallpaper(cache.images, queue);
    };
    async function riddleMasterLoader(){
        if(!EnableSwitch.EnableVerificationCodeAssistant) return;
        const img = document.getElementById("riddleimage").querySelector("img");
        if (img) {
            if(!document.getElementById('riddleMasterCSS')){
                const riddleMasterStyle = document.createElement('style');
                riddleMasterStyle.type = 'text/css'; riddleMasterStyle.id = 'riddleMasterCSS';
                riddleMasterStyle.textContent = `* { user-select: none;} html { overflow: auto; scrollbar-color: #5C0D11 transparent; scrollbar-width: thin !important }
                    #csp, #mainpane { height: 800px;}
                    #riddleimage { position: relative; z-index: 0;} #riddlemid { position: relative; z-index: 100;} #riddler1 label { height: initial; white-space: nowrap;}
                    #mlp_pane { z-index: 200; position: fixed; top: 20px; right: 10px; padding: 10px; width: 200px; background: #dcd3b7; border: 2px solid #5C0D11; border-radius: 5px; cursor: move; }
                    #mlp_box { width: 200px; cursor: default;}`;
                document.head.appendChild(riddleMasterStyle);
            }
            const editor = await PhotoEditor.create(img);
            createManagePanel(editor);
            const PonyImages = {
                "Twilight Sparkle":resourcesUrl.imgTwilightSparkle,
                "Rarity":resourcesUrl.imgRarity,
                "Fluttershy":resourcesUrl.imgFluttershy,
                "Rainbow Dash":resourcesUrl.imgRainbowDash,
                "Pinkie Pie":resourcesUrl.imgPinkiePie,
                "Applejack":resourcesUrl.imgApplejack,
            };

            const labels = document.getElementById("riddler1").querySelectorAll("label");
            labels.forEach(el => {
                const div = document.createElement("div");
                div.innerHTML = `<img src="${PonyImages[el.innerText]}" style="max-width:96px;max-height:96px">`;
                el.appendChild(div);
            });
        }
    }
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
            div._activeClasses = [];
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
    class PhotoEditor {
        constructor(img, options = {}) {
            this.img = img;
            this.data = Object.assign({ scale: 1, rotate: 0, contrast: 1.2, unsharp: 10 }, options);
            if (!this.img) return;
        }
        static async create(img) {
            const editor = new PhotoEditor(img);
            return await editor.init();
        }
        async init() {
            if (!this.img.complete) {await new Promise(resolve => (this.img.onload = resolve));}
            console.log(this.img.getBoundingClientRect());
            this.applyInitialStyle();
            this.unsharpy = ((unsharp) => {
                const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                svg.innerHTML = `<defs><filter id="unsharpy">
                    <feGaussianBlur result="blurOut" in="SourceGraphic" stdDeviation="${unsharp}" />
                    <feComposite operator="arithmetic" k1="0" k2="1.3" k3="-0.3" k4="0" in="SourceGraphic" in2="blurOut" />
                </filter></defs>`;
                document.body.appendChild(svg);
                return svg.querySelector("feGaussianBlur");
            })(this.data.unsharp);
            this.updateImage();
            return this
        }
        applyInitialStyle() {
            const bound = this.img.getBoundingClientRect();
            Object.assign(this.img.style, {
                width: bound.width + "px",
                height: bound.height + "px",
                left: bound.x + "px",
                top: bound.y + "px",
                position: "fixed",
            });
            const placeholder = document.createElement("div");
            placeholder.style.cssText = `width: ${this.img.offsetWidth}px; height: ${this.img.offsetHeight}px`;
            this.img.parentNode.appendChild(placeholder);
            makeDraggable(this.img);
        }
        updateImage() {
            this.unsharpy.setAttribute("stdDeviation", this.data.unsharp);
            this.img.style.filter = `contrast(${this.data.contrast}) url(#unsharpy)`;
            this.img.style.transform = `rotate(${this.data.rotate}deg) scale(${this.data.scale})`;
        }
    }
    class AudioPlayer {
        constructor() { this.audio = new Audio(); this.audio.preload = 'auto'; }
        play(url, volume = 1, restart = true) {
            if (restart || this.audio.src !== url) {
                this.audio.src = url; this.audio.currentTime = 0;
            }
            this.audio.volume = volume;
            this.audio.play();
        }
        pause() { this.audio.pause();}
        isPlaying() { return !this.audio.paused && !this.audio.ended;}
    }
    class ResourceManager {
        constructor() {
            this.dbName = 'HVIVASResourceDB';
            this.storeName = 'resources';
            this.db = null;
            this.resources = [
                { name: 'SpaSwimsuitDavi', url: 'https://static.wikia.nocookie.net/destiny-child-for-kakao/images/0/0b/Spa_Swimsuit_Davi.png' },
                { name: 'SpaAlteredDavi', url: 'https://static.wikia.nocookie.net/destiny-child-for-kakao/images/6/66/Spa_Altered_Davi.png' },
                { name: 'SpaLoveHateDavi', url: 'https://static.wikia.nocookie.net/destiny-child-for-kakao/images/0/0f/Spa_LoveHateDavi.png' },
                { name: 'SpiritBurnBG', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/sprite/pixelFlameBorder.gif' },
                { name: 'VoidDamageBG', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/sprite/starfield.png' },
                { name: 'GothicFlames', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/font/Gothic%20Flames%20simplify.woff2' },
                { name: 'VictoryAudio', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/sound/victory.wav' },
                { name: 'FailedAudio', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/sound/failed.wav' },
                { name: 'imgTwilightSparkle', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/imgPony/Twilight%20Sparkle.png' },
                { name: 'imgRarity', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/imgPony/Rarity.png' },
                { name: 'imgFluttershy', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/imgPony/Fluttershy.png' },
                { name: 'imgRainbowDash', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/imgPony/Rainbow%20Dash.png' },
                { name: 'imgPinkiePie', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/imgPony/Pinkie%20Pie.png' },
                { name: 'imgApplejack', url: 'https://cdn.jsdelivr.net/gh/time-of-flowers/Assets-for-HVIVAS@main/imgPony/Applejack.png' }
            ];
        }
        async init() {
            const shouldReset = GM_getValue('resetBasicArtResDB', true);
            if (shouldReset) {
                console.log('resetBasicArtResDB switch is ON, deleting database...');
                await this.#resetDB();
                GM_setValue('resetBasicArtResDB', false);
            }
            this.db = await this.#openDB();
            for (const item of this.resources) {
                const exists = await this.#getRaw(item.name);
                if (!exists) {
                    console.log(`Resource ${item.name} does not exist, start downloading...`);
                    const res = await fetch(item.url);
                    if (!res.ok) throw new Error(`Download failed: ${item.url}`);
                    const buf = await res.arrayBuffer();
                    await this.#put(item.name, buf);
                    console.log(`Resource ${item.name} has been downloaded and cached successfully`);
                } else {
                    console.log(`Resource ${item.name} is cached`);
                }
            }
        }
        async get(name) {
            const record = await this.#getRaw(name);
            if (!record) {
                const item = this.resources.find(r => r.name === name);
                if (!item) throw new Error(`Resource ${name} does not exist`);
                console.warn(`Resource ${name} is missing from cache, temporarily downloading...`);
                const res = await fetch(item.url);
                const buf = await res.arrayBuffer();
                await this.#put(name, buf);
                return buf;
            }
            return record.data;
        }
        async #openDB() {
            return new Promise((resolve, reject) => {
                const req = indexedDB.open(this.dbName, 1);
                req.onupgradeneeded = (e) => {
                    const db = e.target.result;
                    if (!db.objectStoreNames.contains(this.storeName)) {
                        db.createObjectStore(this.storeName, { keyPath: 'name' });
                    }
                };
                req.onsuccess = (e) => resolve(e.target.result);
                req.onerror = (e) => reject(e.target.error);
            });
        }
        async #put(name, data) {
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(this.storeName, 'readwrite');
                tx.objectStore(this.storeName).put({ name, data });
                tx.oncomplete = resolve;
                tx.onerror = (e) => reject(e.target.error);
            });
        }
        async #getRaw(name) {
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction(this.storeName, 'readonly');
                const req = tx.objectStore(this.storeName).get(name);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = (e) => reject(e.target.error);
            });
        }
        async #resetDB() {
            return new Promise((resolve, reject) => {
                const req = indexedDB.deleteDatabase(this.dbName);
                req.onsuccess = () => {
                    console.log('The database was successfully deleted');
                    resolve();
                };
                req.onerror = (e) => {
                    console.error('Failed to delete the database', e.target.error);
                    reject(e.target.error);
                };
                req.onblocked = () => {
                    console.warn('Deletion is blocked: Please close other pages using this database');
                };
            });
        }
    }

    /* ?barType: true Standard , false Utilitarian */
    let cfg = {}, map = {} ,damageTextPool = null, barType = true,
        currentAvatarKey = null, lastHealthFlash = null, healthFlash = false, lastSpiritOn = null, SpiritOn = false, lastRequestTime = 0,
        RegexPatterns = {}, damagePatterns = [], worker = null ,WoWplayer, rsmanager, resourcesUrl = {} ;

    checkDom();
    function checkDom() {
        if(EnableSwitch.EnableBackgroundImg){backgroudimgLoader()};
        const battleMain = document.getElementById('battle_main');
        if (battleMain) {
            WoWplayer = new AudioPlayer();
            if (document.getElementById('dvbc')) { barType = false;} else { barType = true; }
            (async () => {
                rsmanager = new ResourceManager();
                await rsmanager.init();
                console.log('资源检查完成');
                for (const name of ['SpaSwimsuitDavi','SpaAlteredDavi','SpaLoveHateDavi',
                                    'SpiritBurnBG','VoidDamageBG','GothicFlames','VictoryAudio','FailedAudio',
                                    'imgTwilightSparkle','imgRarity','imgFluttershy','imgRainbowDash','imgPinkiePie','imgApplejack']) {
                    resourcesUrl[name] = URL.createObjectURL(new Blob([await rsmanager.get(name)]));
                }
                cfg = cfgLoader(); map = mapRuleLoader(); init();
            })();
            const workerCode = `function preciseWait(ms){const end = performance.now() + ms;
                const wait = (targetTime) => {
                    const remaining = targetTime - performance.now();
                    if (remaining <= 0) {postMessage('done');return;}
                    setTimeout(() => wait(targetTime), remaining);
                };wait(end);}
                self.onmessage = function(e) {if (e.data && e.data.delay > 0) {preciseWait(e.data.delay);}};`;
            worker = new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })));

            console.log('battleInit: Refresh');
            hookXHR();
            if (EnableSwitch.EnableAjaxRound) {
                document.addEventListener('DOMContentLoaded', function () {
                    if (document.getElementById('riddlemaster')){
                        riddleMasterLoader();
                        console.log('riddlemaster: DOMContentLoaded');
                    } else if (document.getElementById('battle_main')) {
                        init();
                        console.log('battleInit: DOMContentLoaded');
                    } else { console.warn('What is this ?'); }
                });
            }
        } else if (document.getElementById('riddlemaster')) {
            (async () => {
                rsmanager = new ResourceManager();
                await rsmanager.init();
                console.log('资源检查完成');
                for (const name of ['imgTwilightSparkle','imgRarity','imgFluttershy','imgRainbowDash','imgPinkiePie','imgApplejack']) {
                    resourcesUrl[name] = URL.createObjectURL(new Blob([await rsmanager.get(name)]));
                }
                riddleMasterLoader();
            })();
            console.log('riddlemaster: Refresh')
        } else {
            console.warn('What is this ? This is not a battle page. Element #pane_vitals or #riddlemaster not found');
        }
    }
    function init(){
        lastSpiritOn = null;lastHealthFlash = null;
        const vitals = document.getElementById('pane_vitals');
        if(!document.getElementById('mainCSS')){
            const mainStyle = document.createElement('style');
            mainStyle.type = 'text/css'; mainStyle.id = 'mainCSS'; mainStyle.textContent = cfg.cssStyleText;
            document.head.appendChild(mainStyle);
        }
        updateMonsterMap(cfg.RETRY_ATTEMPTS,cfg.RETRY_DELAY);
        damageTextPool = new TextPool(Object.keys(map.monsterNameToId).length,Object.keys(map.monsterNameToId).length * cfg.Damage_Lifetime / cfg.Shake_Time);
        if (EnableSwitch.EnableCustomBar) spiritVisualEffect();
        if(EnableSwitch.EnableAvatar) updateAvatarStatus(true);
        var obs = new MutationObserver((mutationsList, observer)=>{
            if(EnableSwitch.EnableCustomBar) spiritVisualEffect();
        });
        obs.observe(vitals, { childList: true });
    }
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
    function spiritVisualEffect(){
        const paneVitals = document.getElementById('pane_vitals');
        if (!paneVitals) return;
        const paneAction = document.getElementById('pane_action');

        if (paneAction.querySelector('img[src$="spirit_a.png"]')) { SpiritOn = true; }
        else if (paneAction.querySelector('img[src$="spirit_s.png"], img[src$="spirit_n.png"]')) { SpiritOn = false; }
        if ((SpiritOn !== lastSpiritOn) && barType) {
            if (SpiritOn) {paneVitals.classList.add('spiritOn')}
            else {paneVitals.classList.remove('spiritOn');}
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
            for (const key in map.barToSVG) {
                if (src.includes(key)) {
                    overlay.src = map.barToSVG[key]();
                    break;
                }
            }
            originalImg.style.display = 'none';
        });
    }
    function updateAvatarStatus(isInit = false){
        if(isInit){
            healthFlash = unsafeWindow.do_healthflash;
            if(!document.getElementById('AvatarCSS')){
                const avatarStyle = document.createElement('style');
                avatarStyle.type = 'text/css'; avatarStyle.id = 'AvatarCSS';
                avatarStyle.textContent = `#battle_left::before { content: ""; display: block; position: absolute;
                    left: 0; top: -12px; width: 100px; height: 100px;
                    background: var(--avatar-url) no-repeat; background-size: contain;}`;
                document.head.appendChild(avatarStyle);
            }
        }
        const resourceKey = SpiritOn ? cfg.SpiritOnAvatarUrl : (healthFlash ? cfg.LowHealthAvatarUrl : cfg.NormalAvatarUrl);
        if ((SpiritOn !== lastSpiritOn) || (lastHealthFlash !== healthFlash)){
            if (resourceKey !== currentAvatarKey) {
                document.documentElement.style.setProperty("--avatar-url",`url("${resourceKey}")`);
                currentAvatarKey = resourceKey;
            }
        }
    }
    function hookXHR() {
        const oldOpen = XMLHttpRequest.prototype.open;
        const oldSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function(method, url) {
            this._isPost = method === 'POST';
            this._targetURL = url;
            return oldOpen.apply(this, arguments);
        };
        XMLHttpRequest.prototype.send = function() {
            if (this._isPost) {
                if(EnableSwitch.EnableDamageNum || EnableSwitch.EnableHitAnima || EnableSwitch.EnableAvatar){
                    this.addEventListener('load', function() {
                        try {
                            const data = JSON.parse(this.responseText);
                            if (data && data.textlog){
                                if(EnableSwitch.EnableAvatar){ healthFlash = data.healthflash; updateAvatarStatus(); };
                                if(EnableSwitch.EnableDamageNum || EnableSwitch.EnableHitAnima){handleGameResponse(data.textlog);}
                                lastSpiritOn = SpiritOn; lastHealthFlash = healthFlash;
                            }
                            if(data.pane_completion){
                                parseBattleResult(data.pane_completion);
                            }
                        } catch (err) {console.error('Error :', err);}
                    });
                }
                let delayNeeded = lastRequestTime + cfg.MIN_INTERVAL - performance.now();
                if (delayNeeded > 0) {
                    if (lastRequestTime > performance.now()) {
                    }
                    delayViaWorker(delayNeeded).then(() => {
                        lastRequestTime = performance.now();
                        oldSend.apply(this, arguments);
                    });
                    return;
                }
            }
            lastRequestTime = performance.now();
            return oldSend.apply(this, arguments);
        };
    }
    function delayViaWorker(ms) {
        return new Promise((resolve,reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Time Out [4s]: delayViaWorker failed. Please check Auxiliary thread logic'));
            }, ms + 1000);
            worker.onmessage = (e) => {if(e.data==='done') resolve();};
            worker.postMessage({ delay: ms });
        });
    }
    function handleGameResponse(datatextlog) {
        const damageMap = parsePlayerDamage(datatextlog);
        const animQueue = [];
        for (const [id, dmgObj] of Object.entries(damageMap)) {
            const obj = prepareDamageElement(id, dmgObj.total, dmgObj.isCrit , dmgObj.onlyPassive,dmgObj.mainType);
            if (obj) {
                animQueue.push(obj);
            }
        }
        animQueue.forEach(obj => obj.trigger());
    }
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
        return result;
    }
    function calcPosition(rect, elem, params, extraY = 0) {
        return {
            left: rect.left + window.scrollX + rect.width / 2 - elem.offsetWidth / 2 + params.offsetX,
            top: rect.top + window.scrollY + rect.height / 2 - elem.offsetHeight / 2 - params.offsetY - extraY
        };
    }
    function prepareDamageElement(targetId, damage, isCrit, onlyPassive, damageType) {
        const targetElem = document.getElementById(targetId);
        if (!targetElem) return null;

        return {
            trigger: () => {
                if (!onlyPassive && EnableSwitch.EnableHitAnima ) {
                    const shakeClass = isCrit ? 'hv-shake-crit' : 'hv-shake-normal';
                    targetElem.classList.add(shakeClass);
                    setTimeout(() => targetElem.classList.remove(shakeClass), cfg.Shake_Time);
                }
                if(EnableSwitch.EnableDamageNum){
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

                    setTimeout(() => damageTextPool.release(dmgElem), cfg.Damage_Lifetime);
                };
            }
        };
    }
    function parseBattleResult(paneCompletionHtml) {
        const match = paneCompletionHtml.match(/You (?:have run away|have been defeated|are victorious)!/);
        const imgMatch = paneCompletionHtml.match(/<img[^>]+\/y\/battle\/finishbattle\.png[^>]*>/i);
        if (imgMatch){
            const audioUrl = (match[0] === "You are victorious!") ? cfg.VictoryAudioUrl : cfg.FailedAudioUrl ;
            WoWplayer.play(audioUrl,0.3);
        }
    }
    function makeDraggable(el) {
        el.onmousedown = e => {
            const pos = { left: el.offsetLeft, top: el.offsetTop, x: e.x, y: e.y };
            window.onmousemove = e => {
                el.style.left = pos.left + e.x - pos.x + "px";
                el.style.top = pos.top + e.y - pos.y + "px";
            };
            window.onmouseup = () => {window.onmousemove = window.onmouseup = null};
        };
    }
    function createManagePanel(editor) {
        const pane = document.createElement("div");
        pane.id = "mlp_pane";
        pane.innerHTML = `
            <div id="mlp_box">
                <div>旋转 rotate：<input id="rotate" type="range" min="-180" max="180" step="1" value="${editor.data.rotate}"></div>
                <div>对比度 contrast：<input id="contrast" type="range" min="1" max="2" step="0.1" value="${editor.data.contrast}"></div>
                <div>锐化 unsharp：<input id="unsharp" type="range" min="0" max="50" step="0.1" value="${editor.data.unsharp}"></div>
                <div style="margin-top: 10px">验证图按下可拖动 / 滚轮可缩放</div>
            </div>`;
        document.body.appendChild(pane);
        makeDraggable(pane);
        document.getElementById("mlp_box").onmousedown = (e) => e.stopPropagation();
        ["rotate", "contrast", "unsharp"].forEach(k => {
            pane.querySelector("#" + k).oninput = e => {
                editor.data[k] = parseFloat(e.target.value);
                editor.updateImage();
            };
        });
        [pane, editor.img].forEach(el => {
            el.onwheel = e => {
                editor.data.scale = Math.max(0.1, editor.data.scale + (e.deltaY > 0 ? -0.1 : 0.1));
                editor.updateImage();
                e.preventDefault();
            };
        });
    }
})();
