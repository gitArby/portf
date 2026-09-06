import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LolStatsView: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const { lang, t } = useLanguage();

  const FAVORITE_CHAMPIONS = [
    { name: 'Draven', roleKey: 'ADC', points: 500000 },
    { name: 'Vladimir', roleKey: 'Mid', points: 500000 },
    { name: 'Viego', roleKey: 'Jungle', points: 200000 },
  ];

  const roleLabels: Record<string, string> =
    (t.lol as unknown as { roles?: Record<string, string> })?.roles || {};

  return (
    <div id="lol-stats-view" className={`dashboard-view ${isActive ? 'active' : ''}`}>
      <section id="lol-stats" className="container reveal active">
        <h3 className="reveal-stagger" style={{ '--stagger-delay': 1 } as React.CSSProperties}>
          League of Legends
        </h3>

        <div className="lol-card reveal-card active" id="lol-card" style={{ '--stagger-delay': 2 } as React.CSSProperties}>
          <div className="lol-info">
            <img
              className="lol-emblem"
              src="https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/Emblem_Diamond.webp"
              alt="Rank"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="lol-details">
              <div className="lol-name">
                arby <span className="lol-server">#him</span>
              </div>
              <div className="lol-rank" id="lol-rank-text">
                {t.lol?.statsDesc || 'Podívej se na u.gg pro aktuální stats'}
              </div>
            </div>
          </div>
        </div>

        <div id="lol-champs-container">
          <h4 className="lol-champs-header reveal-stagger active" style={{ '--stagger-delay': 2.5 } as React.CSSProperties}>
            {t.lol?.favChamps || 'Nejoblíbenější šampioni'}
          </h4>
          <div className="lol-champs-grid">
            {FAVORITE_CHAMPIONS.map((champ, idx) => {
              const formattedPoints = champ.points.toLocaleString(lang === 'cs' ? 'cs-CZ' : 'en-US');
              const roleName = roleLabels[champ.roleKey] || champ.roleKey;

              return (
                <div
                  key={champ.name}
                  className="champion-card reveal-card active"
                  style={{ '--stagger-delay': idx + 3 } as React.CSSProperties}
                >
                  <div
                    className="champion-bg"
                    style={{
                      backgroundImage: `url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.name}_0.jpg')`,
                    }}
                  />
                  <div className="champion-overlay" />
                  <div className="champion-info">
                    <span className="champion-role">{roleName}</span>
                    <span className="champion-name">{champ.name}</span>
                    <span className="champion-mastery">
                      <i className="fa-solid fa-fire" /> {formattedPoints} pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <a
          href="https://u.gg/lol/profile/eun1/arby-him/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="btn reveal-stagger active"
          id="btn-ugg"
          style={{ marginTop: '2rem', display: 'inline-block', '--stagger-delay': 6 } as React.CSSProperties}
        >
          {t.lol?.btn || 'Zobrazit na u.gg'}
        </a>
      </section>
    </div>
  );
};
