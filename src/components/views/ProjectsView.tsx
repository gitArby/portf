import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const ProjectsView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { lang, t } = useLanguage();
  const isCs = lang === 'cs';

  return (
    <div id="projects-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="projects" className="container reveal active">
        <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          {t.projects?.title || 'Projekty'}
        </h3>
        <p className="proj-text reveal-stagger" style={{ '--stagger-delay': 2 } as React.CSSProperties}>
          {t.projects?.text ||
            'Stále se posouvám dál. Tady je malá ukázka toho, na čem momentálně pracuji a co se teprve klube na svět:'}
        </p>

        <div className="projects-grid">
          {/* Funny weby pro přítelkyni */}
          <div className="project-card reveal-card active" style={{ '--stagger-delay': 3 } as React.CSSProperties}>
            <div className="wip-badge live-badge">{t.projects?.c1badge || 'Live'}</div>
            <h4>{t.projects?.c1t || 'Funny weby pro přítelkyni'}</h4>
            <p>
              {t.projects?.c1d ||
                'Dva propojené zábavné weby s detektivní a zamilovanou tématikou vytvořené pro mou přítelkyni Týnku.'}
            </p>
            <div className="project-links-row">
              <span className="project-link-hint hint-det">
                <a href="https://gitarby.github.io/det/" target="_blank" rel="noopener noreferrer">
                  {t.projects?.c1hintDet || 'Detektivní web'} <i className="fa-solid fa-arrow-up-right-from-square" />
                </a>
              </span>
              <span className="project-link-hint hint-gf">
                <a href="https://gitarby.github.io/gf/" target="_blank" rel="noopener noreferrer">
                  {t.projects?.c1hintGf || 'Zamilovaný web'} <i className="fa-solid fa-arrow-up-right-from-square" />
                </a>
              </span>
            </div>
          </div>

          {/* ScrapScrap */}
          <a
            href="https://scrapscrap.app"
            target="_blank"
            rel="noopener noreferrer"
            className="project-card link-card reveal-card active"
            style={{ '--stagger-delay': 4 } as React.CSSProperties}
          >
            <div className="wip-badge live-badge">{t.projects?.c2badge || 'Live'}</div>
            <h4>{t.projects?.c2t || 'ScrapScrap'}</h4>
            <p>
              {t.projects?.c2d ||
                'Velmi se zajímám o gamedev, a právě proto vznikla tahle steampunková webová hra. Obsahuje herní obchod, žebříčky a vlastní mechaniky.'}
            </p>
            <span className="project-link-hint">
              {t.projects?.c2hint || 'Hrát ScrapScrap'} <i className="fa-solid fa-arrow-up-right-from-square" />
            </span>
          </a>

          {/* Kasař */}
          <a
            href="https://gitarby.github.io/kasar-bonus-project/"
            target="_blank"
            rel="noopener noreferrer"
            className="project-card link-card reveal-card active"
            style={{ '--stagger-delay': 5 } as React.CSSProperties}
          >
            <div className="wip-badge live-badge">{t.projects?.c3badge || 'Live'}</div>
            <h4>{t.projects?.c3t || 'Kasař'}</h4>
            <p>
              {t.projects?.c3d ||
                'Open-source webová aplikace pro správu financí. Umožňuje přehledně sledovat příjmy, výdaje a plánovat rozpočet.'}
            </p>
            <span className="project-link-hint">
              {t.projects?.c3hint || 'Spustit Kasař'} <i className="fa-solid fa-arrow-up-right-from-square" />
            </span>
          </a>

          {/* Výherní automaty */}
          <div className="project-card reveal-card active" style={{ '--stagger-delay': 6 } as React.CSSProperties}>
            <div className="wip-badge">{t.projects?.c4badge || 'Python'}</div>
            <h4>{t.projects?.c4t || 'Výherní automaty'}</h4>
            <p>
              {t.projects?.c4d ||
                'Jednoduchá hra typu výherní automat vytvořená v Pythonu s využitím knihovny Pygame.'}
            </p>
            <details className="project-details">
              <summary className="details-summary">{t.projects?.c4summary || 'Návod ke spuštění'}</summary>
              <div className="details-content">
                <ol>
                  <li className="step-1">
                    {t.projects?.c4step1 || 'Stáhněte nebo klonujte repozitář z'}{' '}
                    <a href="https://github.com/gitArby/mamradautomaty" target="_blank" rel="noopener noreferrer">
                      GitHubu
                    </a>
                    .
                  </li>
                  <li className="step-2">{t.projects?.c4step2 || 'Rozbalte staženou složku hry.'}</li>
                  <li className="step-3">
                    {t.projects?.c4step3 || 'Spusťte soubor'} <code>gamble.exe</code>.
                  </li>
                </ol>
                <p className="details-controls">
                  <strong>{isCs ? 'Ovládání:' : 'Controls:'}</strong>{' '}
                  {t.projects?.c4controls ||
                    'ESC pro ukončení, tlačítko QUIT vpravo nahoře, kliknutí myší pro nastavení sázky a roztočení (SPIN).'}
                </p>
              </div>
            </details>
            <span className="project-link-hint">
              <a href="https://github.com/gitArby/mamradautomaty" target="_blank" rel="noopener noreferrer">
                {t.projects?.c4hint || 'Zobrazit GitHub'} <i className="fa-solid fa-arrow-up-right-from-square" />
              </a>
            </span>
          </div>

          {/* Rádio Bot */}
          <div className="project-card reveal-card active" style={{ '--stagger-delay': 7 } as React.CSSProperties}>
            <div
              className="wip-badge"
              style={{
                background: 'rgba(88, 101, 242, 0.2)',
                color: '#5865F2',
                borderColor: 'rgba(88, 101, 242, 0.5)',
              }}
            >
              Discord Bot
            </div>
            <h4 id="proj-radio-title">{t.projects?.c5t || 'Rádio Bot'}</h4>
            <p id="proj-radio-desc">
              {t.projects?.c5d ||
                'Vlastní Discord bot navržený speciálně pro plynulé přehrávání českých rádiových stanic přímo v hlasových kanálech.'}
            </p>
          </div>

          {/* Roblox Gamedev */}
          <div className="project-card reveal-card active" style={{ '--stagger-delay': 8 } as React.CSSProperties}>
            <div className="wip-badge">Lua</div>
            <h4 id="proj-roblox-title">{t.projects?.c6t || 'Roblox Gamedev'}</h4>
            <p id="proj-roblox-desc">
              {t.projects?.c6d ||
                'Experimentování s vývojem her v platformě Roblox. Skriptování vlastních herních mechanik, systémů a interakcí pomocí jazyka Lua.'}
            </p>
          </div>

          {/* D&D Virtual Tabletop */}
          <a
            href="https://gitarby.github.io/dnd-vec/"
            target="_blank"
            rel="noopener noreferrer"
            className="project-card link-card reveal-card active"
            style={{ '--stagger-delay': 9 } as React.CSSProperties}
          >
            <div
              className="wip-badge live-badge"
              style={{
                background: 'rgba(138, 43, 226, 0.2)',
                color: '#8a2be2',
                borderColor: 'rgba(138, 43, 226, 0.5)',
              }}
            >
              Live VTT
            </div>
            <h4>{t.projects?.c7t || 'D&D Virtual Tabletop'}</h4>
            <p>
              {t.projects?.c7d ||
                'Projekt pro stolní hraní Dungeons & Dragons. Webové rozhraní (VTT) pro správu mapy, postav a hodů kostkou během našich herních seancí.'}
            </p>
            <span className="project-link-hint">
              {t.projects?.c7hint || 'Spustit VTT'} <i className="fa-solid fa-arrow-up-right-from-square" />
            </span>
          </a>
        </div>

        <div
          className="projects-more reveal-stagger active"
          style={{
            marginTop: '3.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <p className="projects-more-text" id="projects-more-text" style={{ marginBottom: '0.5rem', fontWeight: 300 }}>
            {t.projects?.cMoreText || 'Všechny mé ostatní projekty a zdrojové kódy najdete na mém GitHubu.'}
          </p>
          <a
            href="https://github.com/gitArby?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            id="btn-projects-github"
          >
            <i className="fa-brands fa-github" /> {t.projects?.cMoreBtn || 'Zobrazit další repozitáře'}
          </a>
        </div>
      </section>
    </div>
  );
};
