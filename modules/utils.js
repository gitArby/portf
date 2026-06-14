/**
 * Utils Module
 * Contains helper functions for audio feedback, HUD notifications,
 * localization processing, and CV printing.
 */
import { AppState } from './state.js';
import { UISelectors } from './selectors.js';
import { i18n } from './translations.js';

/**
 * Resolve or initialize AudioContext safely on user interaction.
 * @returns {AudioContext} Active AudioContext instance
 */
let hasUserInteracted = false;
window.addEventListener('click', () => { hasUserInteracted = true; }, { once: true });
window.addEventListener('keydown', () => { hasUserInteracted = true; }, { once: true });

function getCtx() {
    // Prevent creating AudioContext on 'mouseover' before a valid user gesture
    if (!hasUserInteracted) return null;
    
    if (!AppState.audioCtx) {
        AppState.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return AppState.audioCtx;
}

/**
 * Synthesize a clicking chime for UI interaction feedback.
 */
export function playClick() {
    if (!AppState.audioEnabled) return;
    try {
        const ctx = getCtx();
        if (!ctx) return;
        ctx.resume().then(() => {
            const now = ctx.currentTime;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(100, now + 0.04);
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        });
    } catch (e) {
        console.warn('Audio click synth failed', e);
    }
}

/**
 * Synthesize a subtle hover chirp for UI elements.
 */
export function playHover() {
    if (!AppState.audioEnabled) return;
    try {
        const ctx = getCtx();
        if (!ctx) return;
        ctx.resume().then(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = 300;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.06);
        });
    } catch (e) {
        console.warn('Audio hover synth failed', e);
    }
}

/**
 * Synthesize success or error tones.
 * @param {string} type - 'success', 'error', or default beep
 */
export function playNotificationSound(type) {
    if (!AppState.audioEnabled) return;
    try {
        const ctx = getCtx();
        if (!ctx) return;
        ctx.resume().then(() => {
            const now = ctx.currentTime;
            const osc1 = ctx.createOscillator();
            const gain = ctx.createGain();
            
            if (type === 'error') {
                // Two-tone warning alert (150Hz -> 100Hz)
                osc1.frequency.setValueAtTime(150, now);
                osc1.frequency.setValueAtTime(100, now + 0.1);
                gain.gain.setValueAtTime(0.3, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc1.connect(gain);
                gain.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.25);
            } else if (type === 'success') {
                // Happy success chime (600Hz -> 900Hz)
                osc1.frequency.setValueAtTime(600, now);
                osc1.frequency.setValueAtTime(900, now + 0.08);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
                osc1.connect(gain);
                gain.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.3);
            } else {
                // Default tech beep
                osc1.frequency.setValueAtTime(800, now);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc1.connect(gain);
                gain.connect(ctx.destination);
                osc1.start(now);
                osc1.stop(now + 0.15);
            }
        });
    } catch (e) {
        console.warn('Audio notification synth failed', e);
    }
}

/**
 * Centralized error handler to gracefully manage application failures.
 * Prevents complete app crashes and notifies the user.
 * 
 * @param {Error|string} error - The caught error object or message.
 * @param {string} context - A description of where the error occurred.
 */
export function handleAppError(error, context) {
    console.error(`[App Error] ${context}:`, error);
    
    // Determine language for error message
    const lang = AppState.currentLang || 'cs';
    const msg = lang === 'cs' ? `Chyba: ${context}` : `Error: ${context}`;
    
    showHUDNotification(msg, 'error');
}

/**
 * Executes a function within an Error Boundary.
 * If the function throws an error, it catches it, logs it, and displays a friendly fallback HTML in the container.
 * @param {string} containerId - The DOM ID of the container
 * @param {Function} executeFn - The async function to execute
 * @param {string} fallbackHtml - The HTML to inject on failure
 */
export async function withErrorBoundary(containerId, executeFn, fallbackHtml) {
    const container = document.getElementById(containerId);
    try {
        await executeFn();
    } catch (error) {
        console.error(`[Error Boundary] Selhání v kontejneru ${containerId}:`, error);
        if (container) {
            container.innerHTML = fallbackHtml || `
                <div class="error-fallback reveal-card" style="padding: 2rem; text-align: center; color: var(--arbyy-error);">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>Komponentu se nepodařilo načíst.</p>
                </div>`;
        }
        handleAppError(error, `Modul ${containerId}`);
    }
}

/**
 * Show terminal HUD popup notification.
 * 
 * @param {string} message - Notification text
 * @param {string} type - 'info', 'success', or 'error'
 */
export function showHUDNotification(message, type = 'info') {
    const container = document.getElementById('hud-notifier-container');
    if (!container) return;

    const popup = document.createElement('div');
    popup.className = `hud-popup ${type}`;
    
    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';

    popup.innerHTML = `
        <i class="${iconClass} hud-icon"></i>
        <div class="hud-message">${message}</div>
        <button class="hud-close"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(popup);
    playNotificationSound(type);

    const closeBtn = popup.querySelector('.hud-close');
    const dismiss = () => {
        if (popup.classList.contains('dismissing')) return;
        popup.classList.add('dismissing');
        popup.addEventListener('animationend', () => {
            popup.remove();
        });
    };
    
    closeBtn.addEventListener('click', dismiss);
    setTimeout(dismiss, 5000);
}

/**
 * Translate the page static texts based on the selected language.
 * This is triggered by a state subscription to 'currentLang'.
 * 
 * @param {string} lang - Language code ('cs' or 'en')
 */
export function applyLanguage(lang) {
    const t = i18n[lang];
    if (!t) return;

    // Nav bar elements
    document.querySelectorAll('.nav-links a').forEach((a, i) => {
        const span = a.querySelector('span');
        if (span && t.nav[i]) span.textContent = t.nav[i];
    });

    // Swapping phrases in AppState typewriter pool
    AppState.phrases.length = 0;
    t.subtitle.forEach(p => AppState.phrases.push(p));

    // Hero action buttons
    const contactBtn = document.getElementById('btn-hero-contact');
    if (contactBtn) contactBtn.textContent = t.hero.contactBtn;

    const cvBtn = document.getElementById('btn-hero-cv');
    if (cvBtn) cvBtn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> ${t.hero.cvBtn}`;

    // About section details
    const aboutH3 = document.querySelector('#about h3');
    if (aboutH3) aboutH3.textContent = t.about.title;

    const aboutP = document.querySelector('#about p');
    if (aboutP) aboutP.innerHTML = t.about.text;

    const locLabel = document.querySelector('.about-meta .meta-item:nth-child(1) .meta-label');
    if (locLabel) locLabel.textContent = t.about.locationLabel;
    const locVal = document.querySelector('.about-meta .meta-item:nth-child(1) .meta-value');
    if (locVal) locVal.textContent = t.about.locationValue;

    const langLabel = document.querySelector('.about-meta .meta-item:nth-child(2) .meta-label');
    if (langLabel) langLabel.textContent = t.about.languagesLabel;
    const langVal = document.querySelector('.about-meta .meta-item:nth-child(2) .meta-value');
    if (langVal) langVal.textContent = t.about.languagesValue;

    // Skills section details
    const skillsH3 = document.querySelector('#skills h3');
    if (skillsH3) skillsH3.textContent = t.skills.title;

    const skillsText = document.querySelector('#skills .container-text');
    if (skillsText) skillsText.innerHTML = t.skills.text;

    const catTitles = document.querySelectorAll('.skills-category-card .category-title');
    if (catTitles[0]) catTitles[0].textContent = t.skills.catWeb;
    if (catTitles[1]) catTitles[1].textContent = t.skills.catNet;
    if (catTitles[2]) catTitles[2].textContent = t.skills.catSys;

    const ids = ['diag', 'os', 'support', 'office', 'photoshop', 'php', 'ai', 'jellyfin', 'oop', 'graphs', 'pcbs', 'apache', 'pma'];
    ids.forEach(id => {
        const el = document.getElementById(`skill-${id}`);
        if (el && t.skills[id]) el.textContent = t.skills[id];
    });

    // Certificates
    const certsH3 = document.querySelector('#certificates h3');
    if (certsH3) certsH3.textContent = t.certs.title;
    const certsText = document.querySelector('#certificates .container-text');
    if (certsText) certsText.textContent = t.certs.subtitle;

    const certCards = document.querySelectorAll('.cert-card');
    if (certCards[0]) {
        const h4 = certCards[0].querySelector('.cert-name');
        const p = certCards[0].querySelector('.cert-desc');
        const status = certCards[0].querySelector('.status-label');
        if (h4) h4.textContent = t.certs.ccna1.title;
        if (p) p.textContent = t.certs.ccna1.desc;
        if (status) status.innerHTML = `<i class="fa-solid fa-check-double"></i> ${t.certs.status}`;
    }
    if (certCards[1]) {
        const h4 = certCards[1].querySelector('.cert-name');
        const p = certCards[1].querySelector('.cert-desc');
        const status = certCards[1].querySelector('.status-label');
        if (h4) h4.textContent = t.certs.ccna2.title;
        if (p) p.textContent = t.certs.ccna2.desc;
        if (status) status.innerHTML = `<i class="fa-solid fa-check-double"></i> ${t.certs.status}`;
    }
    if (certCards[2]) {
        const h4 = certCards[2].querySelector('.cert-name');
        const p = certCards[2].querySelector('.cert-desc');
        const status = certCards[2].querySelector('.status-label');
        if (h4) h4.textContent = t.certs.sololearn.title;
        if (p) p.textContent = t.certs.sololearn.desc;
        if (status) status.innerHTML = `<i class="fa-solid fa-check-double"></i> ${t.certs.status}`;
    }
    if (certCards[3]) {
        const h4 = certCards[3].querySelector('.cert-name');
        const p = certCards[3].querySelector('.cert-desc');
        const status = certCards[3].querySelector('.status-label');
        if (h4) h4.textContent = t.certs.lol.title;
        if (p) p.textContent = t.certs.lol.desc;
        if (status) status.innerHTML = `<i class="fa-solid fa-crown"></i> ${t.certs.lol.status}`;
    }

    // Timeline/Experience
    const expH3 = document.querySelector('#experience h3');
    if (expH3) expH3.textContent = t.timeline.title;
    const expText = document.querySelector('#experience .container-text');
    if (expText) expText.textContent = t.timeline.subtitle;

    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems[0]) {
        const h4 = timelineItems[0].querySelector('.timeline-title');
        const sub = timelineItems[0].querySelector('.timeline-subtitle');
        const desc = timelineItems[0].querySelector('.timeline-desc');
        if (h4) h4.textContent = t.timeline.edu1.title;
        if (sub) sub.textContent = t.timeline.edu1.sub;
        if (desc) desc.textContent = t.timeline.edu1.desc;
    }
    if (timelineItems[1]) {
        const date = timelineItems[1].querySelector('.timeline-date');
        const h4 = timelineItems[1].querySelector('.timeline-title');
        const sub = timelineItems[1].querySelector('.timeline-subtitle');
        const desc = timelineItems[1].querySelector('.timeline-desc');
        if (date) date.textContent = t.timeline.exp1.date;
        if (h4) h4.textContent = t.timeline.exp1.title;
        if (sub) sub.textContent = t.timeline.exp1.sub;
        if (desc) desc.textContent = t.timeline.exp1.desc;
    }
    if (timelineItems[2]) {
        const date = timelineItems[2].querySelector('.timeline-date');
        const h4 = timelineItems[2].querySelector('.timeline-title');
        const sub = timelineItems[2].querySelector('.timeline-subtitle');
        const desc = timelineItems[2].querySelector('.timeline-desc');
        if (date) date.textContent = t.timeline.exp2.date;
        if (h4) h4.textContent = t.timeline.exp2.title;
        if (sub) sub.textContent = t.timeline.exp2.sub;
        if (desc) desc.textContent = t.timeline.exp2.desc;
    }

    // Projects Grid
    const projH3 = document.querySelector('#projects h3');
    if (projH3) projH3.textContent = t.projects.title;

    const projText = document.querySelector('#projects .proj-text');
    if (projText) projText.innerHTML = t.projects.text;

    const cards = document.querySelectorAll('.project-card');
    if (cards[0]) {
        const h4 = cards[0].querySelector('h4');
        const p = cards[0].querySelector('p');
        const badge = cards[0].querySelector('.wip-badge');
        const hintDet = cards[0].querySelector('.hint-det a');
        const hintGf = cards[0].querySelector('.hint-gf a');
        if (h4) h4.textContent = t.projects.c1t;
        if (p) p.textContent = t.projects.c1d;
        if (badge) badge.textContent = t.projects.c1badge;
        if (hintDet) hintDet.innerHTML = `${t.projects.c1hintDet} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
        if (hintGf) hintGf.innerHTML = `${t.projects.c1hintGf} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
    }
    if (cards[1]) {
        const h4 = cards[1].querySelector('h4');
        const p = cards[1].querySelector('p');
        const badge = cards[1].querySelector('.wip-badge');
        const hint = cards[1].querySelector('.project-link-hint');
        if (h4) h4.textContent = t.projects.c2t;
        if (p) p.textContent = t.projects.c2d;
        if (badge) badge.textContent = t.projects.c2badge;
        if (hint) hint.innerHTML = `${t.projects.c2hint} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
    }
    if (cards[2]) {
        const h4 = cards[2].querySelector('h4');
        const p = cards[2].querySelector('p');
        const badge = cards[2].querySelector('.wip-badge');
        const hint = cards[2].querySelector('.project-link-hint');
        if (h4) h4.textContent = t.projects.c3t;
        if (p) p.textContent = t.projects.c3d;
        if (badge) badge.textContent = t.projects.c3badge;
        if (hint) hint.innerHTML = `${t.projects.c3hint} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
    }
    if (cards[3]) {
        const h4 = cards[3].querySelector('h4');
        const p = cards[3].querySelector('p');
        const badge = cards[3].querySelector('.wip-badge');
        const hint = cards[3].querySelector('.project-link-hint a');
        const summary = cards[3].querySelector('.details-summary');
        const step1 = cards[3].querySelector('.step-1');
        const step2 = cards[3].querySelector('.step-2');
        const step3 = cards[3].querySelector('.step-3');
        const controls = cards[3].querySelector('.details-controls');

        if (h4) h4.textContent = t.projects.c4t;
        if (p) p.textContent = t.projects.c4d;
        if (badge) badge.textContent = t.projects.c4badge;
        if (hint) hint.innerHTML = `${t.projects.c4hint} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;
        if (summary) summary.textContent = t.projects.c4summary;
        if (step1) step1.innerHTML = `${t.projects.c4step1} <a href="https://github.com/gitArby/mamradautomaty" target="_blank">GitHubu</a>.`;
        if (step2) step2.textContent = t.projects.c4step2;
        if (step3) step3.innerHTML = `${t.projects.c4step3} <code>gamble.exe</code>.`;
        if (controls) controls.innerHTML = t.projects.c4controls;
    }
    if (cards[4]) {
        const h4 = cards[4].querySelector('h4');
        const p = cards[4].querySelector('p');
        if (h4) h4.textContent = t.projects.c5t;
        if (p) p.textContent = t.projects.c5d;
    }
    if (cards[5]) {
        const h4 = cards[5].querySelector('h4');
        const p = cards[5].querySelector('p');
        if (h4) h4.textContent = t.projects.c6t;
        if (p) p.textContent = t.projects.c6d;
    }

    const projMoreText = document.getElementById('projects-more-text');
    if (projMoreText) projMoreText.textContent = t.projects.cMoreText;
    const projGithubBtn = document.getElementById('btn-projects-github');
    if (projGithubBtn) projGithubBtn.innerHTML = `<i class="fa-brands fa-github"></i> ${t.projects.cMoreBtn}`;

    // Contact
    const contactH3 = document.querySelector('#contact h3');
    if (contactH3) contactH3.textContent = t.contact.title;

    const contactText = document.querySelector('#contact .contact-text');
    if (contactText) contactText.textContent = t.contact.text;

    document.querySelectorAll('.counter-label').forEach((el, i) => {
        if (t.counters[i]) el.textContent = t.counters[i];
    });

    const optCs = document.getElementById('opt-cs');
    const optEn = document.getElementById('opt-en');
    if (optCs) optCs.classList.toggle('active', lang === 'cs');
    if (optEn) optEn.classList.toggle('active', lang === 'en');

    // Calculator selector labels
    const selectors = ['calcTitle', 'calcSubtitle', 'tabSubnet', 'tabRaid', 'tabPsu', 'tabPassword', 'tabMath', 'lblSubnetIp', 'resMask', 'resNet', 'resBroadcast', 'resRange', 'resHosts', 'resWildcard', 'binHdr', 'lblRaidDisks', 'lblRaidCapacity', 'resRaidUsable', 'resRaidLost', 'resRaidFault', 'resRaidRead', 'resRaidWrite', 'lblPsuCpu', 'lblPsuGpu', 'lblPsuRam', 'lblPsuDrives', 'lblPsuFans', 'lblPsuOc', 'resPsuEst', 'resPsuRec', 'resPsuEff', 'lblPwdLower', 'lblPwdUpper', 'lblPwdDigits', 'lblPwdSymbols', 'resPwdStrength', 'hashHdr', 'btnTypeReset'];
    selectors.forEach(sel => {
        const el = UISelectors[sel];
        const translationKey = sel.startsWith('lbl') || sel.startsWith('res') || sel.startsWith('tab') || sel.startsWith('btn')
            ? sel[0].toLowerCase() + sel.slice(1)
            : sel;
        if (el && t.calculator[translationKey]) el.textContent = t.calculator[translationKey];
    });

    if (UISelectors.lblSubnetCidr) {
        const span = UISelectors.lblSubnetCidr.querySelector('span');
        UISelectors.lblSubnetCidr.innerHTML = `${t.calculator.subnetCidr} `;
        if (span) UISelectors.lblSubnetCidr.appendChild(span);
    }
    if (UISelectors.lblRaidLevel) {
        UISelectors.lblRaidLevel.textContent = t.calculator.raidRead.includes('čtení') ? 'Úroveň RAID:' : 'RAID Level:';
    }
    if (UISelectors.raidLevelSelect && t.calculator.raidLevels) {
        Array.from(UISelectors.raidLevelSelect.options).forEach((opt, idx) => {
            if (t.calculator.raidLevels[idx]) opt.textContent = t.calculator.raidLevels[idx];
        });
    }
    if (UISelectors.psuCpuSelect && t.calculator.psuCpuOpts) {
        Array.from(UISelectors.psuCpuSelect.options).forEach((opt, idx) => {
            if (t.calculator.psuCpuOpts[idx]) opt.textContent = t.calculator.psuCpuOpts[idx];
        });
    }
    if (UISelectors.psuGpuSelect && t.calculator.psuGpuOpts) {
        Array.from(UISelectors.psuGpuSelect.options).forEach((opt, idx) => {
            if (t.calculator.psuGpuOpts[idx]) opt.textContent = t.calculator.psuGpuOpts[idx];
        });
    }
    if (UISelectors.psuRamSelect && t.calculator.psuRamOpts) {
        Array.from(UISelectors.psuRamSelect.options).forEach((opt, idx) => {
            if (t.calculator.psuRamOpts[idx]) opt.textContent = t.calculator.psuRamOpts[idx];
        });
    }
    if (UISelectors.lblPwdLength) {
        const span = UISelectors.lblPwdLength.querySelector('span');
        UISelectors.lblPwdLength.innerHTML = `${t.calculator.pwdLength} `;
        if (span) UISelectors.lblPwdLength.appendChild(span);
    }
    if (UISelectors.pwdOutputField) UISelectors.pwdOutputField.placeholder = t.calculator.pwdPlaceholder;
    if (UISelectors.btnPwdGenerate) UISelectors.btnPwdGenerate.textContent = t.calculator.pwdGenerate;
    if (UISelectors.hashInput) UISelectors.hashInput.placeholder = t.calculator.hashPlaceholder;
    
    // Math Mode titles
    const mMode = document.getElementById('math-mode-label');
    if (mMode) mMode.textContent = t.calculator.mathMode;
    const mModeStd = document.getElementById('math-mode-std');
    if (mModeStd) mModeStd.textContent = t.calculator.mathModeStd;
    const mModeSci = document.getElementById('math-mode-sci');
    if (mModeSci) mModeSci.textContent = t.calculator.mathModeSci;

    // Contact Form place holders
    const formName = document.getElementById('form-name');
    if (formName) formName.placeholder = t.contact.placeholderName;
    const formEmail = document.getElementById('form-email');
    if (formEmail) formEmail.placeholder = t.contact.placeholderEmail;
    const formMsg = document.getElementById('form-message');
    if (formMsg) formMsg.placeholder = t.contact.placeholderMessage;
    const formSub = document.getElementById('btn-submit-form');
    if (formSub) formSub.textContent = t.contact.submit;

    // Minigames labels
    const gamesSels = ['gamesTitle', 'gamesSubtitle', 'tabSnake', 'tabMines', 'tabType', 'lblSnakeScore', 'lblSnakeHigh', 'lblSnakeDiff', 'lblMinesNodes', 'lblMinesShields', 'lblMinesTime', 'btnMinesReset', 'lblTypeScore', 'lblTypeHigh', 'lblTypeIntegrity'];
    gamesSels.forEach(sel => {
        const el = UISelectors[sel];
        const translationKey = sel.startsWith('lbl') || sel.startsWith('tab') || sel.startsWith('btn')
            ? sel[0].toLowerCase() + sel.slice(1)
            : sel;
        if (el && t.games[translationKey]) el.textContent = t.games[translationKey];
    });

    if (UISelectors.snakeOverlayText && (!AppState.snakeGameInterval)) {
        UISelectors.snakeOverlayText.textContent = t.games.snakeStartMsg;
    }
    if (UISelectors.btnMinesModeText && typeof AppState.minesFlagMode !== 'undefined') {
        UISelectors.btnMinesModeText.textContent = AppState.minesFlagMode ? t.games.minesModeFlag : t.games.minesModeReveal;
    }
    if (UISelectors.typeOverlayText && (!AppState.typeGameInterval)) {
        UISelectors.typeOverlayText.textContent = t.games.typeStartMsg;
    }
    if (UISelectors.typeInput) {
        UISelectors.typeInput.placeholder = t.games.typePlaceholder;
    }

    // Refresh glitch elements hover text attributes
    document.querySelectorAll('.glitch-hover').forEach(el => {
        el.setAttribute('data-text', el.textContent.trim());
    });

    // Fix missing sections
    // Games
    const gamesTitle = document.getElementById('games-title');
    if (gamesTitle && t.games) gamesTitle.textContent = t.games.title;
    const gamesSubtitle = document.getElementById('games-subtitle');
    if (gamesSubtitle && t.games) gamesSubtitle.textContent = t.games.subtitle;
    
    const lblSnakeScore = document.getElementById('lbl-snake-score');
    if (lblSnakeScore && t.games) lblSnakeScore.textContent = t.games.snakeScore;
    const lblSnakeHigh = document.getElementById('lbl-snake-highscore');
    if (lblSnakeHigh && t.games) lblSnakeHigh.textContent = t.games.snakeHigh;
    const lblSnakeDiff = document.getElementById('lbl-snake-difficulty');
    if (lblSnakeDiff && t.games) lblSnakeDiff.textContent = t.games.snakeDiff;

    // Calculator
    const calcTitle = document.getElementById('calc-title');
    if (calcTitle && t.calculator) calcTitle.textContent = t.calculator.title;
    const calcSubtitle = document.getElementById('calc-subtitle');
    if (calcSubtitle && t.calculator) calcSubtitle.textContent = t.calculator.subtitle;

    // Projects Filters
    const filterAll = document.querySelector('button[data-filter="all"]');
    if (filterAll && t.projects) filterAll.textContent = t.projects.filterAll;
    const filterEdu = document.querySelector('button[data-filter="education"]');
    if (filterEdu && t.projects) filterEdu.textContent = t.projects.filterEdu;
    const filterExp = document.querySelector('button[data-filter="experience"]');
    if (filterExp && t.projects) filterExp.textContent = t.projects.filterExp;

    // Ipsum
    const ipsumTitle = document.querySelector('#ipsum-view h3');
    if (ipsumTitle && t.ipsum) ipsumTitle.textContent = t.ipsum.title;
    const ipsumDesc = document.querySelector('#ipsum-view .section-desc');
    if (ipsumDesc && t.ipsum) ipsumDesc.textContent = t.ipsum.subtitle;
    const ipsumLabel = document.querySelector('label[for="ipsum-paragraphs"]');
    if (ipsumLabel && t.ipsum) ipsumLabel.textContent = t.ipsum.label;
    
    const btnGen = document.getElementById('btn-generate-ipsum');
    if (btnGen && t.ipsum) btnGen.innerHTML = `<i class="fa-solid fa-bolt"></i> ${t.ipsum.btnGen}`;
    const btnCopy = document.getElementById('btn-copy-ipsum');
    if (btnCopy && t.ipsum) btnCopy.innerHTML = `<i class="fa-solid fa-copy"></i> ${t.ipsum.btnCopy}`;
    
    const ipsumOut = document.getElementById('ipsum-output');
    if (ipsumOut && t.ipsum && !ipsumOut.dataset.generated) ipsumOut.textContent = t.ipsum.placeholder;

    // League of Legends
    const btnUgg = document.getElementById('btn-ugg');
    if (btnUgg && t.lol) btnUgg.textContent = t.lol.btn;
    const lolRankText = document.getElementById('lol-rank-text');
    if (lolRankText && t.lol && t.lol.statsDesc) lolRankText.textContent = t.lol.statsDesc;



    // FAQ section
    const faqTitle = document.querySelector('#faq-view h3');
    if (faqTitle && t.faq) faqTitle.textContent = t.faq.title;
    
    const faqQuestions = document.querySelectorAll('#faq-view .faq-question span');
    const faqAnswers = document.querySelectorAll('#faq-view .faq-answer p');
    if (t.faq && faqQuestions.length >= 4) {
        faqQuestions[0].textContent = t.faq.q1;
        faqAnswers[0].textContent = t.faq.a1;
        faqQuestions[1].textContent = t.faq.q2;
        faqAnswers[1].textContent = t.faq.a2;
        faqQuestions[2].textContent = t.faq.q3;
        faqAnswers[2].textContent = t.faq.a3;
        faqQuestions[3].textContent = t.faq.q4;
        faqAnswers[3].textContent = t.faq.a4;
    }

    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
}

/**
 * Generate print ready PDF CV layout in a new tab.
 * 
 * @param {string} lang - Language code ('cs' or 'en')
 */
export function generateCV(lang) {
    const cvWindow = window.open('', '_blank');
    if (!cvWindow) {
        showHUDNotification(i18n[lang].hud.cvBlocked, 'error');
        return;
    }

    const isCs = lang === 'cs';
    const title = isCs ? 'Životopis - Adam Macků' : 'Resume - Adam Macků';
    
    const data = {
        name: 'Adam Macků',
        role: isCs ? 'IT Specialista / Síťový Technik' : 'IT Specialist / Network Technician',
        email: 'mackuadam37@gmail.com',
        phone: '+420 776 739 054',
        location: isCs ? 'Liberec, Česká republika' : 'Liberec, Czech Republic',
        github: 'github.com/gitArby',
        
        profileTitle: isCs ? 'Osobní profil' : 'Professional Profile',
        profileText: isCs 
            ? 'Čerstvý absolvent oboru Informační technologie se silným technickým zázemím a zájmem o IT, hardware a síťové technologie. Zvládám i manuální práci a nebráním se pozicím mimo můj obor. Jsem velmi flexibilní, umím pracovat v týmu a po zaučení se dokážu rychle adaptovat na jakoukoliv činnost. Hledám příležitost, kde uplatním své znalosti a budu se dále profesně rozvíjet.'
            : 'Fresh IT graduate with a strong technical background and a deep interest in IT, computer hardware, and network technologies. I am also capable of manual labor and open to positions outside my field. I am highly flexible, a strong team player, and can quickly adapt to new tasks once explained. Seeking an opportunity to apply my skills and grow professionally.',
            
        educationTitle: isCs ? 'Vzdělání' : 'Education',
        schoolName: 'Střední průmyslová škola a Střední odborná škola, Varnsdorf',
        schoolField: isCs ? 'Obor: Informační technologie (2022–2026)' : 'Field: Information Technology (2022–2026)',
        schoolDesc: isCs 
            ? 'Střední vzdělání s maturitní zkouškou. Zaměření na správu systémů, základy programování, síťové technologie a hardware.'
            : 'Secondary education with the school-leaving exam (Maturita). Focused on systems administration, programming basics, networking, and hardware.',
            
        experienceTitle: isCs ? 'Pracovní praxe & stáže' : 'Work Experience & Internships',
        exp1Title: 'IT servis Turnov',
        exp1Role: isCs ? 'Odborná stáž (2 týdny)' : 'Internship (2 weeks)',
        exp1Desc: isCs
            ? 'Diagnostika a opravy hardwaru, instalace softwaru a základní údržba IT vybavení.'
            : 'Diagnostics and hardware repairs, software installation, and basic IT maintenance.',
        exp2Title: isCs ? 'Spolupráce na webových projektech (u Tomáše Hubičky)' : 'Web Projects Collaboration (with Tomáš Hubička)',
        exp2Role: isCs ? 'Odborná stáž (2 týdny)' : 'Internship (2 weeks)',
        exp2Desc: isCs
            ? 'Praktická zkušenost s tvorbou a správou webových stránek, práce s kódem v rámci reálných projektů.'
            : 'Practical experience with creation and administration of websites, working with code on real projects.',
            
        skillsTitle: isCs ? 'Technické dovednosti' : 'Technical Skills',
        skillsWebTitle: isCs ? 'Vývoj & Web' : 'Development & Web',
        skillsWebList: ['Python', 'HTML', 'CSS', 'SASS', 'JavaScript', 'Django', 'SQL basics', isCs ? 'OOP & Návrhové vzory' : 'OOP & Design Patterns', isCs ? 'Teorie grafů' : 'Graph Theory', isCs ? 'PHP (základy)' : 'PHP (basics)', 'Apache (XAMPP)', 'phpMyAdmin', isCs ? 'AI tvorba (Claude, Gemini)' : 'AI creation (Claude, Gemini)'],
        skillsNetTitle: isCs ? 'Počítačové sítě' : 'Computer Networks',
        skillsNetList: ['Cisco CCNA 1', 'Cisco CCNA 2', 'Cisco Packet Tracer', 'TCP/IP & DNS'],
        skillsSysTitle: isCs ? 'Hardware & OS' : 'Hardware & OS',
        skillsSysList: [
            isCs ? 'Diagnostika HW' : 'HW Diagnostics',
            isCs ? 'Správa OS' : 'OS Administration',
            isCs ? 'IT podpora' : 'IT Support',
            isCs ? 'Microsoft Office' : 'MS Office',
            isCs ? 'Photoshop (základy)' : 'Photoshop (basics)',
            'Git & GitHub'
        ],
        
        certsTitle: isCs ? 'Certifikace' : 'Certifications',
        certsList: [
            {
                name: 'CCNA 1: Introduction to Networks',
                issuer: 'Cisco Networking Academy',
                desc: isCs
                    ? 'Základy počítačových sítí, IP adresace (IPv4/IPv6), síťové protokoly, Ethernet a konfigurace prvků.'
                    : 'Introduction to network architecture, IP addressing (IPv4/IPv6), network protocols, Ethernet, and basic device configuration.'
            },
            {
                name: 'CCNA 2: Switching, Routing, and Wireless Essentials',
                issuer: 'Cisco Networking Academy',
                desc: isCs
                    ? 'Směrovací protokoly (OSPF), konfigurace VLAN, redundantní sítě (STP/EtherChannel), bezpečnost sítě a základy WLAN.'
                    : 'Routing protocols (OSPF), VLANs, redundant networks (STP/EtherChannel), network security, and WLAN essentials.'
            },
            {
                name: isCs ? 'Certifikáty ze všech zmíněných jazyků' : 'Certificates in all mentioned languages',
                issuer: 'SoloLearn',
                desc: isCs 
                    ? 'Úspěšné absolvování kurzů a získání certifikátů pro všechny programovací jazyky uvedené v sekci dovedností.'
                    : 'Successfully completed courses and obtained certificates for all programming languages listed in the skills section.'
            }
        ],
        
        langTitle: isCs ? 'Jazykové znalosti' : 'Languages',
        langCs: isCs ? 'Čeština: Mateřský jazyk' : 'Czech: Native speaker',
        langEn: isCs ? 'Angličtina: Úroveň B2 - C1' : 'English: B2 - C1 level',
        
        printNote: isCs ? 'Tento dokument byl vygenerován z online portfolia arbyy.tech' : 'This document was generated from arbyy.tech online portfolio'
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
            line-height: 1.5;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .cv-page {
            max-width: 820px;
            margin: 0 auto;
            padding: 2.5rem;
            box-sizing: border-box;
        }
        .header {
            border-bottom: 3px solid #00b4d8;
            padding-bottom: 1.2rem;
            margin-bottom: 1.5rem;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
        }
        .name {
            font-size: 2.4rem;
            font-weight: 800;
            color: #0b132b;
            margin: 0;
            letter-spacing: -0.5px;
        }
        .role {
            font-size: 1.15rem;
            font-weight: 600;
            color: #00b4d8;
            margin: 0.2rem 0 0.8rem 0;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .contact-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            font-size: 0.85rem;
            color: #4a5568;
            margin: 0;
            padding: 0;
            list-style: none;
        }
        .contact-item {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .contact-item i {
            color: #00b4d8;
            font-size: 0.95rem;
        }
        .contact-item a {
            color: inherit;
            text-decoration: none;
        }
        .content-grid {
            display: grid;
            grid-template-columns: 1.7fr 1fr;
            gap: 2.5rem;
        }
        .column-left {
            display: flex;
            flex-direction: column;
            gap: 1.8rem;
        }
        .column-right {
            display: flex;
            flex-direction: column;
            gap: 1.8rem;
        }
        .section {
            margin: 0;
        }
        .section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #0b132b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.4rem;
            margin-top: 0;
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .profile-text {
            font-size: 0.9rem;
            color: #2d3748;
            margin: 0;
            text-align: justify;
        }
        .timeline-item {
            margin-bottom: 1.2rem;
            position: relative;
        }
        .timeline-item:last-child {
            margin-bottom: 0;
        }
        .timeline-header {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 0.25rem;
        }
        .timeline-title {
            font-size: 0.95rem;
            font-weight: 700;
            color: #0b132b;
            margin: 0;
            max-width: 75%;
        }
        .timeline-date {
            font-size: 0.78rem;
            font-weight: 700;
            color: #00b4d8;
            white-space: nowrap;
        }
        .timeline-subtitle {
            font-size: 0.82rem;
            color: #4a5568;
            font-weight: 600;
            margin: 0 0 0.4rem 0;
        }
        .timeline-desc {
            font-size: 0.85rem;
            color: #4a5568;
            margin: 0;
            text-align: justify;
        }
        .skills-group {
            margin-bottom: 1rem;
        }
        .skills-group:last-child {
            margin-bottom: 0;
        }
        .skills-group-title {
            font-size: 0.85rem;
            font-weight: 700;
            color: #4a5568;
            margin-top: 0;
            margin-bottom: 0.4rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .skill-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 0.4rem;
        }
        .skill-badge {
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            font-size: 0.78rem;
            color: #2d3748;
            font-weight: 500;
        }
        .cert-item {
            margin-bottom: 1rem;
            border-left: 2px solid #00b4d8;
            padding-left: 0.6rem;
        }
        .cert-item:last-child {
            margin-bottom: 0;
        }
        .cert-issuer {
            font-size: 0.7rem;
            font-weight: 700;
            color: #00b4d8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: block;
        }
        .cert-name {
            font-size: 0.9rem;
            font-weight: 700;
            color: #0b132b;
            margin: 0.1rem 0;
        }
        .cert-desc {
            font-size: 0.78rem;
            color: #4a5568;
            margin: 0;
        }
        .lang-list {
            list-style: none;
            padding: 0;
            margin: 0;
            font-size: 0.85rem;
            color: #2d3748;
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
        }
        .lang-list li {
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        .lang-list i {
            color: #00b4d8;
            font-size: 0.8rem;
        }
        .footer-note {
            margin-top: 3rem;
            border-top: 1px dashed #cbd5e0;
            padding-top: 0.6rem;
            font-size: 0.72rem;
            color: #a0aec0;
            text-align: center;
        }
        @media print {
            body {
                width: 100%;
                font-size: 9.5pt !important;
                line-height: 1.3 !important;
            }
            .cv-page {
                padding: 1rem 1.5rem !important;
            }
            .header {
                padding-bottom: 0.5rem !important;
                margin-bottom: 0.8rem !important;
            }
            .name {
                font-size: 1.8rem !important;
            }
            .role {
                font-size: 0.95rem !important;
                margin-bottom: 0.4rem !important;
            }
            .contact-grid {
                gap: 1rem !important;
                font-size: 0.8rem !important;
            }
            .content-grid {
                gap: 1.5rem !important;
            }
            .column-left, .column-right {
                gap: 1rem !important;
            }
            .section-title {
                margin-bottom: 0.4rem !important;
                font-size: 0.95rem !important;
                padding-bottom: 0.2rem !important;
            }
            .profile-text {
                font-size: 0.82rem !important;
            }
            .timeline-item {
                margin-bottom: 0.6rem !important;
            }
            .timeline-title {
                font-size: 0.85rem !important;
            }
            .timeline-subtitle {
                font-size: 0.78rem !important;
                margin-bottom: 0.2rem !important;
            }
            .timeline-desc {
                font-size: 0.78rem !important;
            }
            .skills-group {
                margin-bottom: 0.5rem !important;
            }
            .skills-group-title {
                font-size: 0.78rem !important;
                margin-bottom: 0.2rem !important;
            }
            .skill-badge {
                font-size: 0.72rem !important;
                padding: 0.15rem 0.35rem !important;
            }
            .cert-item {
                margin-bottom: 0.5rem !important;
            }
            .cert-name {
                font-size: 0.82rem !important;
            }
            .cert-desc {
                font-size: 0.72rem !important;
            }
            .lang-list {
                font-size: 0.78rem !important;
                gap: 0.2rem !important;
            }
            .footer-note {
                margin-top: 1rem !important;
                padding-top: 0.4rem !important;
            }
            .cv-top-bar {
                display: none !important;
            }
        }
        .cv-top-bar {
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            padding: 10px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            position: sticky;
            top: 0;
            z-index: 9999;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .cv-btn {
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 600;
            padding: 6px 14px;
            border-radius: 4px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            text-decoration: none;
        }
        .cv-btn-print {
            background: #00b4d8;
            color: white;
            border: none;
        }
        .cv-btn-print:hover {
            background: #0077b6;
        }
        .cv-btn-close {
            background: white;
            color: #495057;
            border: 1px solid #ced4da;
        }
        .cv-btn-close:hover {
            background: #f8f9fa;
            color: #212529;
        }
    </style>
</head>
<body>
    <div class="cv-top-bar">
        <button onclick="window.print()" class="cv-btn cv-btn-print"><i class="fa-solid fa-download"></i> ${isCs ? 'Stáhnout / Tisk' : 'Download / Print'}</button>
        <button onclick="window.close()" class="cv-btn cv-btn-close"><i class="fa-solid fa-xmark"></i> ${isCs ? 'Zavřít' : 'Close'}</button>
    </div>
    <div class="cv-page">
        <div class="header">
            <div class="header-top">
                <h1 class="name">${data.name}</h1>
            </div>
            <div class="role">${data.role}</div>
            <ul class="contact-grid">
                <li class="contact-item">
                    <i class="fa-solid fa-envelope"></i>
                    <a href="mailto:${data.email}">${data.email}</a>
                </li>
                <li class="contact-item">
                    <i class="fa-solid fa-phone"></i>
                    <a href="tel:${data.phone.replace(/\s+/g, '')}">${data.phone}</a>
                </li>
                <li class="contact-item">
                    <i class="fa-solid fa-location-dot"></i>
                    <span>${data.location}</span>
                </li>
                <li class="contact-item">
                    <i class="fa-brands fa-github"></i>
                    <a href="https://github.com/gitArby" target="_blank">${data.github}</a>
                </li>
            </ul>
        </div>

        <div class="content-grid">
            <div class="column-left">
                <div class="section">
                    <h2 class="section-title">${data.profileTitle}</h2>
                    <p class="profile-text">${data.profileText}</p>
                </div>

                <div class="section">
                    <h2 class="section-title">${data.experienceTitle}</h2>
                    
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${data.exp1Title}</h3>
                            <span class="timeline-date">${data.exp1Role}</span>
                        </div>
                        <div class="timeline-subtitle">${isCs ? 'Odborná stáž' : 'Vocational Internship'}</div>
                        <p class="timeline-desc">${data.exp1Desc}</p>
                    </div>

                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${data.exp2Title}</h3>
                            <span class="timeline-date">${data.exp2Role}</span>
                        </div>
                        <div class="timeline-subtitle">${isCs ? 'Odborná stáž' : 'Vocational Internship'}</div>
                        <p class="timeline-desc">${data.exp2Desc}</p>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">${data.educationTitle}</h2>
                    <div class="timeline-item">
                        <div class="timeline-header">
                            <h3 class="timeline-title">${data.schoolName}</h3>
                            <span class="timeline-date">2022 – 2026</span>
                        </div>
                        <div class="timeline-subtitle">${data.schoolField}</div>
                        <p class="timeline-desc">${data.schoolDesc}</p>
                    </div>
                </div>
            </div>

            <div class="column-right">
                <div class="section">
                    <h2 class="section-title">${data.skillsTitle}</h2>
                    
                    <div class="skills-group">
                        <h3 class="skills-group-title">${data.skillsWebTitle}</h3>
                        <div class="skill-badges">
                            ${data.skillsWebList.map(s => `<span class="skill-badge">${s}</span>`).join('')}
                        </div>
                    </div>

                    <div class="skills-group">
                        <h3 class="skills-group-title">${data.skillsNetTitle}</h3>
                        <div class="skill-badges">
                            ${data.skillsNetList.map(s => `<span class="skill-badge">${s}</span>`).join('')}
                        </div>
                    </div>

                    <div class="skills-group">
                        <h3 class="skills-group-title">${data.skillsSysTitle}</h3>
                        <div class="skill-badges">
                            ${data.skillsSysList.map(s => `<span class="skill-badge">${s}</span>`).join('')}
                        </div>
                    </div>
                </div>

                <div class="section">
                    <h2 class="section-title">${data.certsTitle}</h2>
                    ${data.certsList.map(c => `
                        <div class="cert-item">
                            <span class="cert-issuer">${c.issuer}</span>
                            <h3 class="cert-name">${c.name}</h3>
                            <p class="cert-desc">${c.desc}</p>
                        </div>
                    `).join('')}
                </div>

                <div class="section">
                    <h2 class="section-title">${data.langTitle}</h2>
                    <ul class="lang-list">
                        <li><i class="fa-solid fa-circle-check"></i> <span>${data.langCs}</span></li>
                        <li><i class="fa-solid fa-circle-check"></i> <span>${data.langEn}</span></li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="footer-note">
            <span>${data.printNote}</span>
        </div>
    </div>
</body>
</html>
    `;

    cvWindow.document.open();
    cvWindow.document.write(htmlContent);
    cvWindow.document.close();
}
