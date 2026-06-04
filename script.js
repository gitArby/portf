/**
 * script.js - Application Orchestrator
 * Main entry point of the portfolio application.
 * Imports and coordinates UISelectors, AppState, Utilities, API triggers,
 * calculator Tools, and Minigames.
 */
import { UISelectors } from './modules/selectors.js';
import { AppState, subscribe } from './modules/state.js';
import { applyLanguage, generateCV, playClick, playHover, showHUDNotification } from './modules/utils.js';
import { connectLanyard, fetchLoLStats, renderFavoriteChampions } from './modules/api.js';
import { initTools } from './modules/tools.js';
import { initGames } from './modules/games.js';
import { i18n } from './modules/translations.js';

document.addEventListener('DOMContentLoaded', () => {
    // Funny message for curious devs pressing F12
    console.log('%c Nesahat a nekoukat :D ', 'color: #00ff66; font-size: 30px; font-weight: bold; text-shadow: 2px 2px 0 #000; background: #1a1a1a; padding: 10px; border-radius: 5px; border: 2px solid #00ff66;');

    // --- Initial Config & Boot Setup ---
    
    // Add glitch-hover class to all h3 headers for retro cybersecurity aesthetic
    document.querySelectorAll('h3').forEach(h3 => {
        h3.classList.add('glitch-hover');
    });

    // Run the terminal boot screen text sequences
    const bootLines = document.querySelectorAll('.terminal-text p');
    const bootScreen = document.getElementById('boot-screen');
    if (bootScreen && bootLines.length > 0) {
        let delay = 300;
        bootLines.forEach(line => {
            setTimeout(() => {
                line.style.opacity = '1';
            }, delay);
            delay += 600;
        });
        setTimeout(() => {
            bootScreen.classList.add('hidden');
            setTimeout(() => {
                bootScreen.style.display = 'none';
                const nav = UISelectors.mainNav;
                if (nav) nav.classList.add('visible');
            }, 800);
        }, delay + 800);
    } else {
        const nav = UISelectors.mainNav;
        if (nav) nav.classList.add('visible');
    }

    // --- Year Setter ---
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // --- Clipboard Email Copy ---
    const copyEmailBtn = document.getElementById('copy-email');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            navigator.clipboard.writeText('mackuadam37@gmail.com')
                .then(() => {
                    const toast = document.getElementById('copy-toast');
                    if (toast) {
                        toast.classList.add('visible');
                        setTimeout(() => toast.classList.remove('visible'), 2000);
                    }
                })
                .catch(err => {
                    console.error('Failed to copy email to clipboard', err);
                });
        });
    }

    // --- Scroll progress & Sticky Navigation Background ---
    const mainContentEl = UISelectors.mainContent;
    const isDesktop = () => window.innerWidth > 900;

    const onScroll = () => {
        const scrollY = isDesktop() && mainContentEl
            ? mainContentEl.scrollTop
            : window.scrollY;

        const progress = UISelectors.scrollProgress;
        if (progress) {
            const scrollable = isDesktop() && mainContentEl
                ? mainContentEl
                : document.documentElement;
            const maxScroll = scrollable.scrollHeight - scrollable.clientHeight;
            const pct = maxScroll > 0 ? scrollY / maxScroll : 0;
            progress.style.width = `${pct * 100}%`;
        }

        const nav = UISelectors.mainNav;
        if (nav) {
            nav.classList.toggle('scrolled', scrollY > 80);
        }
    };

    let scrollTicker = false;
    const tickedScroll = () => {
        if (!scrollTicker) {
            scrollTicker = true;
            requestAnimationFrame(() => {
                onScroll();
                scrollTicker = false;
            });
        }
    };

    if (mainContentEl) {
        mainContentEl.addEventListener('scroll', tickedScroll, { passive: true });
    }
    window.addEventListener('scroll', tickedScroll, { passive: true });

    // --- Hamburger Drawer Control ---
    const navToggle = UISelectors.navToggle;
    const navLinks = UISelectors.navLinks;
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            navToggle.classList.toggle('open');
        });
        navLinks.querySelectorAll('a').forEach(a => {
            a.addEventListener('click', () => {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
            });
        });
    }

    // --- Dynamic Subtitle Typewriter Effect ---
    const twEl = UISelectors.typewriter;
    let pIdx = 0, cIdx = 0, deleting = false;

    function type() {
        if (!twEl) return;
        const phrase = AppState.phrases[pIdx];
        if (!phrase) return; // fail-safe if AppState phrases are loading
        
        twEl.textContent = deleting ? phrase.slice(0, cIdx - 1) : phrase.slice(0, cIdx + 1);
        deleting ? cIdx-- : cIdx++;
        let delay = deleting ? 60 : 100;
        
        if (!deleting && cIdx === phrase.length) {
            delay = 2000;
            deleting = true;
        } else if (deleting && cIdx === 0) {
            deleting = false;
            pIdx = (pIdx + 1) % AppState.phrases.length;
            delay = 400;
        }
        setTimeout(type, delay);
    }
    if (twEl) {
        setTimeout(type, 2800);
    }

    // --- Reveal Observers & Stats Counters ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    let countersRun = false;
    function triggerCounters() {
        if (countersRun) return;
        const grid = document.querySelector('.counters-grid');
        if (!grid) return;
        
        grid.querySelectorAll('.counter-number').forEach(el => {
            const target = parseInt(el.getAttribute('data-target'), 10);
            const duration = 1800;
            const steps = duration / 16;
            let current = 0;
            
            const tick = () => {
                current = Math.min(current + target / steps, target);
                const formatLocale = AppState.currentLang === 'cs' ? 'cs-CZ' : 'en-US';
                el.textContent = Math.floor(current).toLocaleString(formatLocale);
                if (current < target) {
                    requestAnimationFrame(tick);
                }
            };
            tick();
        });
        countersRun = true;
    }

    // --- Custom Cursor coordination with coordinate lag physics ---
    const cursorDot = UISelectors.cursorDot;
    const cursorOutline = UISelectors.cursorOutline;
    const isMobileDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    if (cursorDot && cursorOutline) {
        let mx = 0, my = 0; // Target mouse coordinates
        let dotX = 0, dotY = 0; // Current dot positions
        let outlineX = 0, outlineY = 0; // Current outline positions
        let hasMoved = false;
        let showCustomCursor = true;

        const disableCustomCursor = () => {
            if (showCustomCursor) {
                showCustomCursor = false;
                document.documentElement.classList.add('show-system-cursor');
            }
        };

        const enableCustomCursor = () => {
            if (!showCustomCursor && !isMobileDevice) {
                showCustomCursor = true;
                document.documentElement.classList.remove('show-system-cursor');
                outlineX = mx;
                outlineY = my;
                dotX = mx;
                dotY = my;
            }
        };

        const scrollEl = UISelectors.mainContent;
        let cachedScrollElRight = scrollEl ? scrollEl.getBoundingClientRect().right : window.innerWidth;

        // Efficient ResizeObserver removes scrollbar layout reflows on mousemove
        const edgeObserver = new ResizeObserver(() => {
            cachedScrollElRight = scrollEl
                ? scrollEl.getBoundingClientRect().right
                : window.innerWidth;
        });
        if (scrollEl) edgeObserver.observe(scrollEl);
        window.addEventListener('resize', () => {
            cachedScrollElRight = scrollEl
                ? scrollEl.getBoundingClientRect().right
                : window.innerWidth;
        }, { passive: true });

        window.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;

            const nearScrollbar = e.clientX >= cachedScrollElRight - 17;
            if (nearScrollbar) {
                disableCustomCursor();
            } else {
                enableCustomCursor();
            }

            if (!hasMoved) {
                dotX = mx;
                dotY = my;
                outlineX = mx;
                outlineY = my;
                hasMoved = true;
                cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
                cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
                requestAnimationFrame(() => {
                    document.documentElement.classList.add('cursor-active');
                });
            }
        }, { passive: true });

        document.addEventListener('mouseleave', disableCustomCursor);
        document.addEventListener('mouseenter', enableCustomCursor);

        // Bind cursor hover feedback to elements on startup
        document.querySelectorAll('a, button, summary, .discord-badge, #mega-trigger, .topo-node, select, input, label').forEach(el => {
            el.addEventListener('mouseover', () => {
                cursorDot.classList.add('active');
                cursorOutline.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('active');
                cursorOutline.classList.remove('active');
            });
        });

        // Animation frame loops executing coordinate lags
        (function animLoop() {
            if (hasMoved) {
                dotX = mx;
                dotY = my;
                outlineX += (mx - outlineX) * 0.15;
                outlineY += (my - outlineY) * 0.15;

                cursorDot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
                cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animLoop);
        })();
    }

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

    // --- View switcher ---
    const allViews = document.querySelectorAll('.dashboard-view');
    const allNavLinks = document.querySelectorAll('.nav-links a, .nav-logo');

    function switchView(targetId) {
        const targetView = document.getElementById(targetId);
        if (!targetView) return;

        localStorage.setItem('activeTab', targetId);

        allViews.forEach(view => {
            view.classList.remove('active');
        });
        targetView.classList.add('active');

        if (mainContentEl && window.innerWidth > 900) {
            mainContentEl.scrollTop = 0;
        } else {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }

        allNavLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('active', href === `#${targetId}` || (targetId === 'home-view' && link.classList.contains('nav-logo')));
        });

        targetView.querySelectorAll('.reveal, .reveal-card, .reveal-stagger').forEach(el => {
            el.classList.add('active');
        });

        if (targetId === 'home-view') {
            triggerCounters();
        }
    }

    // Event delegation hooks capturing view changes
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href');
        if (href && href.startsWith('#') && href.endsWith('-view')) {
            e.preventDefault();
            const targetId = href.substring(1);
            switchView(targetId);

            if (navLinks && navLinks.classList.contains('open')) {
                navLinks.classList.remove('open');
                if (navToggle) navToggle.classList.remove('open');
            }
        }
    });

    const savedTab = localStorage.getItem('activeTab') || 'home-view';
    switchView(savedTab);

    // --- Audio Control panel and global sound triggers ---
    const audioToggleBtn = UISelectors.audioToggle;
    const audioIcon = UISelectors.audioIcon;

    function updateAudioIcon() {
        if (!audioToggleBtn) return;
        if (audioIcon) {
            audioIcon.className = AppState.audioEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        }
        audioToggleBtn.classList.toggle('audio-on', AppState.audioEnabled);
    }

    if (audioToggleBtn) {
        audioToggleBtn.addEventListener('click', () => {
            AppState.audioEnabled = !AppState.audioEnabled;
            localStorage.setItem('audio', AppState.audioEnabled);
            updateAudioIcon();
            if (AppState.audioEnabled) {
                setTimeout(playClick, 50);
            }
        });
    }

    const audioSelector = 'a, button, .discord-badge, .project-card, .tech-icon, .cert-card, .timeline-item, .topo-node';
    
    document.body.addEventListener('click', e => {
        if (e.target.closest(audioSelector)) {
            playClick();
        }
    });

    document.body.addEventListener('mouseover', e => {
        const target = e.target.closest(audioSelector);
        if (target) {
            if (e.relatedTarget && e.relatedTarget.closest(audioSelector) === target) {
                return; // Prevent duplicate hovers from overlapping children
            }
            playHover();
        }
    });

    updateAudioIcon();

    // --- Language Switches ---
    const langToggleBtn = document.getElementById('lang-toggle');
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', () => {
            const nextLang = AppState.currentLang === 'cs' ? 'en' : 'cs';
            AppState.currentLang = nextLang;
        });
    }

    // Subscribe to language changes so UI is updated automatically
    subscribe('currentLang', (newLang) => {
        applyLanguage(newLang);
    });

    // --- CV Print ---
    const cvBtn = document.getElementById('btn-hero-cv');
    if (cvBtn) {
        cvBtn.addEventListener('click', (e) => {
            e.preventDefault();
            generateCV(AppState.currentLang);
        });
    }

    // --- Professional Experience Timeline Filters ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (filterBtns.length > 0 && timelineItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const filterVal = btn.getAttribute('data-filter');
                timelineItems.forEach(item => {
                    if (filterVal === 'all' || item.classList.contains(filterVal)) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    }

    // --- Contact Form ---
    const contactForm = UISelectors.contactForm;
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = UISelectors.formName ? UISelectors.formName.value : '';
            const email = UISelectors.formEmail ? UISelectors.formEmail.value : '';
            const message = UISelectors.formMessage ? UISelectors.formMessage.value : '';
            
            const isCs = AppState.currentLang === 'cs';
            const alertMsg = isCs 
                ? 'Zpráva byla připravena! Otevírám poštovního klienta...' 
                : 'Message prepared! Opening email client...';
                
            showHUDNotification(alertMsg, 'success');
            
            setTimeout(() => {
                const subject = encodeURIComponent(`Kontakt z portfolia od ${name}`);
                const body = encodeURIComponent(`Jméno: ${name}\nE-mail: ${email}\n\nZpráva:\n${message}`);
                window.location.href = `mailto:mackuadam37@gmail.com?subject=${subject}&body=${body}`;
                contactForm.reset();
            }, 600);
        });
    }

    // --- Theme Selector ---
    const themeDots = UISelectors.themeDots;
    const customColorPicker = document.getElementById('custom-color-picker');

    function hexToRgbString(hex) {
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
            c= hex.substring(1).split('');
            if(c.length== 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return [(c>>16)&255, (c>>8)&255, c&255].join(', ');
        }
        return '0, 255, 102';
    }

    function hexToRgba(hex, alpha) {
        return `rgba(${hexToRgbString(hex)}, ${alpha})`;
    }

    function applyTheme(themeName, customHex = null) {
        document.documentElement.setAttribute('data-theme', themeName);
        AppState.activeTheme = themeName;
        localStorage.setItem('theme', themeName);
        
        if (themeName === 'custom' && customHex) {
            document.documentElement.style.setProperty('--accent-color', customHex);
            document.documentElement.style.setProperty('--accent-color-rgb', hexToRgbString(customHex));
            document.documentElement.style.setProperty('--accent-color-glow', hexToRgba(customHex, 0.4));
            localStorage.setItem('customThemeColor', customHex);
            if (customColorPicker) {
                customColorPicker.value = customHex;
            }
        } else {
            document.documentElement.style.removeProperty('--accent-color');
            document.documentElement.style.removeProperty('--accent-color-rgb');
            document.documentElement.style.removeProperty('--accent-color-glow');
        }
        
        if (themeDots) {
            themeDots.forEach(dot => {
                dot.classList.toggle('active', dot.getAttribute('data-theme') === themeName);
            });
        }
    }

    const customColorPopover = document.getElementById('custom-color-popover');
    const customHueSlider = document.getElementById('custom-hue-slider');
    const customLightnessSlider = document.getElementById('custom-lightness-slider');
    const customColorPreview = document.getElementById('custom-color-preview');
    const btnCustomTheme = document.getElementById('btn-custom-theme');

    function hslToHex(h, s, l) {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    function updateCustomColor(save = false) {
        if (!customHueSlider || !customLightnessSlider) return;
        const h = customHueSlider.value;
        const l = customLightnessSlider.value;
        const hex = hslToHex(h, 100, l);
        const pureHue = hslToHex(h, 100, 50);

        if (customColorPreview) customColorPreview.style.backgroundColor = hex;
        customLightnessSlider.style.background = `linear-gradient(to right, #000000 0%, ${pureHue} 50%, #ffffff 100%)`;
        
        applyTheme('custom', hex);
        if (save) {
            localStorage.setItem('customThemeHue', h);
            localStorage.setItem('customThemeLightness', l);
            // We also save the hex so existing app logic works
            localStorage.setItem('customThemeColor', hex);
        }
    }

    if (btnCustomTheme && customColorPopover) {
        btnCustomTheme.addEventListener('click', (e) => {
            e.stopPropagation();
            customColorPopover.classList.toggle('show');
            const savedH = localStorage.getItem('customThemeHue');
            const savedL = localStorage.getItem('customThemeLightness');
            if (savedH && customHueSlider) customHueSlider.value = savedH;
            if (savedL && customLightnessSlider) customLightnessSlider.value = savedL;
            updateCustomColor(false);
        });

        document.addEventListener('click', (e) => {
            if (!customColorPopover.contains(e.target) && !btnCustomTheme.contains(e.target)) {
                customColorPopover.classList.remove('show');
            }
        });
    }

    if (customHueSlider) customHueSlider.addEventListener('input', () => updateCustomColor(true));
    if (customLightnessSlider) customLightnessSlider.addEventListener('input', () => updateCustomColor(true));

    if (themeDots) {
        themeDots.forEach(dot => {
            dot.addEventListener('click', () => {
                const selectedTheme = dot.getAttribute('data-theme');
                if (selectedTheme !== 'custom') {
                    applyTheme(selectedTheme);
                    if (customColorPopover) customColorPopover.classList.remove('show');
                }
            });
        });
    }

    // Initialize theme from storage
    if (AppState.activeTheme === 'custom') {
        const savedCustom = localStorage.getItem('customThemeColor') || '#00ff66';
        applyTheme('custom', savedCustom);
    } else {
        applyTheme(AppState.activeTheme);
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

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Optional: Close all other items
            faqItems.forEach(i => i.classList.remove('active'));

            if (!isActive) {
                item.classList.add('active');
            }
            playClick(); // Play sound on toggle
        });
    });

    // --- Initialise Sub-Modules & API sync ---
    initTools();
    initGames();
    applyLanguage(AppState.currentLang);

    // Fire safe Lanyard websocket connections and LoL profile requests
    connectLanyard();
    fetchLoLStats();
    renderFavoriteChampions(AppState.currentLang);

    // Show initial Easter Egg tracker hint
    setTimeout(() => {
        const lang = AppState.currentLang || localStorage.getItem('lang') || 'cs';
        const hint = i18n[lang]?.easterEggs?.hint || "Zmáčkni <b>F</b> pro zobrazení tajných Easter Eggů";
        showHUDNotification(hint, "info");
    }, 1500); // slight delay after boot screen
});
