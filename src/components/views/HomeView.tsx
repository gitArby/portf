import React, { useState, useEffect, useRef } from 'react';
import { ViewId } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useEasterEgg } from '../../context/EasterEggContext';
import { useAudio } from '../../context/AudioContext';
import { useLanyard } from '../../hooks/useLanyard';
import { generateCV } from '../../utils/generateCV';

interface HomeViewProps {
  onNavigate: (viewId: ViewId) => void;
  isActive: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, isActive }) => {
  const { lang, t } = useLanguage();
  const { triggerMatrixRain } = useEasterEgg();
  const { playClick } = useAudio();
  const { data: lanyardData } = useLanyard();

  // Typewriter effect
  const [typewriterText, setTypewriterText] = useState('');
  const phrases = t.subtitle || ['Tech nadšenec', 'hráč her', 'PC builder', 'web developer'];

  useEffect(() => {
    let pIdx = 0;
    let cIdx = 0;
    let isDeleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const currentPhrase = phrases[pIdx] || '';
      if (isDeleting) {
        cIdx--;
        setTypewriterText(currentPhrase.slice(0, cIdx));
      } else {
        cIdx++;
        setTypewriterText(currentPhrase.slice(0, cIdx));
      }

      let delay = isDeleting ? 60 : 100;

      if (!isDeleting && cIdx === currentPhrase.length) {
        delay = 2000;
        isDeleting = true;
      } else if (isDeleting && cIdx === 0) {
        isDeleting = false;
        pIdx = (pIdx + 1) % phrases.length;
        delay = 400;
      }

      timeoutId = setTimeout(tick, delay);
    };

    timeoutId = setTimeout(tick, 1000);
    return () => clearTimeout(timeoutId);
  }, [phrases]);

  // Mega text click count for Easter Egg
  const [clickCount, setClickCount] = useState(0);
  const lastClickRef = useRef(0);

  const handleMegaClick = () => {
    const now = Date.now();
    const isRapid = now - lastClickRef.current < 500;
    lastClickRef.current = now;
    const newCount = isRapid ? clickCount + 1 : 1;
    setClickCount(newCount);

    if (newCount === 6) {
      triggerMatrixRain();
      setClickCount(0);
    }
    playClick();
  };

  // Animated counters
  const targets = [3000, 5, 5, 20];
  const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    if (!isActive) return;

    let frameId: number;
    let startTime: number | null = null;
    const duration = 1600;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for realistic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCounts(targets.map((tgt) => Math.floor(easeOut * tgt)));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setCounts(targets);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [isActive]);

  const statusColors = {
    online: '#43b581',
    idle: '#faa61a',
    dnd: '#f04747',
    offline: '#747f8d',
  };
  const discordStatus = lanyardData?.discord_status || 'offline';
  const statusColor = statusColors[discordStatus];

  return (
    <div id="home-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <header className="hero">
        <h1
          className="mega-text glitch-hover"
          id="mega-trigger"
          data-text="arbyy"
          onClick={handleMegaClick}
          style={{ cursor: 'pointer' }}
          title="Klikni 6x za sebou..."
        >
          arbyy
        </h1>
        <h2 className="name">Adam "Arbyy" Macků</h2>
        <p className="subtitle">
          <span id="typewriter">{typewriterText}</span>
          <span className="tw-cursor">|</span>
        </p>

        <div className="social-links">
          <a
            href="https://github.com/gitArby"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub"
            aria-label="GitHub profil"
          >
            <i className="fa-brands fa-github" />
          </a>
          <a
            href="https://www.instagram.com/adam.macku"
            target="_blank"
            rel="noopener noreferrer"
            title="Instagram"
            aria-label="Instagram profil"
          >
            <i className="fa-brands fa-instagram" />
          </a>
          <a
            href="https://steamcommunity.com/id/TadyArby"
            target="_blank"
            rel="noopener noreferrer"
            title="Steam"
          >
            <i className="fa-brands fa-steam" />
          </a>
          <a
            href="https://www.tiktok.com/@arbycek"
            target="_blank"
            rel="noopener noreferrer"
            title="TikTok"
          >
            <i className="fa-brands fa-tiktok" />
          </a>
          <div className="discord-badge" title={`Můj Discord arbyy (${discordStatus})`}>
            <i className="fa-brands fa-discord" /> <span>arbyy</span>
            <span
              className="status-dot"
              id="discord-status"
              style={{ background: statusColor }}
            />
          </div>
        </div>

        <div className="hero-actions">
          <a
            href="#contact-view"
            className="btn"
            id="btn-hero-contact"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('contact-view');
            }}
          >
            {t.hero.contactBtn}
          </a>
          <a
            href="#cv"
            className="btn btn-cv"
            id="btn-hero-cv"
            onClick={(e) => {
              e.preventDefault();
              generateCV(lang);
            }}
          >
            <i className="fa-solid fa-file-pdf" /> {t.hero.cvBtn}
          </a>
        </div>
      </header>

      <section className="container reveal active">
        <div className="counters-grid">
          <div className="counter-item">
            <div className="counter-value">
              <span className="counter-number">
                {counts[0].toLocaleString(lang === 'cs' ? 'cs-CZ' : 'en-US')}
              </span>
              <span className="counter-suffix">+</span>
            </div>
            <span className="counter-label">{t.counters?.[0] || 'hodin v LoL'}</span>
          </div>
          <div className="counter-item">
            <div className="counter-value">
              <span className="counter-number">{counts[1]}</span>
              <span className="counter-suffix">+</span>
            </div>
            <span className="counter-label">{t.counters?.[1] || 'sestavených PC'}</span>
          </div>
          <div className="counter-item">
            <div className="counter-value">
              <span className="counter-number">{counts[2]}</span>
              <span className="counter-suffix">+</span>
            </div>
            <span className="counter-label">{t.counters?.[2] || 'roky v tech'}</span>
          </div>
          <div className="counter-item">
            <div className="counter-value">
              <span className="counter-number">{counts[3]}</span>
              <span className="counter-suffix">+</span>
            </div>
            <span className="counter-label">{t.counters?.[3] || 'projektů'}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
