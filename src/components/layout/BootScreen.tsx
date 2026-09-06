import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const BootScreen: React.FC<{ onBootComplete?: () => void }> = ({ onBootComplete }) => {
  const { lang } = useLanguage();
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isFading, setIsFading] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const lines =
    lang === 'en'
      ? [
          '> Initializing arbyy_OS...',
          '> Loading hardware modules... [OK]',
          '> Connecting to League of Legends servers... [OK]',
          '> Welcome, user.',
        ]
      : [
          '> Inicializace arbyy_OS...',
          '> Načítání hardwarových modulů... [OK]',
          '> Připojování k League of Legends serverům... [OK]',
          '> Vítej, uživateli.',
        ];

  useEffect(() => {
    // Reveal lines one by one
    const timer1 = setTimeout(() => setVisibleLines(1), 300);
    const timer2 = setTimeout(() => setVisibleLines(2), 900);
    const timer3 = setTimeout(() => setVisibleLines(3), 1500);
    const timer4 = setTimeout(() => setVisibleLines(4), 2100);

    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2800);

    const doneTimer = setTimeout(() => {
      setIsDone(true);
      if (onBootComplete) onBootComplete();
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onBootComplete]);

  if (isDone) return null;

  return (
    <div id="boot-screen" className={isFading ? 'hidden' : ''}>
      <div className="terminal-text">
        {lines.map((line, idx) => (
          <p
            key={idx}
            style={{
              opacity: visibleLines > idx ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
          >
            {line}
          </p>
        ))}
        <div className="cursor-blink">_</div>
      </div>
    </div>
  );
};
