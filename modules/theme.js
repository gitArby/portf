import { UISelectors } from './selectors.js';
import { AppState } from './state.js';

export function initTheme() {
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
}
