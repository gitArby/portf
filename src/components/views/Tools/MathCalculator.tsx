import React, { useState } from 'react';
import { useAudio } from '../../../context/AudioContext';

export const MathCalculator: React.FC = () => {
  const { playClick } = useAudio();
  const [isSciMode, setIsSciMode] = useState(false);
  const [displayExpr, setDisplayExpr] = useState('0');
  const [mathExpr, setMathExpr] = useState('');
  const [history, setHistory] = useState('');
  const [bases, setBases] = useState({ dec: '0', hex: '0', bin: '0' });

  const updateBases = (valStr: string) => {
    const num = parseFloat(valStr);
    if (!isNaN(num) && isFinite(num) && Number.isInteger(num)) {
      const intVal = num >>> 0;
      setBases({
        dec: num.toString(10),
        hex: '0x' + intVal.toString(16).toUpperCase(),
        bin: intVal.toString(2).match(/.{1,8}/g)?.join(' ') || intVal.toString(2),
      });
    } else {
      setBases({ dec: 'N/A', hex: 'N/A', bin: 'N/A' });
    }
  };

  const evaluateMath = () => {
    if (mathExpr === '') return;
    try {
      const sanitized = mathExpr
        .replace(/Math\.(sin|cos|tan|log10|log|sqrt|PI|E)/g, '')
        .replace(/[0-9+\-*/().\s%]/g, '')
        .replace(/\*\*/g, '');

      if (sanitized.trim() !== '') {
        throw new Error('Invalid Expression');
      }

      const evalFn = new Function(`return (${mathExpr})`);
      const resVal = evalFn();

      if (resVal === undefined || isNaN(resVal) || !isFinite(resVal)) {
        throw new Error('Math Error');
      }

      const rounded = parseFloat(resVal.toFixed(8));
      setHistory(displayExpr + ' =');
      setDisplayExpr(String(rounded));
      setMathExpr(String(rounded));
      if (isSciMode) updateBases(String(rounded));
    } catch {
      setHistory(displayExpr);
      setDisplayExpr('Error');
      setMathExpr('');
      setBases({ dec: 'N/A', hex: 'N/A', bin: 'N/A' });
    }
  };

  const handleKey = (action?: string, val?: string) => {
    playClick();

    if (val !== undefined) {
      if (displayExpr === '0' && val !== '.') {
        setDisplayExpr(val);
        setMathExpr(val);
      } else {
        setDisplayExpr((prev) => prev + val);
        setMathExpr((prev) => prev + val);
      }
      return;
    }

    if (!action) return;

    switch (action) {
      case 'clear':
        setDisplayExpr('0');
        setMathExpr('');
        setHistory('');
        setBases({ dec: '0', hex: '0', bin: '0' });
        break;
      case 'backspace':
        if (displayExpr.length > 1 && displayExpr !== 'Error') {
          setDisplayExpr((prev) => prev.slice(0, -1));
          setMathExpr((prev) => prev.slice(0, -1));
        } else {
          setDisplayExpr('0');
          setMathExpr('');
        }
        break;
      case 'divide':
        setDisplayExpr((prev) => prev + ' ÷ ');
        setMathExpr((prev) => prev + '/');
        break;
      case 'multiply':
        setDisplayExpr((prev) => prev + ' × ');
        setMathExpr((prev) => prev + '*');
        break;
      case 'subtract':
        setDisplayExpr((prev) => prev + ' - ');
        setMathExpr((prev) => prev + '-');
        break;
      case 'add':
        setDisplayExpr((prev) => prev + ' + ');
        setMathExpr((prev) => prev + '+');
        break;
      case 'sin':
        setDisplayExpr((prev) => (prev === '0' ? 'sin(' : prev + 'sin('));
        setMathExpr((prev) => prev + 'Math.sin(');
        break;
      case 'cos':
        setDisplayExpr((prev) => (prev === '0' ? 'cos(' : prev + 'cos('));
        setMathExpr((prev) => prev + 'Math.cos(');
        break;
      case 'tan':
        setDisplayExpr((prev) => (prev === '0' ? 'tan(' : prev + 'tan('));
        setMathExpr((prev) => prev + 'Math.tan(');
        break;
      case 'log':
        setDisplayExpr((prev) => (prev === '0' ? 'log(' : prev + 'log('));
        setMathExpr((prev) => prev + 'Math.log10(');
        break;
      case 'ln':
        setDisplayExpr((prev) => (prev === '0' ? 'ln(' : prev + 'ln('));
        setMathExpr((prev) => prev + 'Math.log(');
        break;
      case 'sqrt':
        setDisplayExpr((prev) => (prev === '0' ? '√(' : prev + '√('));
        setMathExpr((prev) => prev + 'Math.sqrt(');
        break;
      case 'pow':
        setDisplayExpr((prev) => prev + '^');
        setMathExpr((prev) => prev + '**');
        break;
      case 'pi':
        setDisplayExpr((prev) => (prev === '0' ? 'π' : prev + 'π'));
        setMathExpr((prev) => prev + 'Math.PI');
        break;
      case 'e':
        setDisplayExpr((prev) => (prev === '0' ? 'e' : prev + 'e'));
        setMathExpr((prev) => prev + 'Math.E');
        break;
      case 'open-paren':
        setDisplayExpr((prev) => (prev === '0' ? '(' : prev + '('));
        setMathExpr((prev) => prev + '(');
        break;
      case 'close-paren':
        setDisplayExpr((prev) => prev + ')');
        setMathExpr((prev) => prev + ')');
        break;
      case 'mod':
        setDisplayExpr((prev) => prev + ' mod ');
        setMathExpr((prev) => prev + '%');
        break;
      case 'equals':
        evaluateMath();
        break;
    }
  };

  return (
    <div className="calc-view active" id="view-math">
      <div className="math-mode-toggle">
        <span id="math-mode-label">Režim:</span>
        <button
          className={`mode-toggle-btn ${!isSciMode ? 'active' : ''}`}
          id="math-mode-std"
          onClick={() => {
            setIsSciMode(false);
            playClick();
          }}
        >
          Standardní
        </button>
        <button
          className={`mode-toggle-btn ${isSciMode ? 'active' : ''}`}
          id="math-mode-sci"
          onClick={() => {
            setIsSciMode(true);
            updateBases(displayExpr);
            playClick();
          }}
        >
          Vědecká
        </button>
      </div>

      <div className="math-screen">
        <div className="math-history" id="math-history">
          {history}
        </div>
        <div className="math-display" id="math-display">
          {displayExpr}
        </div>
      </div>

      <div className={`math-keypad ${isSciMode ? 'scientific' : 'standard'}`} id="math-keypad">
        {/* Scientific Keys */}
        {isSciMode && (
          <>
            <button className="calc-key scientific" onClick={() => handleKey('sin')}>sin</button>
            <button className="calc-key scientific" onClick={() => handleKey('cos')}>cos</button>
            <button className="calc-key scientific" onClick={() => handleKey('tan')}>tan</button>
            <button className="calc-key scientific" onClick={() => handleKey('log')}>log</button>

            <button className="calc-key scientific" onClick={() => handleKey('ln')}>ln</button>
            <button className="calc-key scientific" onClick={() => handleKey('sqrt')}>√</button>
            <button className="calc-key scientific" onClick={() => handleKey('pow')}>xʸ</button>
            <button className="calc-key scientific" onClick={() => handleKey('pi')}>π</button>

            <button className="calc-key scientific" onClick={() => handleKey('e')}>e</button>
            <button className="calc-key scientific" onClick={() => handleKey('open-paren')}>(</button>
            <button className="calc-key scientific" onClick={() => handleKey('close-paren')}>)</button>
            <button className="calc-key scientific" onClick={() => handleKey('mod')}>mod</button>
          </>
        )}

        {/* Standard Keys */}
        <button className="calc-key action-key" onClick={() => handleKey('clear')}>C</button>
        <button className="calc-key action-key" onClick={() => handleKey('backspace')}>⌫</button>
        <button className="calc-key op-key" onClick={() => handleKey('divide')}>÷</button>
        <button className="calc-key op-key" onClick={() => handleKey('multiply')}>×</button>

        <button className="calc-key num-key" onClick={() => handleKey(undefined, '7')}>7</button>
        <button className="calc-key num-key" onClick={() => handleKey(undefined, '8')}>8</button>
        <button className="calc-key num-key" onClick={() => handleKey(undefined, '9')}>9</button>
        <button className="calc-key op-key" onClick={() => handleKey('subtract')}>-</button>

        <button className="calc-key num-key" onClick={() => handleKey(undefined, '4')}>4</button>
        <button className="calc-key num-key" onClick={() => handleKey(undefined, '5')}>5</button>
        <button className="calc-key num-key" onClick={() => handleKey(undefined, '6')}>6</button>
        <button className="calc-key op-key" onClick={() => handleKey('add')}>+</button>

        <button className="calc-key num-key" onClick={() => handleKey(undefined, '1')}>1</button>
        <button className="calc-key num-key" onClick={() => handleKey(undefined, '2')}>2</button>
        <button className="calc-key num-key" onClick={() => handleKey(undefined, '3')}>3</button>
        <button className="calc-key equals-key" onClick={() => handleKey('equals')}>=</button>

        <button className="calc-key num-key double-width" onClick={() => handleKey(undefined, '0')}>0</button>
        <button className="calc-key num-key" onClick={() => handleKey(undefined, '.')}>.</button>
      </div>

      {isSciMode && (
        <div className="math-bases scientific" id="math-bases">
          <div className="base-row">
            <span className="base-lbl">DEC</span>
            <span className="base-val">{bases.dec}</span>
          </div>
          <div className="base-row">
            <span className="base-lbl">HEX</span>
            <span className="base-val">{bases.hex}</span>
          </div>
          <div className="base-row">
            <span className="base-lbl">BIN</span>
            <span className="base-val">{bases.bin}</span>
          </div>
        </div>
      )}
    </div>
  );
};
