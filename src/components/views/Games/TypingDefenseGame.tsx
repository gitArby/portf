import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAudio } from '../../../context/AudioContext';

const dictCS = [
  'sit', 'smerovac', 'prepinac', 'brana', 'paket', 'adresa', 'uzel', 'pripojeni',
  'databaze', 'heslo', 'sifrovani', 'klic', 'uzivatel', 'kabel', 'protokol',
  'vlakno', 'server', 'klient', 'pamet', 'jadro', 'procesor', 'hlavicka',
  'maska', 'rozsah', 'vypocet', 'analyza', 'hrozba', 'filtr', 'konzole',
  'vstup', 'vystup', 'spojeni', 'trida', 'odkaz', 'chyba'
];

const dictEN = [
  'network', 'router', 'switch', 'gateway', 'packet', 'address', 'node',
  'connection', 'database', 'password', 'encryption', 'key', 'user', 'cable',
  'protocol', 'fiber', 'server', 'client', 'memory', 'kernel', 'processor',
  'header', 'mask', 'range', 'compute', 'analysis', 'threat', 'filter',
  'console', 'input', 'output', 'link', 'class', 'error', 'session', 'firewall',
  'security'
];

interface FallingWord {
  id: number;
  word: string;
  top: number;
  left: number;
}

export const TypingDefenseGame: React.FC = () => {
  const { lang, t } = useLanguage();
  const { playClick, playNotificationSound } = useAudio();

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('type_highscore') || '0', 10);
  });
  const [integrity, setIntegrity] = useState(100);
  const [words, setWords] = useState<FallingWord[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [gameState, setGameState] = useState<'idle' | 'running' | 'gameover'>('idle');

  const wordsRef = useRef<FallingWord[]>([]);
  wordsRef.current = words;
  const integrityRef = useRef(integrity);
  integrityRef.current = integrity;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const loopRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawnTimerRef = useRef(0);
  const nextWordIdRef = useRef(1);
  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const spawnWord = () => {
    const dict = lang === 'cs' ? dictCS : dictEN;
    const randomWord = dict[Math.floor(Math.random() * dict.length)];
    const leftPercent = 5 + Math.random() * 75;

    const newWord: FallingWord = {
      id: nextWordIdRef.current++,
      word: randomWord,
      top: 0,
      left: leftPercent,
    };

    setWords((prev) => [...prev, newWord]);
  };

  const tick = () => {
    spawnTimerRef.current += 20;
    const spawnRate = Math.max(800, 2000 - scoreRef.current * 15);
    if (spawnTimerRef.current >= spawnRate) {
      spawnWord();
      spawnTimerRef.current = 0;
    }

    const speed = (1.0 + scoreRef.current / 150) * 0.9;
    const screenHeight = screenRef.current ? screenRef.current.clientHeight : 320;

    let breached = false;
    const nextWords: FallingWord[] = [];

    wordsRef.current.forEach((w) => {
      const newTop = w.top + speed;
      if (newTop >= screenHeight - 24) {
        breached = true;
      } else {
        nextWords.push({ ...w, top: newTop });
      }
    });

    if (breached) {
      playNotificationSound('error');
      const newIntegrity = Math.max(0, integrityRef.current - 20);
      setIntegrity(newIntegrity);
      if (newIntegrity <= 0) {
        handleGameOver();
        return;
      }
    }

    setWords(nextWords);
  };

  const handleGameOver = () => {
    if (loopRef.current) clearInterval(loopRef.current);
    setGameState('gameover');
    playNotificationSound('error');
  };

  const startGame = () => {
    setScore(0);
    setIntegrity(100);
    setWords([]);
    setInputValue('');
    setGameState('running');
    playClick();

    if (loopRef.current) clearInterval(loopRef.current);
    loopRef.current = setInterval(tick, 20);

    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().trim();
    setInputValue(e.target.value);

    // Check if typed word matches any falling word
    const matchIdx = words.findIndex((w) => w.word.toLowerCase() === val);
    if (matchIdx !== -1) {
      // Word defended!
      playNotificationSound('success');
      setWords((prev) => prev.filter((_, idx) => idx !== matchIdx));
      setInputValue('');
      setScore((prev) => {
        const newScore = prev + 10;
        if (newScore > highScore) {
          setHighScore(newScore);
          localStorage.setItem('type_highscore', String(newScore));
        }
        return newScore;
      });
    }
  };

  useEffect(() => {
    return () => {
      if (loopRef.current) clearInterval(loopRef.current);
    };
  }, []);

  const overlayText =
    gameState === 'idle'
      ? lang === 'cs'
        ? 'Stiskněte START pro spuštění'
        : 'Press START to Play'
      : lang === 'cs'
      ? `Firewall prolomen! Skóre: ${score}`
      : `Firewall Breached! Score: ${score}`;

  return (
    <div className="game-view active" id="view-game-type">
      <div className="game-scoreboard">
        <div className="score-box">
          <span>{lang === 'cs' ? 'Skóre:' : 'Score:'}</span> <strong>{score}</strong>
        </div>
        <div className="score-box">
          <span>{lang === 'cs' ? 'Nejlepší:' : 'Highscore:'}</span> <strong>{highScore}</strong>
        </div>
        <div className="score-box" style={{ flexGrow: 1, maxWidth: 250, justifyContent: 'flex-end' }}>
          <span>{lang === 'cs' ? 'Integrita:' : 'Integrity:'}</span>
          <div
            className="integrity-bar-container"
            style={{
              flexGrow: 1,
              height: 8,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 4,
              overflow: 'hidden',
              maxWidth: 120,
              marginLeft: '0.5rem',
              marginRight: '0.5rem',
            }}
          >
            <div
              id="type-integrity-fill"
              style={{
                width: `${integrity}%`,
                height: '100%',
                background:
                  integrity > 50
                    ? 'var(--accent-color)'
                    : integrity > 25
                    ? '#ffb703'
                    : 'var(--arbyy-error)',
                transition: 'width 0.3s ease, background-color 0.3s ease',
              }}
            />
          </div>
          <strong style={{ fontSize: '0.8rem', minWidth: 32, textAlign: 'right' }}>
            {integrity}%
          </strong>
        </div>
      </div>

      <div className="type-screen-wrapper">
        <div ref={screenRef} id="type-terminal-screen">
          {words.map((w) => (
            <div
              key={w.id}
              className="type-falling-word"
              style={{ left: `${w.left}%`, top: `${w.top}px` }}
            >
              {w.word}
            </div>
          ))}
        </div>

        {gameState !== 'running' && (
          <div className="game-overlay" id="type-overlay">
            <div className="overlay-text">{overlayText}</div>
            <button
              className="btn"
              id="btn-type-start"
              style={{ marginTop: '1rem', padding: '0.6rem 1.8rem', fontSize: '0.8rem' }}
              onClick={startGame}
            >
              {gameState === 'idle' ? 'START' : lang === 'cs' ? 'HRÁT ZNOVU' : 'PLAY AGAIN'}
            </button>
          </div>
        )}
      </div>

      <div
        className="type-input-row"
        style={{
          marginTop: '1rem',
          display: 'flex',
          gap: '0.5rem',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <input
          ref={inputRef}
          type="text"
          id="type-input"
          autoComplete="off"
          placeholder={lang === 'cs' ? 'Zadejte slovo...' : 'Type word...'}
          value={inputValue}
          onChange={handleInputChange}
          disabled={gameState !== 'running'}
          style={{
            textAlign: 'center',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            fontWeight: 'bold',
            width: '100%',
            maxWidth: 300,
            padding: '0.75rem 1rem',
          }}
        />
        <button
          className="btn btn-action"
          id="btn-type-reset"
          onClick={startGame}
          style={{ padding: '0.5rem 1.2rem', fontSize: '0.75rem' }}
        >
          RESTART
        </button>
      </div>
    </div>
  );
};
