/**
 * Tools Module
 * Handles calculations (Subnet, RAID, PSU, Password Generation, SHA-256 Hashes),
 * standard/scientific math calculations, and interactive CCNA Lab console simulations.
 * Subscribes to the 'langchanged' event to update UI outputs dynamically.
 */
import { AppState, subscribe } from './state.js';
import { UISelectors } from './selectors.js';
import { i18n } from './translations.js';
import { playClick, showHUDNotification } from './utils.js';

// Private state variables for Math Calculator
let mathExpr = '';
let mathDisplayExpr = '0';
let isSciMode = false;

// Private state variables for CCNA Console simulation
let consoleTimeout = null;

// ==========================================================================
// SUBNET CALCULATOR
// ==========================================================================

/**
 * Calculates subnet mask, network IP, broadcast IP, and host range
 * from an IPv4 address and CIDR prefix. Updates the DOM outputs.
 */
export function calculateSubnet() {
    const ipInput = UISelectors.ipInput;
    const cidrSlider = UISelectors.cidrSlider;
    const cidrDisplay = UISelectors.cidrDisplay;

    if (!ipInput || !cidrSlider) return;
    const ipVal = ipInput.value.trim();
    const cidr = parseInt(cidrSlider.value, 10);
    
    if (cidrDisplay) cidrDisplay.textContent = `/${cidr}`;
    
    // Simple IPv4 Regex Validation
    const ipPattern = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipPattern.test(ipVal)) {
        ['resValMask', 'resValNet', 'resValBroadcast', 'resValRange', 'resValHosts', 'resValWildcard'].forEach(sel => {
            const el = UISelectors[sel];
            if (el) el.textContent = 'Invalid IP';
        });
        if (UISelectors.binIpEl) UISelectors.binIpEl.textContent = 'Invalid IP Address';
        if (UISelectors.binMaskEl) UISelectors.binMaskEl.textContent = 'N/A';
        return;
    }
    
    const ipNum = ipVal.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
    const maskNum = cidr === 0 ? 0 : (~0 << (32 - cidr)) >>> 0;
    const wildcardNum = ~maskNum >>> 0;
    
    const netNum = (ipNum & maskNum) >>> 0;
    const bcNum = (netNum | wildcardNum) >>> 0;
    
    let hosts = 0;
    let firstIp = 'N/A';
    let lastIp = 'N/A';
    
    if (cidr < 31) {
        hosts = (1 << (32 - cidr)) - 2;
        firstIp = numToIp(netNum + 1);
        lastIp = numToIp(bcNum - 1);
    } else if (cidr === 31) {
        hosts = 2;
        firstIp = numToIp(netNum);
        lastIp = numToIp(bcNum);
    } else { // 32
        hosts = 1;
        firstIp = numToIp(netNum);
        lastIp = numToIp(netNum);
    }
    
    // Helper to format text with user-selected language locale format
    const langLocale = AppState.currentLang === 'cs' ? 'cs-CZ' : 'en-US';
    
    if (UISelectors.resValMask) UISelectors.resValMask.textContent = numToIp(maskNum);
    if (UISelectors.resValNet) UISelectors.resValNet.textContent = numToIp(netNum);
    if (UISelectors.resValBroadcast) UISelectors.resValBroadcast.textContent = numToIp(bcNum);
    if (UISelectors.resValRange) UISelectors.resValRange.textContent = `${firstIp} - ${lastIp}`;
    if (UISelectors.resValHosts) UISelectors.resValHosts.textContent = hosts.toLocaleString(langLocale);
    if (UISelectors.resValWildcard) UISelectors.resValWildcard.textContent = numToIp(wildcardNum);
    
    // Binary visualization strings construction
    const binIpVal = numToBinStr(ipNum);
    const binMaskVal = numToBinStr(maskNum);
    
    if (UISelectors.binIpEl) UISelectors.binIpEl.textContent = binIpVal;
    if (UISelectors.binMaskEl) UISelectors.binMaskEl.textContent = binMaskVal;
}

function numToIp(num) {
    return [
        (num >>> 24) & 255,
        (num >>> 16) & 255,
        (num >>> 8) & 255,
        num & 255
    ].join('.');
}

function numToBinStr(num) {
    const s = (num >>> 0).toString(2).padStart(32, '0');
    return [
        s.slice(0, 8),
        s.slice(8, 16),
        s.slice(16, 24),
        s.slice(24, 32)
    ].join('.');
}

// ==========================================================================
// MATH CALCULATOR
// ==========================================================================

function handleMathAction(action) {
    switch (action) {
        case 'clear':
            mathExpr = '';
            mathDisplayExpr = '0';
            if (UISelectors.mathHistory) UISelectors.mathHistory.textContent = '';
            break;
        case 'backspace':
            if (mathDisplayExpr.length > 1) {
                mathDisplayExpr = mathDisplayExpr.slice(0, -1);
                if (mathExpr.endsWith('Math.sin(')) mathExpr = mathExpr.slice(0, -9);
                else if (mathExpr.endsWith('Math.cos(')) mathExpr = mathExpr.slice(0, -9);
                else if (mathExpr.endsWith('Math.tan(')) mathExpr = mathExpr.slice(0, -9);
                else if (mathExpr.endsWith('Math.log10(')) mathExpr = mathExpr.slice(0, -11);
                else if (mathExpr.endsWith('Math.log(')) mathExpr = mathExpr.slice(0, -9);
                else if (mathExpr.endsWith('Math.sqrt(')) mathExpr = mathExpr.slice(0, -10);
                else if (mathExpr.endsWith('Math.PI')) mathExpr = mathExpr.slice(0, -7);
                else if (mathExpr.endsWith('Math.E')) mathExpr = mathExpr.slice(0, -6);
                else mathExpr = mathExpr.slice(0, -1);
            } else {
                mathDisplayExpr = '0';
                mathExpr = '';
            }
            break;
        case 'divide':
            mathDisplayExpr += ' ÷ ';
            mathExpr += '/';
            break;
        case 'multiply':
            mathDisplayExpr += ' × ';
            mathExpr += '*';
            break;
        case 'subtract':
            mathDisplayExpr += ' - ';
            mathExpr += '-';
            break;
        case 'add':
            mathDisplayExpr += ' + ';
            mathExpr += '+';
            break;
        case 'sin':
            mathDisplayExpr += 'sin(';
            mathExpr += 'Math.sin(';
            break;
        case 'cos':
            mathDisplayExpr += 'cos(';
            mathExpr += 'Math.cos(';
            break;
        case 'tan':
            mathDisplayExpr += 'tan(';
            mathExpr += 'Math.tan(';
            break;
        case 'log':
            mathDisplayExpr += 'log(';
            mathExpr += 'Math.log10(';
            break;
        case 'ln':
            mathDisplayExpr += 'ln(';
            mathExpr += 'Math.log(';
            break;
        case 'sqrt':
            mathDisplayExpr += '√(';
            mathExpr += 'Math.sqrt(';
            break;
        case 'pow':
            mathDisplayExpr += '^';
            mathExpr += '**';
            break;
        case 'pi':
            mathDisplayExpr += 'π';
            mathExpr += 'Math.PI';
            break;
        case 'e':
            mathDisplayExpr += 'e';
            mathExpr += 'Math.E';
            break;
        case 'open-paren':
            mathDisplayExpr += '(';
            mathExpr += '(';
            break;
        case 'close-paren':
            mathDisplayExpr += ')';
            mathExpr += ')';
            break;
        case 'mod':
            mathDisplayExpr += ' mod ';
            mathExpr += '%';
            break;
        case 'equals':
            evaluateMath();
            break;
    }
}

function updateMathScreen() {
    if (UISelectors.mathDisplay) {
        UISelectors.mathDisplay.textContent = mathDisplayExpr === '' ? '0' : mathDisplayExpr;
    }
}

function evaluateMath() {
    if (mathExpr === '') return;
    try {
        // Prevent arbitrary execution code injection (sandbox check)
        const sanitizedCheck = mathExpr
            .replace(/Math\.(sin|cos|tan|log10|log|sqrt|PI|E)/g, '')
            .replace(/[0-9+\-*/().\s%]/g, '')
            .replace(/\*\*/g, '');
            
        if (sanitizedCheck.trim() !== '') {
            throw new Error('Invalid Expression');
        }
        
        const evalFn = new Function(`return (${mathExpr})`);
        const resVal = evalFn();
        
        if (resVal === undefined || isNaN(resVal) || !isFinite(resVal)) {
            throw new Error('Math Error');
        }
        
        const roundedRes = parseFloat(resVal.toFixed(8));
        
        if (UISelectors.mathHistory) {
            UISelectors.mathHistory.textContent = mathDisplayExpr + ' =';
        }
        mathDisplayExpr = String(roundedRes);
        mathExpr = String(roundedRes);
        
        if (isSciMode) updateBases();
    } catch (e) {
        if (UISelectors.mathHistory) {
            UISelectors.mathHistory.textContent = mathDisplayExpr;
        }
        mathDisplayExpr = 'Error';
        mathExpr = '';
        clearBases();
    }
}

function updateBases() {
    const decVal = parseFloat(mathExpr);
    const decEl = UISelectors.baseDec;
    const hexEl = UISelectors.baseHex;
    const binEl = UISelectors.baseBin;
    
    if (!isNaN(decVal) && isFinite(decVal) && Number.isInteger(decVal)) {
        const intVal = decVal >>> 0;
        if (decEl) decEl.textContent = decVal.toString(10);
        if (hexEl) hexEl.textContent = '0x' + intVal.toString(16).toUpperCase();
        if (binEl) binEl.textContent = intVal.toString(2).match(/.{1,8}/g)?.join(' ') || intVal.toString(2);
    } else {
        clearBases();
    }
}

function clearBases() {
    const decEl = UISelectors.baseDec;
    const hexEl = UISelectors.baseHex;
    const binEl = UISelectors.baseBin;
    if (decEl) decEl.textContent = 'N/A';
    if (hexEl) hexEl.textContent = 'N/A';
    if (binEl) binEl.textContent = 'N/A';
}

// ==========================================================================
// RAID CALCULATOR
// ==========================================================================

function formatDisksCount(count, lang) {
    if (lang === 'cs') {
        if (count === 1) return '1 disk';
        if (count >= 2 && count <= 4) return `${count} disky`;
        return `${count} disků`;
    } else {
        if (count === 1) return '1 disk';
        return `${count} disks`;
    }
}

/**
 * Calculates RAID array capacity, fault tolerance, and speeds
 * based on selected RAID level and disk sizes. Updates DOM outputs.
 */
export function calculateRaid() {
    const raidLevelSelect = UISelectors.raidLevelSelect;
    const raidDisksInput = UISelectors.raidDisksInput;
    const raidCapacityInput = UISelectors.raidCapacityInput;
    const raidUnitSelect = UISelectors.raidUnitSelect;
    const raidErrorMsg = UISelectors.raidErrorMsg;

    if (!raidLevelSelect || !raidDisksInput || !raidCapacityInput || !raidUnitSelect) return;
    
    const lvl = raidLevelSelect.value;
    const disks = parseInt(raidDisksInput.value, 10) || 0;
    const cap = parseFloat(raidCapacityInput.value) || 0;
    const unit = raidUnitSelect.value;
    const lang = AppState.currentLang;
    const t = i18n[lang].calculator;

    let isValid = true;
    let errorText = '';
    let minDisks = 2;

    // Boundary constraints evaluation
    if (lvl === '0') {
        minDisks = 2;
        if (disks < minDisks) {
            isValid = false;
            errorText = t.raidErrorMin.replace('{level}', '0').replace('{min}', minDisks);
        }
    } else if (lvl === '1') {
        minDisks = 2;
        if (disks < minDisks) {
            isValid = false;
            errorText = t.raidErrorMin.replace('{level}', '1').replace('{min}', minDisks);
        }
    } else if (lvl === '5') {
        minDisks = 3;
        if (disks < minDisks) {
            isValid = false;
            errorText = t.raidErrorMin.replace('{level}', '5').replace('{min}', minDisks);
        }
    } else if (lvl === '6') {
        minDisks = 4;
        if (disks < minDisks) {
            isValid = false;
            errorText = t.raidErrorMin.replace('{level}', '6').replace('{min}', minDisks);
        }
    } else if (lvl === '10') {
        minDisks = 4;
        if (disks < minDisks) {
            isValid = false;
            errorText = t.raidErrorMin.replace('{level}', '10').replace('{min}', minDisks);
        } else if (disks % 2 !== 0) {
            isValid = false;
            errorText = t.raidErrorEven;
        }
    }

    if (!isValid) {
        if (raidErrorMsg) {
            raidErrorMsg.textContent = errorText;
            raidErrorMsg.classList.remove('hidden');
        }
        if (UISelectors.resValRaidUsable) UISelectors.resValRaidUsable.textContent = 'N/A';
        if (UISelectors.resValRaidLost) UISelectors.resValRaidLost.textContent = 'N/A';
        if (UISelectors.resValRaidFault) UISelectors.resValRaidFault.textContent = 'N/A';
        if (UISelectors.resValRaidRead) UISelectors.resValRaidRead.textContent = 'N/A';
        if (UISelectors.resValRaidWrite) UISelectors.resValRaidWrite.textContent = 'N/A';
        return;
    }

    if (raidErrorMsg) {
        raidErrorMsg.classList.add('hidden');
    }

    let usable = 0;
    let lost = 0;
    let faultTolerance = 0;
    let readSpeed = '1x';
    let writeSpeed = '1x';

    switch (lvl) {
        case '0':
            usable = disks * cap;
            lost = 0;
            faultTolerance = 0;
            readSpeed = `${disks}x`;
            writeSpeed = `${disks}x`;
            break;
        case '1':
            usable = cap;
            lost = (disks - 1) * cap;
            faultTolerance = disks - 1;
            readSpeed = `${disks}x`;
            writeSpeed = '1x';
            break;
        case '5':
            usable = (disks - 1) * cap;
            lost = cap;
            faultTolerance = 1;
            readSpeed = `${disks - 1}x`;
            writeSpeed = `${(disks / 4).toFixed(2).replace(/\.00$/, '')}x (est.)`;
            break;
        case '6':
            usable = (disks - 2) * cap;
            lost = 2 * cap;
            faultTolerance = 2;
            readSpeed = `${disks - 2}x`;
            writeSpeed = `${(disks / 6).toFixed(2).replace(/\.00$/, '')}x (est.)`;
            break;
        case '10':
            usable = (disks / 2) * cap;
            lost = (disks / 2) * cap;
            faultTolerance = 1;
            readSpeed = `${disks}x`;
            writeSpeed = `${(disks / 2).toFixed(1).replace(/\.0$/, '')}x`;
            break;
    }

    const langLocale = lang === 'cs' ? 'cs-CZ' : 'en-US';

    if (UISelectors.resValRaidUsable) {
        UISelectors.resValRaidUsable.textContent = `${usable.toLocaleString(langLocale)} ${unit}`;
    }
    if (UISelectors.resValRaidLost) {
        UISelectors.resValRaidLost.textContent = `${lost.toLocaleString(langLocale)} ${unit}`;
    }
    if (UISelectors.resValRaidFault) {
        UISelectors.resValRaidFault.textContent = formatDisksCount(faultTolerance, lang);
    }
    if (UISelectors.resValRaidRead) {
        UISelectors.resValRaidRead.textContent = readSpeed;
    }
    if (UISelectors.resValRaidWrite) {
        UISelectors.resValRaidWrite.textContent = writeSpeed;
    }
}

// ==========================================================================
// PC PSU CALCULATOR
// ==========================================================================

/**
 * Estimates PC Power Supply Unit (PSU) requirements based on 
 * selected CPU, GPU, RAM, drives, and overclocking status. Updates DOM outputs.
 */
export function calculatePsu() {
    const psuCpuSelect = UISelectors.psuCpuSelect;
    const psuGpuSelect = UISelectors.psuGpuSelect;
    const psuRamSelect = UISelectors.psuRamSelect;
    const psuDrivesInput = UISelectors.psuDrivesInput;
    const psuFansInput = UISelectors.psuFansInput;
    const psuOcCheckbox = UISelectors.psuOcCheckbox;

    if (!psuCpuSelect || !psuGpuSelect || !psuRamSelect || !psuDrivesInput || !psuFansInput) return;

    const cpuTdp = parseInt(psuCpuSelect.value, 10) || 0;
    const gpuTdp = parseInt(psuGpuSelect.value, 10) || 0;
    const ramCount = parseInt(psuRamSelect.value, 10) || 0;
    const drivesCount = parseInt(psuDrivesInput.value, 10) || 0;
    const fansCount = parseInt(psuFansInput.value, 10) || 0;
    const isOc = psuOcCheckbox ? psuOcCheckbox.checked : false;

    const baseDraw = 50; // motherboard, idle circuits

    let total = cpuTdp + gpuTdp + (ramCount * 5) + (drivesCount * 7) + (fansCount * 3) + baseDraw;
    if (isOc) {
        total = total * 1.15; // 15% overclock load margin
    }

    const estPeak = Math.round(total);
    let recommended = Math.ceil((estPeak * 1.30) / 50) * 50; // +30% peak limit rounded up to nearest 50W
    if (recommended < 350) recommended = 350;

    let efficiency = '80 Plus Bronze';
    if (recommended >= 400 && recommended < 650) {
        efficiency = '80 Plus Gold';
    } else if (recommended >= 650) {
        efficiency = '80 Plus Platinum / Titanium';
    }

    if (UISelectors.resValPsuEst) UISelectors.resValPsuEst.textContent = `${estPeak} W`;
    if (UISelectors.resValPsuRec) UISelectors.resValPsuRec.textContent = `${recommended} W`;
    if (UISelectors.resValPsuEff) UISelectors.resValPsuEff.textContent = efficiency;
}

// ==========================================================================
// PASSWORD GENERATOR & SHA-256 HASHER
// ==========================================================================

/**
 * Generates a secure random password using Web Crypto API.
 * Calculates its entropy and updates the DOM outputs.
 */
export function calculatePassword() {
    const pwdLengthInput = UISelectors.pwdLengthInput;
    const pwdOutputField = UISelectors.pwdOutputField;

    if (!pwdLengthInput || !pwdOutputField) return;

    const len = parseInt(pwdLengthInput.value, 10);
    const useLower = UISelectors.pwdLowerCheckbox ? UISelectors.pwdLowerCheckbox.checked : false;
    const useUpper = UISelectors.pwdUpperCheckbox ? UISelectors.pwdUpperCheckbox.checked : false;
    const useDigits = UISelectors.pwdDigitsCheckbox ? UISelectors.pwdDigitsCheckbox.checked : false;
    const useSymbols = UISelectors.pwdSymbolsCheckbox ? UISelectors.pwdSymbolsCheckbox.checked : false;

    const lenValEl = UISelectors.pwdLenVal;
    if (lenValEl) lenValEl.textContent = len;

    let charset = '';
    let requiredChars = [];

    // Push initial guarantees to prevent lack of complexity
    if (useLower) {
        charset += 'abcdefghijklmnopqrstuvwxyz';
        requiredChars.push('abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]);
    }
    if (useUpper) {
        charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        requiredChars.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]);
    }
    if (useDigits) {
        charset += '0123456789';
        requiredChars.push('0123456789'[Math.floor(Math.random() * 10)]);
    }
    if (useSymbols) {
        const symbolsList = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        charset += symbolsList;
        requiredChars.push(symbolsList[Math.floor(Math.random() * symbolsList.length)]);
    }

    if (!charset) {
        pwdOutputField.value = '';
        updatePasswordStrength(0, 0);
        return;
    }

    let result = '';
    // Cryptographically secure pseudorandom numbers generator (CSPRNG)
    const randomValues = new Uint32Array(len);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < len; i++) {
        result += charset[randomValues[i] % charset.length];
    }

    const resultArray = result.split('');
    // Inject required chars at startup indices
    for (let i = 0; i < requiredChars.length && i < len; i++) {
        resultArray[i] = requiredChars[i];
    }

    // Durstenfeld shuffle algorithms to mix guarantees inside array randomly
    for (let i = resultArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = resultArray[i];
        resultArray[i] = resultArray[j];
        resultArray[j] = temp;
    }

    const finalPassword = resultArray.join('');
    pwdOutputField.value = finalPassword;

    let poolSize = 0;
    if (useLower) poolSize += 26;
    if (useUpper) poolSize += 26;
    if (useDigits) poolSize += 10;
    if (useSymbols) poolSize += 26;

    const entropy = Math.round(len * Math.log2(poolSize));
    updatePasswordStrength(entropy, poolSize);
    calculateHashFor(finalPassword);
}

function updatePasswordStrength(entropy, poolSize) {
    const strengthEl = UISelectors.strengthEl;
    if (!strengthEl) return;

    if (poolSize === 0 || entropy === 0) {
        strengthEl.textContent = '---';
        strengthEl.className = 'result-val';
        return;
    }

    const lang = AppState.currentLang;
    const t = i18n[lang].calculator;
    let label = '';
    let ratingClass = '';

    if (entropy < 50) {
        label = t.pwdStrengthWeak.replace('{entropy}', entropy);
        ratingClass = 'strength-weak';
    } else if (entropy >= 50 && entropy < 80) {
        label = t.pwdStrengthMedium.replace('{entropy}', entropy);
        ratingClass = 'strength-medium';
    } else {
        label = t.pwdStrengthStrong.replace('{entropy}', entropy);
        ratingClass = 'strength-strong';
    }

    strengthEl.textContent = label;
    strengthEl.className = `result-val ${ratingClass}`;
}

/**
 * Computes a SHA-256 hash for the given string using Web Crypto API.
 * 
 * @param {string} text - The input string to hash
 */
export async function calculateHashFor(text) {
    const outputEl = UISelectors.resValHash;
    if (!outputEl) return;

    if (text === '') {
        outputEl.textContent = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        return;
    }

    try {
        const msgBuffer = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        outputEl.textContent = hashHex;
    } catch (e) {
        console.error('Hash calculation failed', e);
        outputEl.textContent = 'N/A';
    }
}

// ==========================================================================
// CISCO TOPOLOGY LAB
// ==========================================================================

/**
 * Simulates a typing console output for CCNA lab devices.
 * 
 * @param {string} deviceKey - Key corresponding to the device logs in translations
 */
export function runSimulatedConsole(deviceKey) {
    const consoleBody = UISelectors.consoleBody;
    const consoleHeaderTitle = UISelectors.consoleHeaderTitle;
    if (!consoleBody) return;
    
    if (consoleTimeout) {
        clearTimeout(consoleTimeout);
    }
    consoleBody.innerHTML = '';
    
    const langData = i18n[AppState.currentLang];
    if (!langData || !langData.ciscoLab || !langData.ciscoLab.devices) return;
    
    const logs = langData.ciscoLab.devices[deviceKey];
    if (!logs) return;

    if (consoleHeaderTitle) {
        consoleHeaderTitle.textContent = deviceKey.toUpperCase() + '_CONSOLE';
    }

    let lineIndex = 0;
    function printNextLine() {
        if (lineIndex < logs.length) {
            const line = document.createElement('div');
            line.className = 'console-line';
            line.textContent = logs[lineIndex];
            
            // Styled headers/prompts with themed color highlights
            if (logs[lineIndex].includes('#') || logs[lineIndex].includes(':$')) {
                line.style.color = 'var(--accent-color)';
                line.style.fontWeight = 'bold';
            } else {
                line.style.color = 'var(--text-light)';
            }
            
            consoleBody.appendChild(line);
            consoleBody.scrollTop = consoleBody.scrollHeight;
            
            lineIndex++;
            consoleTimeout = setTimeout(printNextLine, 120);
        }
    }
    printNextLine();
}

// ==========================================================================
// MODULE INITIALIZATION & EVENT REGISTER
// ==========================================================================

/**
 * Initializes all tool calculators, binding event listeners to UI inputs.
 */
export function initTools() {
    // --- CCNA Console Bindings ---
    if (UISelectors.topoNodes) {
        UISelectors.topoNodes.forEach(node => {
            node.addEventListener('click', () => {
                UISelectors.topoNodes.forEach(n => n.classList.remove('active'));
                node.classList.add('active');
                const device = node.getAttribute('data-device');
                AppState.activeTopoNode = device;
                runSimulatedConsole(device);
            });
        });
    }

    // --- Subnet Calculator Bindings ---
    if (UISelectors.ipInput && UISelectors.cidrSlider) {
        UISelectors.ipInput.addEventListener('input', calculateSubnet);
        UISelectors.cidrSlider.addEventListener('input', calculateSubnet);
        calculateSubnet(); // perform initial calculations
    }

    // --- Math Mode Switches ---
    if (UISelectors.stdToggle && UISelectors.sciToggle) {
        UISelectors.stdToggle.addEventListener('click', () => {
            UISelectors.stdToggle.classList.add('active');
            UISelectors.sciToggle.classList.remove('active');
            isSciMode = false;
            document.querySelectorAll('.calc-key.scientific').forEach(el => el.classList.add('hidden'));
            if (UISelectors.basesPanel) UISelectors.basesPanel.classList.add('hidden');
        });
        
        UISelectors.sciToggle.addEventListener('click', () => {
            UISelectors.sciToggle.classList.add('active');
            UISelectors.stdToggle.classList.remove('active');
            isSciMode = true;
            document.querySelectorAll('.calc-key.scientific').forEach(el => el.classList.remove('hidden'));
            if (UISelectors.basesPanel) UISelectors.basesPanel.classList.remove('hidden');
            updateBases();
        });
    }

    // --- Math Keypad Clicks ---
    if (UISelectors.mathKeypad) {
        UISelectors.mathKeypad.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.getAttribute('data-val');
                const action = btn.getAttribute('data-action');
                
                if (val !== null) {
                    if (mathDisplayExpr === '0' && val !== '.') {
                        mathDisplayExpr = val;
                        mathExpr = val;
                    } else {
                        mathDisplayExpr += val;
                        mathExpr += val;
                    }
                } else if (action !== null) {
                    handleMathAction(action);
                }
                
                updateMathScreen();
            });
        });
    }

    // --- RAID Calculator Bindings ---
    if (UISelectors.raidLevelSelect && UISelectors.raidDisksInput && UISelectors.raidCapacityInput && UISelectors.raidUnitSelect) {
        UISelectors.raidLevelSelect.addEventListener('change', calculateRaid);
        UISelectors.raidDisksInput.addEventListener('input', calculateRaid);
        UISelectors.raidCapacityInput.addEventListener('input', calculateRaid);
        UISelectors.raidUnitSelect.addEventListener('change', calculateRaid);
        calculateRaid(); // perform initial calculations
    }

    // --- PSU Calculator Bindings ---
    if (UISelectors.psuCpuSelect && UISelectors.psuGpuSelect && UISelectors.psuRamSelect && UISelectors.psuDrivesInput && UISelectors.psuFansInput) {
        UISelectors.psuCpuSelect.addEventListener('change', calculatePsu);
        UISelectors.psuGpuSelect.addEventListener('change', calculatePsu);
        UISelectors.psuRamSelect.addEventListener('change', calculatePsu);
        UISelectors.psuDrivesInput.addEventListener('input', calculatePsu);
        UISelectors.psuFansInput.addEventListener('input', calculatePsu);
        if (UISelectors.psuOcCheckbox) {
            UISelectors.psuOcCheckbox.addEventListener('change', calculatePsu);
        }
        calculatePsu(); // perform initial calculations
    }

    // --- Password Gen Bindings ---
    if (UISelectors.pwdLengthInput) {
        UISelectors.pwdLengthInput.addEventListener('input', calculatePassword);
    }
    
    [UISelectors.pwdLowerCheckbox, UISelectors.pwdUpperCheckbox, UISelectors.pwdDigitsCheckbox, UISelectors.pwdSymbolsCheckbox].forEach(cb => {
        if (cb) cb.addEventListener('change', calculatePassword);
    });

    if (UISelectors.btnPwdGenerate) {
        UISelectors.btnPwdGenerate.addEventListener('click', calculatePassword);
    }

    if (UISelectors.btnPwdCopy) {
        UISelectors.btnPwdCopy.addEventListener('click', () => {
            const pwd = UISelectors.pwdOutputField?.value;
            if (!pwd) return;
            navigator.clipboard.writeText(pwd);
            showHUDNotification(i18n[AppState.currentLang].calculator.pwdCopied, 'success');
        });
    }

    if (UISelectors.hashInput) {
        UISelectors.hashInput.addEventListener('input', (e) => {
            calculateHashFor(e.target.value);
        });
    }

    if (UISelectors.btnHashCopy) {
        UISelectors.btnHashCopy.addEventListener('click', () => {
            const hash = UISelectors.resValHash?.textContent;
            if (!hash) return;
            navigator.clipboard.writeText(hash);
            showHUDNotification(i18n[AppState.currentLang].calculator.hashCopied, 'success');
        });
    }

    // Initial password generation on load
    calculatePassword();
}

// React to dynamic language changes (recalculating localized results)
subscribe('currentLang', () => {
    calculateSubnet();
    calculateRaid();
    calculatePsu();
    calculatePassword();
    
    // Refresh CCNA console placeholder if empty, or reload active node
    if (AppState.activeTopoNode) {
        runSimulatedConsole(AppState.activeTopoNode);
    } else {
        const consolePlaceholder = UISelectors.consolePlaceholder;
        if (consolePlaceholder) {
            consolePlaceholder.textContent = i18n[AppState.currentLang].ciscoLab.consolePlaceholder;
        }
    }
});
