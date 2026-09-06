import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { DiscordCard } from './DiscordCard';

export const AboutView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { t } = useLanguage();

  return (
    <div id="about-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="about" className="container reveal active">
        <div className="about-grid">
          <div className="about-left">
            <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
              {t.about.title}
            </h3>
            <p
              className="reveal-stagger"
              style={{ '--stagger-delay': 2 } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: t.about.text }}
            />
            <div
              className="about-meta reveal-stagger"
              style={{ '--stagger-delay': 3 } as React.CSSProperties}
            >
              <div className="meta-item">
                <span className="meta-label">{t.about.locationLabel}</span>
                <span className="meta-value">{t.about.locationValue}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">{t.about.languagesLabel}</span>
                <span className="meta-value">{t.about.languagesValue}</span>
              </div>
            </div>
          </div>
          <div
            className="about-right reveal-card active"
            style={{ '--stagger-delay': 4 } as React.CSSProperties}
          >
            <DiscordCard />
          </div>
        </div>
      </section>
    </div>
  );
};
