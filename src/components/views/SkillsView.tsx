import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useEasterEgg } from '../../context/EasterEggContext';

export const SkillsView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { t } = useLanguage();
  const { discoverEgg } = useEasterEgg();

  return (
    <div id="skills-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="skills" className="container reveal active">
        <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          {t.skills.title}
        </h3>
        <p
          className="container-text reveal-stagger"
          style={{ '--stagger-delay': 2 } as React.CSSProperties}
          dangerouslySetInnerHTML={{ __html: t.skills.text }}
        />

        <div className="skills-categories">
          {/* Programování & Web */}
          <div
            className="skills-category-card reveal-card active"
            style={{ '--stagger-delay': 3 } as React.CSSProperties}
          >
            <div className="category-header">
              <i className="fa-solid fa-code" />
              <h4 className="category-title">{t.skills.catWeb || 'Vývoj & Web'}</h4>
            </div>
            <div className="tech-grid">
              <div className="tech-icon"><i className="devicon-html5-plain colored" /><span>HTML</span></div>
              <div className="tech-icon"><i className="devicon-css3-plain colored" /><span>CSS</span></div>
              <div className="tech-icon"><i className="devicon-sass-original colored" /><span>SASS</span></div>
              <div className="tech-icon"><i className="devicon-javascript-plain colored" /><span>JavaScript</span></div>
              <div className="tech-icon"><i className="devicon-python-plain colored" /><span>Python</span></div>
              <div className="tech-icon"><i className="devicon-django-plain colored" /><span>Django</span></div>
              <div className="tech-icon"><i className="devicon-php-plain colored" /><span id="skill-php">{t.skills.php || 'PHP (základy)'}</span></div>
              <div className="tech-icon"><i className="devicon-apache-plain colored" style={{ fontSize: '1.5rem', color: '#D22128' }} /><span id="skill-apache">Apache (XAMPP)</span></div>
              <div className="tech-icon"><i className="fa-solid fa-table-list" style={{ color: '#f89d13' }} /><span id="skill-pma">phpMyAdmin</span></div>
              <div className="tech-icon"><i className="fa-solid fa-database" /><span>SQL</span></div>
              <div className="tech-icon"><i className="fa-solid fa-cubes" /><span id="skill-oop">{t.skills.oop || 'OOP & Návrhové vzory'}</span></div>
              <div className="tech-icon"><i className="fa-solid fa-project-diagram" /><span id="skill-graphs">{t.skills.graphs || 'Teorie grafů'}</span></div>
              <div className="tech-icon"><i className="fa-solid fa-robot" /><span id="skill-ai">{t.skills.ai || 'AI Tvorba (Claude/Gemini)'}</span></div>
            </div>
          </div>

          {/* Sítě */}
          <div
            className="skills-category-card reveal-card active"
            style={{ '--stagger-delay': 4 } as React.CSSProperties}
          >
            <div className="category-header">
              <i className="fa-solid fa-network-wired" />
              <h4 className="category-title">{t.skills.catNet || 'Počítačové sítě'}</h4>
            </div>
            <div className="tech-grid">
              <div className="tech-icon"><i className="fa-solid fa-ethernet" /><span>CCNA 1</span></div>
              <div className="tech-icon"><i className="fa-solid fa-route" /><span>CCNA 2</span></div>
              <div className="tech-icon"><i className="fa-solid fa-diagram-project" /><span>Packet Tracer</span></div>
              <div className="tech-icon"><i className="fa-solid fa-globe" /><span>TCP/IP & DNS</span></div>
            </div>
          </div>

          {/* Hardware & OS */}
          <div
            className="skills-category-card reveal-card active"
            style={{ '--stagger-delay': 5 } as React.CSSProperties}
          >
            <div className="category-header">
              <i className="fa-solid fa-screwdriver-wrench" />
              <h4 className="category-title">{t.skills.catSys || 'Hardware & OS'}</h4>
            </div>
            <div className="tech-grid">
              <div className="tech-icon"><i className="fa-solid fa-microchip" /><span id="skill-diag">{t.skills.diag || 'Diagnostika'}</span></div>
              <div className="tech-icon">
                <a
                  href="https://jellyfin.arbyy.tech/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <i className="fa-solid fa-server" />
                  <span id="skill-jellyfin">Jellyfin Server</span>
                </a>
              </div>
              <div className="tech-icon"><i className="fa-solid fa-server" /><span id="skill-os">{t.skills.os || 'Správa OS'}</span></div>
              <div className="tech-icon"><i className="fa-solid fa-compass" /><span id="skill-support">{t.skills.support || 'IT Podpora'}</span></div>
              <div className="tech-icon"><i className="fa-solid fa-file-invoice" /><span id="skill-office">{t.skills.office || 'MS Office'}</span></div>
              <div className="tech-icon"><i className="fa-solid fa-palette" /><span id="skill-photoshop">{t.skills.photoshop || 'Photoshop (základy)'}</span></div>
              <div className="tech-icon"><i className="fa-brands fa-git-alt" /><span>Git</span></div>
              <div className="tech-icon"><i className="fa-brands fa-github" /><span>GitHub</span></div>
              <div
                className="tech-icon"
                id="egg-pcbs"
                title="100 hodin v PC Building Simulatoru 1 a 2"
                onMouseEnter={() => discoverEgg('pcbs')}
                onClick={() => discoverEgg('pcbs')}
                style={{ cursor: 'pointer' }}
              >
                <i className="fa-solid fa-gamepad" />
                <span id="skill-pcbs">100h v PCBS 1 & 2</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
