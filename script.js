import { initCursor } from './modules/cursor.js';
import { initTheme } from './modules/theme.js';
import { initEasterEggs } from './modules/easterEggs.js';
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

    initCursor();

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

    initTheme();

    initEasterEggs();

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

    // --- Initialise Lazy Sub-Modules & API sync ---
    let toolsLoaded = false;
    let gamesLoaded = false;
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.id === 'calculator-view' && !toolsLoaded) {
                    toolsLoaded = true;
                    import('./modules/tools.js').then(m => m.initTools()).catch(e => console.error('Failed to load tools', e));
                }
                if (entry.target.id === 'games-view' && !gamesLoaded) {
                    gamesLoaded = true;
                    import('./modules/games.js').then(m => m.initGames()).catch(e => console.error('Failed to load games', e));
                }
            }
        });
    }, { rootMargin: '200px' });
    
    const calcView = document.getElementById('calculator-view');
    const gamesView = document.getElementById('games-view');
    if (calcView) lazyObserver.observe(calcView);
    if (gamesView) lazyObserver.observe(gamesView);

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
