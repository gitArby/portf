import React, { useState, useRef, useEffect } from 'react';
import { ViewId, ThemeName } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme, hslToHex } from '../../context/ThemeContext';
import { useAudio } from '../../context/AudioContext';

interface NavbarProps {
  activeView: ViewId;
  onSelectView: (viewId: ViewId) => void;
  isScrolled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeView, onSelectView, isScrolled }) => {
  const { lang, toggleLang, t } = useLanguage();
  const {
    theme,
    setTheme,
    customHue,
    setCustomHue,
    customLightness,
    setCustomLightness,
    customHex,
  } = useTheme();
  const { audioEnabled, toggleAudio, playClick } = useAudio();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showColorPopover, setShowColorPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const customBtnRef = useRef<HTMLButtonElement>(null);

  const navItems: { id: ViewId; icon: string; label: string }[] = [
    { id: 'home-view', icon: 'fa-solid fa-house', label: t.nav[0] || 'Home' },
    { id: 'about-view', icon: 'fa-solid fa-user', label: t.nav[1] || 'O mně' },
    { id: 'skills-view', icon: 'fa-solid fa-screwdriver-wrench', label: t.nav[2] || 'Dovednosti' },
    { id: 'certificates-view', icon: 'fa-solid fa-certificate', label: t.nav[3] || 'Certifikáty' },
    { id: 'calculator-view', icon: 'fa-solid fa-sliders', label: t.nav[4] || 'Nástroje' },
    { id: 'terminal-view', icon: 'fa-solid fa-terminal', label: t.nav[5] || 'Terminál' },
    { id: 'experience-view', icon: 'fa-solid fa-briefcase', label: t.nav[6] || 'Praxe' },
    { id: 'lol-stats-view', icon: 'fa-solid fa-gamepad', label: t.nav[7] || 'LoL' },
    { id: 'games-view', icon: 'fa-solid fa-ghost', label: t.nav[8] || 'Minihry' },
    { id: 'projects-view', icon: 'fa-solid fa-laptop-code', label: t.nav[9] || 'Projekty' },
    { id: 'ipsum-view', icon: 'fa-solid fa-align-left', label: t.nav[10] || 'Ipsum' },
    { id: 'faq-view', icon: 'fa-solid fa-circle-question', label: t.nav[11] || 'FAQ' },
    { id: 'contact-view', icon: 'fa-solid fa-envelope', label: t.nav[12] || 'Kontakt' },
  ];

  const themes: { name: ThemeName; title: string; className: string }[] = [
    { name: 'green', title: 'Matrix Green', className: 'theme-green' },
    { name: 'blue', title: 'Cisco Blue', className: 'theme-blue' },
    { name: 'amber', title: 'Cyberpunk Amber', className: 'theme-amber' },
    { name: 'red', title: 'Valorant Red', className: 'theme-red' },
    { name: 'purple', title: 'Neon Purple', className: 'theme-purple' },
    { name: 'pink', title: 'Cyber Pink', className: 'theme-pink' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        customBtnRef.current &&
        !customBtnRef.current.contains(e.target as Node)
      ) {
        setShowColorPopover(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleNavClick = (viewId: ViewId) => {
    onSelectView(viewId);
    setIsMobileMenuOpen(false);
    playClick();
  };

  const handleThemeChange = (newTheme: ThemeName) => {
    setTheme(newTheme);
    setShowColorPopover(false);
    playClick();
  };

  const handleCustomThemeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTheme('custom');
    setShowColorPopover((prev) => !prev);
    playClick();
  };

  return (
    <nav className={`main-nav visible ${isScrolled ? 'scrolled' : ''}`} id="main-nav">
      <a
        href="#home-view"
        className={`nav-logo ${activeView === 'home-view' ? 'active' : ''}`}
        id="nav-logo"
        onClick={(e) => {
          e.preventDefault();
          handleNavClick('home-view');
        }}
      >
        arbyy
      </a>

      <button
        className={`nav-toggle ${isMobileMenuOpen ? 'open' : ''}`}
        id="nav-toggle"
        aria-label="Menu"
        onClick={() => {
          setIsMobileMenuOpen((prev) => !prev);
          playClick();
        }}
      >
        <span />
        <span />
        <span />
      </button>

      <ul className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`} id="nav-links">
        {navItems.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={activeView === item.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(item.id);
              }}
            >
              <i className={item.icon} /> <span>{item.label}</span>
            </a>
          </li>
        ))}

        <li className="nav-controls-footer" id="nav-controls-footer">
          <div className="theme-selector" id="theme-selector">
            {themes.map((tItem) => (
              <button
                key={tItem.name}
                className={`theme-dot ${tItem.className} ${theme === tItem.name ? 'active' : ''}`}
                data-theme={tItem.name}
                title={tItem.title}
                onClick={() => handleThemeChange(tItem.name)}
              />
            ))}

            <div className="theme-custom-wrapper" title="Vlastní barva">
              <button
                ref={customBtnRef}
                className={`theme-dot theme-custom ${theme === 'custom' ? 'active' : ''}`}
                data-theme="custom"
                id="btn-custom-theme"
                onClick={handleCustomThemeClick}
              >
                <i className="fa-solid fa-eye-dropper" />
              </button>

              <div
                ref={popoverRef}
                className={`custom-color-popover ${showColorPopover ? 'show' : ''}`}
                id="custom-color-popover"
              >
                <div className="popover-arrow" />
                <div
                  className="color-preview"
                  id="custom-color-preview"
                  style={{ backgroundColor: customHex }}
                />
                <div className="slider-group">
                  <i className="fa-solid fa-palette" />
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={customHue}
                    onChange={(e) => {
                      setCustomHue(parseInt(e.target.value, 10));
                    }}
                    className="hue-slider color-slider"
                    id="custom-hue-slider"
                    title="Odstín (Barva)"
                  />
                </div>
                <div className="slider-group">
                  <i className="fa-solid fa-sun" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={customLightness}
                    onChange={(e) => {
                      setCustomLightness(parseInt(e.target.value, 10));
                    }}
                    style={{
                      background: `linear-gradient(to right, #000000 0%, ${hslToHex(
                        customHue,
                        100,
                        50
                      )} 50%, #ffffff 100%)`,
                    }}
                    className="lightness-slider color-slider"
                    id="custom-lightness-slider"
                    title="Světlost (Jas)"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="nav-controls-row">
            <button
              className={`audio-toggle ${audioEnabled ? 'audio-on' : ''}`}
              id="audio-toggle"
              title="Zvuky"
              aria-label="Přepnout zvuky"
              onClick={() => {
                toggleAudio();
              }}
            >
              <i
                className={audioEnabled ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'}
                id="audio-icon"
              />
            </button>

            <button
              className="lang-toggle"
              id="lang-toggle"
              aria-label="Přepnout jazyk"
              onClick={() => {
                toggleLang();
                playClick();
              }}
            >
              <span className={`lang-opt ${lang === 'cs' ? 'active' : ''}`} id="opt-cs">
                CZ
              </span>
              <span className="lang-sep">/</span>
              <span className={`lang-opt ${lang === 'en' ? 'active' : ''}`} id="opt-en">
                EN
              </span>
            </button>
          </div>
        </li>
      </ul>
    </nav>
  );
};
