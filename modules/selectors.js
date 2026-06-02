/**
 * UISelectors Module
 * Centralized registry of all DOM selectors used across the application.
 * Using ES6 Getters allows fetching elements dynamically from the DOM 
 * on-demand rather than caching them once at startup. This prevents 
 * ReferenceErrors and ensures the code remains clean and maintainable.
 */
export const UISelectors = {
    // Scroll & Layout
    get scrollProgress() { return document.getElementById('scroll-progress'); },
    get mainNav() { return document.getElementById('main-nav'); },
    get navToggle() { return document.getElementById('nav-toggle'); },
    get navLinks() { return document.getElementById('nav-links'); },
    get mainContent() { return document.getElementById('main-content'); },
    get typewriter() { return document.getElementById('typewriter'); },

    // Custom Cursor
    get cursorDot() { return document.querySelector('.cursor-dot'); },
    get cursorOutline() { return document.querySelector('.cursor-outline'); },

    // Easter Egg
    get megaTrigger() { return document.getElementById('mega-trigger'); },
    get easterEggCanvas() { return document.getElementById('easter-egg-canvas'); },

    // Theme Selector
    get themeDots() { return document.querySelectorAll('.theme-dot'); },

    // Discord Status & Spotify Presence
    get discordStatus() { return document.getElementById('discord-status'); },
    get discordProfileCard() { return document.getElementById('discord-profile-card'); },
    get spotifyProgressBar() { return document.getElementById('spotify-progress-bar'); },
    get gameTimer() { return document.getElementById('game-timer'); },

    // Audio Controls
    get audioToggle() { return document.getElementById('audio-toggle'); },
    get audioIcon() { return document.getElementById('audio-icon'); },

    // LoL Stats Card
    get lolCard() { return document.getElementById('lol-card'); },
    get lolChampsContainer() { return document.getElementById('lol-champs-container'); },

    // Contact Form
    get contactForm() { return document.getElementById('contact-form'); },
    get formName() { return document.getElementById('form-name'); },
    get formEmail() { return document.getElementById('form-email'); },
    get formMessage() { return document.getElementById('form-message'); },
    get btnSubmitForm() { return document.getElementById('btn-submit-form'); },

    // Cisco Topology Lab
    get topoNodes() { return document.querySelectorAll('.topo-node'); },
    get consoleBody() { return document.getElementById('console-body'); },
    get consoleHeaderTitle() { return document.getElementById('console-header-title'); },

    // Calculator Hub (General)
    get calcTitle() { return document.getElementById('calc-title'); },
    get calcSubtitle() { return document.getElementById('calc-subtitle'); },
    get tabBtns() { return document.querySelectorAll('.calc-tab-btn'); },
    get calcViews() { return document.querySelectorAll('.calc-view'); },

    // Subnet Calculator
    get tabSubnet() { return document.getElementById('tab-btn-subnet'); },
    get ipInput() { return document.getElementById('subnet-ip'); },
    get cidrSlider() { return document.getElementById('subnet-cidr'); },
    get cidrDisplay() { return document.getElementById('cidr-val'); },
    get lblSubnetIp() { return document.getElementById('lbl-subnet-ip'); },
    get lblSubnetCidr() { return document.getElementById('lbl-subnet-cidr'); },
    get resMask() { return document.getElementById('res-lbl-mask'); },
    get resValMask() { return document.getElementById('res-val-mask'); },
    get resNet() { return document.getElementById('res-lbl-net'); },
    get resValNet() { return document.getElementById('res-val-net'); },
    get resBroadcast() { return document.getElementById('res-lbl-broadcast'); },
    get resValBroadcast() { return document.getElementById('res-val-broadcast'); },
    get resRange() { return document.getElementById('res-lbl-range'); },
    get resValRange() { return document.getElementById('res-val-range'); },
    get resHosts() { return document.getElementById('res-lbl-hosts'); },
    get resValHosts() { return document.getElementById('res-val-hosts'); },
    get resWildcard() { return document.getElementById('res-lbl-wildcard'); },
    get resValWildcard() { return document.getElementById('res-val-wildcard'); },
    get binHdr() { return document.getElementById('bin-hdr'); },
    get binIpEl() { return document.getElementById('bin-val-ip'); },
    get binMaskEl() { return document.getElementById('bin-val-mask'); },

    // Math Calculator
    get tabMath() { return document.getElementById('tab-btn-math'); },
    get mathDisplay() { return document.getElementById('math-display'); },
    get mathHistory() { return document.getElementById('math-history'); },
    get mathKeypad() { return document.getElementById('math-keypad'); },
    get stdToggle() { return document.getElementById('math-mode-std'); },
    get sciToggle() { return document.getElementById('math-mode-sci'); },
    get basesPanel() { return document.getElementById('math-bases'); },
    get baseDec() { return document.getElementById('base-dec'); },
    get baseHex() { return document.getElementById('base-hex'); },
    get baseBin() { return document.getElementById('base-bin'); },

    // RAID Calculator
    get tabRaid() { return document.getElementById('tab-btn-raid'); },
    get raidLevelSelect() { return document.getElementById('raid-level'); },
    get raidDisksInput() { return document.getElementById('raid-disks'); },
    get raidCapacityInput() { return document.getElementById('raid-capacity'); },
    get raidUnitSelect() { return document.getElementById('raid-unit'); },
    get raidErrorMsg() { return document.getElementById('raid-error-msg'); },
    get lblRaidLevel() { return document.getElementById('lbl-raid-level'); },
    get lblRaidDisks() { return document.getElementById('lbl-raid-disks'); },
    get lblRaidCapacity() { return document.getElementById('lbl-raid-capacity'); },
    get resRaidUsable() { return document.getElementById('res-lbl-raid-usable'); },
    get resValRaidUsable() { return document.getElementById('res-val-raid-usable'); },
    get resRaidLost() { return document.getElementById('res-lbl-raid-lost'); },
    get resValRaidLost() { return document.getElementById('res-val-raid-lost'); },
    get resRaidFault() { return document.getElementById('res-lbl-raid-fault'); },
    get resValRaidFault() { return document.getElementById('res-val-raid-fault'); },
    get resRaidRead() { return document.getElementById('res-lbl-raid-read'); },
    get resValRaidRead() { return document.getElementById('res-val-raid-read'); },
    get resRaidWrite() { return document.getElementById('res-lbl-raid-write'); },
    get resValRaidWrite() { return document.getElementById('res-val-raid-write'); },

    // PSU Calculator
    get tabPsu() { return document.getElementById('tab-btn-psu'); },
    get psuCpuSelect() { return document.getElementById('psu-cpu'); },
    get psuGpuSelect() { return document.getElementById('psu-gpu'); },
    get psuRamSelect() { return document.getElementById('psu-ram'); },
    get psuDrivesInput() { return document.getElementById('psu-drives'); },
    get psuFansInput() { return document.getElementById('psu-fans'); },
    get psuOcCheckbox() { return document.getElementById('psu-oc'); },
    get lblPsuCpu() { return document.getElementById('lbl-psu-cpu'); },
    get lblPsuGpu() { return document.getElementById('lbl-psu-gpu'); },
    get lblPsuRam() { return document.getElementById('lbl-psu-ram'); },
    get lblPsuDrives() { return document.getElementById('lbl-psu-drives'); },
    get lblPsuFans() { return document.getElementById('lbl-psu-fans'); },
    get lblPsuOc() { return document.getElementById('lbl-psu-oc'); },
    get resPsuEst() { return document.getElementById('res-lbl-psu-est'); },
    get resValPsuEst() { return document.getElementById('res-val-psu-est'); },
    get resPsuRec() { return document.getElementById('res-lbl-psu-rec'); },
    get resValPsuRec() { return document.getElementById('res-val-psu-rec'); },
    get resPsuEff() { return document.getElementById('res-lbl-psu-eff'); },
    get resValPsuEff() { return document.getElementById('res-val-psu-eff'); },

    // Password Generator
    get tabPassword() { return document.getElementById('tab-btn-password'); },
    get pwdLengthInput() { return document.getElementById('pwd-length'); },
    get pwdLenVal() { return document.getElementById('pwd-len-val'); },
    get pwdLowerCheckbox() { return document.getElementById('pwd-lower'); },
    get pwdUpperCheckbox() { return document.getElementById('pwd-upper'); },
    get pwdDigitsCheckbox() { return document.getElementById('pwd-digits'); },
    get pwdSymbolsCheckbox() { return document.getElementById('pwd-symbols'); },
    get pwdOutputField() { return document.getElementById('pwd-output'); },
    get btnPwdCopy() { return document.getElementById('btn-pwd-copy'); },
    get btnPwdGenerate() { return document.getElementById('btn-pwd-generate'); },
    get resPwdStrength() { return document.getElementById('res-lbl-pwd-strength'); },
    get strengthEl() { return document.getElementById('res-val-pwd-strength'); },
    get lblPwdLength() { return document.getElementById('lbl-pwd-length'); },
    get lblPwdLower() { return document.getElementById('lbl-pwd-lower'); },
    get lblPwdUpper() { return document.getElementById('lbl-pwd-upper'); },
    get lblPwdDigits() { return document.getElementById('lbl-pwd-digits'); },
    get lblPwdSymbols() { return document.getElementById('lbl-pwd-symbols'); },
    get resValHash() { return document.getElementById('res-val-hash'); },

    // Hash Hasher
    get hashHdr() { return document.getElementById('hash-hdr'); },
    get hashInput() { return document.getElementById('hash-input'); },
    get btnHashCopy() { return document.getElementById('btn-hash-copy'); },

    // Cisco Lab
    get consolePlaceholder() { return document.getElementById('console-placeholder'); },

    // Minigames Hub
    get gamesTitle() { return document.getElementById('games-title'); },
    get gamesSubtitle() { return document.getElementById('games-subtitle'); },
    get gameTabBtns() { return document.querySelectorAll('.game-tab-btn'); },
    get gameViews() { return document.querySelectorAll('.game-view'); },

    // Cyber Snake
    get tabSnake() { return document.getElementById('tab-btn-snake'); },
    get snakeCanvas() { return document.getElementById('snake-canvas'); },
    get snakeScoreEl() { return document.getElementById('snake-score'); },
    get snakeHighScoreEl() { return document.getElementById('snake-highscore'); },
    get btnSnakeStart() { return document.getElementById('btn-snake-start'); },
    get snakeOverlay() { return document.getElementById('snake-overlay'); },
    get snakeOverlayText() { return document.getElementById('snake-overlay-text'); },
    get snakeSpeedSelect() { return document.getElementById('snake-speed'); },
    get lblSnakeScore() { return document.getElementById('lbl-snake-score'); },
    get lblSnakeHigh() { return document.getElementById('lbl-snake-highscore'); },
    get lblSnakeDiff() { return document.getElementById('lbl-snake-difficulty'); },
    get dpadUp() { return document.getElementById('dpad-up'); },
    get dpadDown() { return document.getElementById('dpad-down'); },
    get dpadLeft() { return document.getElementById('dpad-left'); },
    get dpadRight() { return document.getElementById('dpad-right'); },

    // Hacker Minesweeper
    get tabMines() { return document.getElementById('tab-btn-mines'); },
    get minesBoardEl() { return document.getElementById('mines-board'); },
    get minesCountEl() { return document.getElementById('mines-count'); },
    get minesFlagsEl() { return document.getElementById('mines-flags'); },
    get minesTimeEl() { return document.getElementById('mines-time'); },
    get btnMinesReset() { return document.getElementById('btn-mines-reset'); },
    get btnMinesMode() { return document.getElementById('btn-mines-mode'); },
    get btnMinesModeText() { return document.getElementById('btn-mines-mode-text'); },
    get lblMinesNodes() { return document.getElementById('lbl-mines-nodes'); },
    get lblMinesShields() { return document.getElementById('lbl-mines-flags'); },
    get lblMinesTime() { return document.getElementById('lbl-mines-time'); },

    // Defend the Firewall Typing
    get tabType() { return document.getElementById('tab-btn-type'); },
    get typeTerminalScreen() { return document.getElementById('type-terminal-screen'); },
    get typeScoreEl() { return document.getElementById('type-score'); },
    get typeHighScoreEl() { return document.getElementById('type-highscore'); },
    get typeIntegrityFill() { return document.getElementById('type-integrity-fill'); },
    get typeIntegrityText() { return document.getElementById('type-integrity-text'); },
    get typeInput() { return document.getElementById('type-input'); },
    get btnTypeStart() { return document.getElementById('btn-type-start'); },
    get btnTypeReset() { return document.getElementById('btn-type-reset'); },
    get typeOverlay() { return document.getElementById('type-overlay'); },
    get typeOverlayText() { return document.getElementById('type-overlay-text'); },
    get lblTypeScore() { return document.getElementById('lbl-type-score'); },
    get lblTypeHigh() { return document.getElementById('lbl-type-highscore'); },
    get lblTypeIntegrity() { return document.getElementById('lbl-type-integrity'); }
};
