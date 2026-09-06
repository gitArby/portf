import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAudio } from '../../../context/AudioContext';

export const PasswordGenerator: React.FC = () => {
  const { t } = useLanguage();
  const { playClick } = useAudio();

  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [entropy, setEntropy] = useState(0);
  const [copied, setCopied] = useState(false);

  // SHA-256 state
  const [hashInput, setHashInput] = useState('');
  const [hashOutput, setHashOutput] = useState('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [hashCopied, setHashCopied] = useState(false);

  const generatePassword = () => {
    let charset = '';
    const requiredChars: string[] = [];

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
      setPassword('');
      setEntropy(0);
      return;
    }

    let result = '';
    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }

    const resultArray = result.split('');
    for (let i = 0; i < requiredChars.length && i < length; i++) {
      resultArray[i] = requiredChars[i];
    }

    for (let i = resultArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = resultArray[i];
      resultArray[i] = resultArray[j];
      resultArray[j] = temp;
    }

    const finalPass = resultArray.join('');
    setPassword(finalPass);

    let poolSize = 0;
    if (useLower) poolSize += 26;
    if (useUpper) poolSize += 26;
    if (useDigits) poolSize += 10;
    if (useSymbols) poolSize += 26;

    const ent = Math.round(length * Math.log2(poolSize));
    setEntropy(ent);
    playClick();
  };

  useEffect(() => {
    generatePassword();
  }, [length, useLower, useUpper, useDigits, useSymbols]);

  // Compute SHA-256
  useEffect(() => {
    if (hashInput === '') {
      setHashOutput('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      return;
    }

    const msgBuffer = new TextEncoder().encode(hashInput);
    crypto.subtle
      .digest('SHA-256', msgBuffer)
      .then((hashBuffer) => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
        setHashOutput(hashHex);
      })
      .catch(() => setHashOutput('N/A'));
  }, [hashInput]);

  const handleCopyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    playClick();
  };

  const handleCopyHash = () => {
    if (!hashOutput) return;
    navigator.clipboard.writeText(hashOutput).then(() => {
      setHashCopied(true);
      setTimeout(() => setHashCopied(false), 2000);
    });
    playClick();
  };

  const pwdT = t.calculator as unknown as {
    lblPwdLength?: string;
    lblPwdLower?: string;
    lblPwdUpper?: string;
    lblPwdDigits?: string;
    lblPwdSymbols?: string;
    resLblPwdStrength?: string;
    pwdStrengthWeak?: string;
    pwdStrengthMedium?: string;
    pwdStrengthStrong?: string;
  };

  let strengthLabel = '---';
  let strengthClass = '';
  if (entropy > 0) {
    if (entropy < 50) {
      strengthLabel = (pwdT?.pwdStrengthWeak || 'Slabé ({entropy} bitů)').replace('{entropy}', String(entropy));
      strengthClass = 'strength-weak';
    } else if (entropy < 80) {
      strengthLabel = (pwdT?.pwdStrengthMedium || 'Střední ({entropy} bitů)').replace('{entropy}', String(entropy));
      strengthClass = 'strength-medium';
    } else {
      strengthLabel = (pwdT?.pwdStrengthStrong || 'Silné ({entropy} bitů)').replace('{entropy}', String(entropy));
      strengthClass = 'strength-strong';
    }
  }

  return (
    <div className="calc-view active" id="view-password">
      <div className="subnet-input-grid">
        <div className="input-field span-2">
          <label htmlFor="pwd-length">
            {pwdT?.lblPwdLength || 'Délka hesla:'} <span>{length}</span>
          </label>
          <input
            type="range"
            id="pwd-length"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10))}
            className="slider"
          />
        </div>

        <div className="input-field span-2 checkboxes-grid">
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="pwd-lower"
              checked={useLower}
              onChange={(e) => setUseLower(e.target.checked)}
            />
            <label htmlFor="pwd-lower">{pwdT?.lblPwdLower || 'Malá písmena (a-z)'}</label>
          </div>
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="pwd-upper"
              checked={useUpper}
              onChange={(e) => setUseUpper(e.target.checked)}
            />
            <label htmlFor="pwd-upper">{pwdT?.lblPwdUpper || 'Velká písmena (A-Z)'}</label>
          </div>
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="pwd-digits"
              checked={useDigits}
              onChange={(e) => setUseDigits(e.target.checked)}
            />
            <label htmlFor="pwd-digits">{pwdT?.lblPwdDigits || 'Číslice (0-9)'}</label>
          </div>
          <div className="checkbox-container">
            <input
              type="checkbox"
              id="pwd-symbols"
              checked={useSymbols}
              onChange={(e) => setUseSymbols(e.target.checked)}
            />
            <label htmlFor="pwd-symbols">{pwdT?.lblPwdSymbols || 'Symboly (!@#$...)'}</label>
          </div>
        </div>
      </div>

      <div className="password-output-field">
        <input type="text" id="pwd-output" readOnly value={password} placeholder="Generuji..." />
        <button
          className="btn btn-action"
          id="btn-pwd-copy"
          title="Zkopírovat heslo"
          aria-label="Zkopírovat heslo"
          onClick={handleCopyPassword}
        >
          <i className={copied ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
        </button>
        <button className="btn btn-action" id="btn-pwd-generate" onClick={generatePassword}>
          Generovat
        </button>
      </div>

      <div className="result-row password-strength-row">
        <span className="result-label">{pwdT?.resLblPwdStrength || 'Síla hesla / Entropie:'}</span>
        <span className={`result-val ${strengthClass}`}>{strengthLabel}</span>
      </div>

      {/* SHA-256 HASH GENERATOR */}
      <div className="binary-header" id="hash-hdr">
        SHA-256 Hasher
      </div>
      <div className="hash-section-wrapper">
        <div className="input-field">
          <input
            type="text"
            id="hash-input"
            placeholder="Zadejte text pro SHA-256 hash..."
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
          />
        </div>
        <div className="result-row hash-output-row">
          <span className="result-val" id="res-val-hash">
            {hashOutput}
          </span>
          <button className="btn-copy" id="btn-hash-copy" title="Zkopírovat hash" onClick={handleCopyHash}>
            <i className={hashCopied ? 'fa-solid fa-check' : 'fa-regular fa-copy'} />
          </button>
        </div>
      </div>
    </div>
  );
};
