import { UISelectors } from './selectors.js';
import { AppState, subscribe } from './state.js';
import { i18n } from './translations.js';
import { playClick } from './utils.js';

export function initEasterEggs() {
    // --- Matrix Easter Egg rain ---
    const megaTrigger = UISelectors.megaTrigger;
    const easterEggCanvas = UISelectors.easterEggCanvas;
    let clickCount = 0;
    let lastClickTime = 0;
    let matrixInterval = null;

    if (megaTrigger && easterEggCanvas) {
        const ctx = easterEggCanvas.getContext('2d');

        megaTrigger.addEventListener('click', () => {
            const now = Date.now();
            clickCount = now - lastClickTime < 500 ? clickCount + 1 : 1;
            lastClickTime = now;
            if (clickCount === 6) {
                startEasterEgg();
                clickCount = 0;
            }
        });

        function startEasterEgg() {
            easterEggCanvas.style.display = 'block';
            resizeCanvas();
            window.addEventListener('resize', resizeCanvas);
            const drops = Array.from({ length: Math.floor(easterEggCanvas.width / 20) }, () => 1);
            const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZPENTAKILLlol🏆";

            matrixInterval = setInterval(() => {
                ctx.fillStyle = "rgba(10,10,10,0.05)";
                ctx.fillRect(0, 0, easterEggCanvas.width, easterEggCanvas.height);
                ctx.fillStyle = "#00ff66";
                ctx.font = "20px var(--font-main)";
                drops.forEach((y, i) => {
                    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], i * 20, y * 20);
                    if (y * 20 > easterEggCanvas.height && Math.random() > 0.975) {
                        drops[i] = 0;
                    }
                    drops[i]++;
                });
            }, 35);

            setTimeout(() => {
                clearInterval(matrixInterval);
                easterEggCanvas.style.display = 'none';
                window.removeEventListener('resize', resizeCanvas);
            }, 5000);
        }

        function resizeCanvas() {
            easterEggCanvas.width = window.innerWidth;
            easterEggCanvas.height = window.innerHeight;
        }
    }

    // --- Easter Egg Tracker ---
    const eggTrackerWidget = document.getElementById('egg-tracker-widget');
    const eggCountSpan = document.getElementById('egg-tracker-count');
    const totalEggs = 4;

    function updateEggUI() {
        if (!eggTrackerWidget) return;
        const count = AppState.foundEggs.length;
        eggCountSpan.textContent = `${count}/${totalEggs}`;
        if (count >= totalEggs) {
            eggTrackerWidget.classList.add('complete');
        }
        const lang = AppState.currentLang || localStorage.getItem('lang') || 'cs';
        const titleMsg = i18n[lang]?.easterEggs?.trackerTitle || 'Odhaleno tajných Easter Eggů:';
        eggTrackerWidget.title = `${titleMsg} ${count}/${totalEggs}`;
    }

    function discoverEgg(eggId) {
        if (!AppState.foundEggs.includes(eggId)) {
            AppState.foundEggs.push(eggId);
            localStorage.setItem('foundEggs', JSON.stringify(AppState.foundEggs));
            updateEggUI();
            
            const toast = document.createElement('div');
            toast.className = 'type-falling-word';
            toast.style.position = 'fixed';
            toast.style.bottom = '80px';
            toast.style.right = '20px';
            toast.style.zIndex = '9999';
            toast.style.pointerEvents = 'none';
            toast.style.transform = 'none';
            const lang = AppState.currentLang || localStorage.getItem('lang') || 'cs';
            const foundMsg = i18n[lang]?.easterEggs?.found || '🎉 Skrytý Easter Egg nalezen!';
            toast.innerHTML = `${foundMsg} (${AppState.foundEggs.length}/${totalEggs})`;
            document.body.appendChild(toast);
            
            if (AppState.audioEnabled && AppState.audioCtx) {
                const osc = AppState.audioCtx.createOscillator();
                const gain = AppState.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, AppState.audioCtx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(1760, AppState.audioCtx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.1, AppState.audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, AppState.audioCtx.currentTime + 0.5);
                osc.connect(gain);
                gain.connect(AppState.audioCtx.destination);
                osc.start();
                osc.stop(AppState.audioCtx.currentTime + 0.5);
            }

            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 0.5s ease';
                setTimeout(() => toast.remove(), 500);
            }, 3000);

            if (AppState.foundEggs.length === totalEggs) {
                setTimeout(() => {
                    const allFoundMsg = i18n[lang]?.easterEggs?.allFound || 'Neskutečné! Našel jsi všechny 4 skryté Easter Eggy. Jsi opravdový lovec pokladů! 🏆';
                    alert(allFoundMsg);
                }, 1000);
            }
        }
    }

    updateEggUI();
    subscribe('currentLang', updateEggUI);

    const eggTatranka = document.getElementById('egg-tatranka');
    if (eggTatranka) {
        eggTatranka.addEventListener('mouseenter', () => discoverEgg('tatranka'));
        eggTatranka.addEventListener('click', () => discoverEgg('tatranka'));
    }

    const eggPcbs = document.getElementById('egg-pcbs');
    if (eggPcbs) {
        eggPcbs.addEventListener('mouseenter', () => discoverEgg('pcbs'));
        eggPcbs.addEventListener('click', () => discoverEgg('pcbs'));
    }

    const eggLol = document.getElementById('egg-lol');
    if (eggLol) {
        eggLol.addEventListener('mouseenter', () => discoverEgg('lol'));
        eggLol.addEventListener('click', () => discoverEgg('lol'));
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C'))) {
            discoverEgg('f12');
        }
        if ((e.key === 'f' || e.key === 'F') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            if (eggTrackerWidget) eggTrackerWidget.classList.toggle('hidden');
        }
    });

    // --- Arby Ipsum Generator ---
    const btnGenerateIpsum = document.getElementById('btn-generate-ipsum');
    const btnCopyIpsum = document.getElementById('btn-copy-ipsum');
    const inputIpsumParagraphs = document.getElementById('ipsum-paragraphs');
    const ipsumOutput = document.getElementById('ipsum-output');

    const arbyDictionary = [
        "RGB", "vodní chlazení", "airflow", "teplovodivá pasta", "mechanická klávesnice", 
        "overclocking", "ping", "lagy", "Valorant", "headshot", "League of Legends", 
        "Cisco router", "switch", "bottleneck", "základní deska", "FPS drop", 
        "cable management", "cybersecurity", "server", "grafická karta", "monitor", 
        "refresh rate", "BIOS", "síťařina", "Nexus", "CS:GO", "harddisk", "SSD",
        "custom loop", "mechovka", "cherry mx", "DPI"
    ];

    function generateArbyIpsum(paragraphs) {
        let text = "";
        for (let i = 0; i < paragraphs; i++) {
            let pText = "";
            let sentenceCount = Math.floor(Math.random() * 4) + 4; // 4 to 7 sentences
            for (let s = 0; s < sentenceCount; s++) {
                let wordCount = Math.floor(Math.random() * 6) + 5; // 5 to 10 words
                let sentence = [];
                for (let w = 0; w < wordCount; w++) {
                    let word = arbyDictionary[Math.floor(Math.random() * arbyDictionary.length)];
                    // Randomly highlight some words
                    if (Math.random() > 0.85) word = `<span class="highlight">${word}</span>`;
                    sentence.push(word);
                }
                let sentenceStr = sentence.join(" ");
                // Strip HTML for capitalization
                let cleanStr = sentenceStr.replace(/<[^>]*>?/gm, '');
                let firstChar = cleanStr.charAt(0);
                // Simple capitalization that ignores the span tags
                sentenceStr = sentenceStr.replace(firstChar, firstChar.toUpperCase()) + ".";
                pText += sentenceStr + " ";
            }
            text += `<p>${pText.trim()}</p>`;
        }
        return text;
    }

    if (btnGenerateIpsum) {
        btnGenerateIpsum.addEventListener('click', () => {
            const num = parseInt(inputIpsumParagraphs.value) || 3;
            ipsumOutput.innerHTML = generateArbyIpsum(Math.min(Math.max(num, 1), 20));
            ipsumOutput.dataset.generated = 'true';
            playClick();
        });
    }

    if (btnCopyIpsum) {
        btnCopyIpsum.addEventListener('click', () => {
            if (ipsumOutput.innerText.trim() !== "" && !ipsumOutput.innerText.includes("Klikni na tlačítko")) {
                navigator.clipboard.writeText(ipsumOutput.innerText).then(() => {
                    const originalText = btnCopyIpsum.innerHTML;
                    btnCopyIpsum.innerHTML = '<i class="fa-solid fa-check"></i> Zkopírováno!';
                    setTimeout(() => {
                        btnCopyIpsum.innerHTML = originalText;
                    }, 2000);
                });
                playClick();
            }
        });
    }
}
