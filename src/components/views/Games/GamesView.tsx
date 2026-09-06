import React, { useState } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useAudio } from '../../../context/AudioContext';
import { SnakeGame } from './SnakeGame';
import { MinesweeperGame } from './MinesweeperGame';
import { TypingDefenseGame } from './TypingDefenseGame';

type GameTab = 'snake' | 'mines' | 'type';

export const GamesView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { lang, t } = useLanguage();
  const { playClick } = useAudio();
  const [activeTab, setActiveTab] = useState<GameTab>('snake');

  const handleTabChange = (tab: GameTab) => {
    setActiveTab(tab);
    playClick();
  };

  const tabs: { id: GameTab; label: string }[] = [
    { id: 'snake', label: lang === 'cs' ? 'Kybernetický had' : 'Cyber Snake' },
    { id: 'mines', label: lang === 'cs' ? 'Hacker Hledání min' : 'Hacker Minesweeper' },
    { id: 'type', label: lang === 'cs' ? 'Obrana firewallu' : 'Firewall Defense' },
  ];

  return (
    <div id="games-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="games" className="container reveal active">
        <h3 id="games-title" className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          {lang === 'cs' ? 'Minihry & Zábava' : 'Minigames & Fun'}
        </h3>
        <p className="container-text reveal-stagger" id="games-subtitle" style={{ '--stagger-delay': 2 } as React.CSSProperties}>
          {lang === 'cs'
            ? 'Klasický kyber-had na odreagování a hacker hledání min pro trénink síťového myšlení.'
            : 'Classic cyber snake to relax and hacker minesweeper for network logic practice.'}
        </p>

        <div className="calc-hub reveal-card active" style={{ '--stagger-delay': 3, maxWidth: 650 } as React.CSSProperties}>
          <div className="calc-tabs">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                className={`game-tab-btn ${activeTab === tb.id ? 'active' : ''}`}
                onClick={() => handleTabChange(tb.id)}
              >
                {tb.label}
              </button>
            ))}
          </div>

          <div className="calc-content">
            {activeTab === 'snake' && <SnakeGame />}
            {activeTab === 'mines' && <MinesweeperGame />}
            {activeTab === 'type' && <TypingDefenseGame />}
          </div>
        </div>
      </section>
    </div>
  );
};
