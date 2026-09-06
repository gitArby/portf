import React, { useState, useEffect } from 'react';
import { useLanyard } from '../../hooks/useLanyard';
import { useLanguage } from '../../context/LanguageContext';

export const DiscordCard: React.FC = () => {
  const { data, loading, error } = useLanyard();
  const { lang, t } = useLanguage();
  const [spotifyProgress, setSpotifyProgress] = useState(0);
  const [gameElapsed, setGameElapsed] = useState('');

  // Spotify progress updater
  useEffect(() => {
    if (!data?.listening_to_spotify || !data.spotify) return;
    const interval = setInterval(() => {
      const sp = data.spotify!;
      const start = sp.timestamps.start;
      const end = sp.timestamps.end;
      const now = Date.now();
      const total = end - start;
      const current = now - start;
      const pct = Math.max(0, Math.min(100, (current / total) * 100));
      setSpotifyProgress(pct);
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  // Game timer updater
  const gameActivity = data?.activities?.find((a) => a.type === 0);
  useEffect(() => {
    if (!gameActivity?.timestamps?.start) return;
    const start = gameActivity.timestamps.start;

    const interval = setInterval(() => {
      const diff = Date.now() - start;
      const secs = Math.floor((diff / 1000) % 60);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const hours = Math.floor(diff / (1000 * 60 * 60));

      let str = '';
      if (hours > 0) {
        str += `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      } else {
        str += `${mins}:${secs.toString().padStart(2, '0')}`;
      }
      setGameElapsed(`${str} elapsed`);
    }, 1000);

    return () => clearInterval(interval);
  }, [gameActivity]);

  if (error) {
    return (
      <div
        className="error-fallback reveal-card"
        style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--arbyy-error)',
          border: '1px solid var(--arbyy-error)',
          borderRadius: '8px',
        }}
      >
        <i className="fa-brands fa-discord" style={{ fontSize: '2.5rem', marginBottom: '1rem', opacity: 0.5 }} />
        <p>{lang === 'cs' ? 'Nelze načíst status Discordu.' : 'Failed to load Discord status.'}</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          {lang === 'cs' ? 'API je momentálně nedostupné.' : 'API is currently unavailable.'}
        </p>
      </div>
    );
  }

  if (loading || !data) {
    return (
      <div className="discord-profile-card">
        <div className="discord-card-banner" />
        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>
          <i className="fa-brands fa-discord" style={{ fontSize: '2rem' }} />
          <p>{lang === 'cs' ? 'Načítání Discord profilu...' : 'Loading Discord profile...'}</p>
        </div>
      </div>
    );
  }

  const user = data.discord_user;
  const statusClass = data.discord_status || 'offline';
  const statusTitle = statusClass.toUpperCase();

  const isAnimated = user.avatar && user.avatar.startsWith('a_');
  const ext = isAnimated ? 'gif' : 'png';
  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  const customStatusAct = data.activities?.find((a) => a.type === 4);
  const customStatusText = customStatusAct?.state;
  const customStatusEmojiUrl = customStatusAct?.emoji?.id
    ? `https://cdn.discordapp.com/emojis/${customStatusAct.emoji.id}.${
        customStatusAct.emoji.animated ? 'gif' : 'png'
      }`
    : '';
  const customStatusEmojiName = customStatusAct?.emoji?.name || '';

  const aboutMeTitle = lang === 'cs' ? 'O mně' : 'About Me';

  return (
    <div className="discord-profile-card">
      <div className="discord-card-banner" />
      <div className="discord-avatar-area">
        <div className="discord-avatar-wrapper">
          <img src={avatarUrl} alt="Avatar" className="discord-avatar" />
          <div className={`discord-status-badge ${statusClass}`} title={statusTitle} />
        </div>
        <div className="discord-badges-container">
          <i className="fa-solid fa-shield-halved" style={{ color: '#23a55a' }} title="HypeSquad Balance" />
          <i className="fa-solid fa-code" style={{ color: '#5865f2' }} title="Active Developer" />
          <i className="fa-solid fa-gem" style={{ color: '#f47fff' }} title="Server Booster" />
          <i className="fa-solid fa-bolt" style={{ color: '#ffaa04' }} title="Nitro Subscriber" />
        </div>
      </div>

      <div className="discord-card-body">
        <div className="discord-names">
          <span className="discord-global-name">{user.global_name || user.username}</span>
          <div className="discord-username-row">
            <span className="discord-username">{user.username}</span>
            <span className="discord-pronouns">He/Him</span>
          </div>
        </div>

        {(customStatusText || customStatusEmojiUrl || customStatusEmojiName) && (
          <div className="discord-custom-status">
            {customStatusEmojiUrl ? (
              <img src={customStatusEmojiUrl} alt={customStatusEmojiName} className="discord-custom-status-emoji" />
            ) : customStatusEmojiName ? (
              <span>{customStatusEmojiName}</span>
            ) : null}
            <span>{customStatusText || ''}</span>
          </div>
        )}

        <div className="discord-divider" />

        <div>
          <div className="discord-section-title">{aboutMeTitle}</div>
          <div className="discord-about-me">
            portfolio - <a href="https://arbyy.tech/">https://arbyy.tech/</a>
            <br />
            <a href="https://scrapscrap.app/" target="_blank" rel="noopener noreferrer">
              https://scrapscrap.app/
            </a>{' '}
            - {lang === 'cs' ? 'Zahraj si moji hru.' : 'Play my game.'}
          </div>
        </div>

        {data.listening_to_spotify && data.spotify && (
          <>
            <div className="discord-divider" />
            <div className="discord-activity-box spotify-active">
              <div className="discord-activity-header">
                <span className="discord-activity-title">
                  <i className="fa-brands fa-spotify" /> {t.nowListening || 'Poslouchá Spotify'}
                </span>
                <div className="np-equalizer">
                  <span className="eq-bar bar1" />
                  <span className="eq-bar bar2" />
                  <span className="eq-bar bar3" />
                </div>
              </div>
              <div className="np-content">
                <img src={data.spotify.album_art_url} alt="cover" className="np-art" />
                <div className="np-text">
                  <span className="np-song">{data.spotify.song}</span>
                  <span className="np-artist">{data.spotify.artist}</span>
                  <div className="np-spotify-progress-container">
                    <div className="np-spotify-progress-bar" style={{ width: `${spotifyProgress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!data.listening_to_spotify && gameActivity && (
          <>
            <div className="discord-divider" />
            <div className="discord-activity-box">
              <div className="discord-activity-header">
                <span className="discord-activity-title">
                  <i className="fa-solid fa-gamepad" /> {t.nowPlaying || 'Právě hraje'}
                </span>
                <span className="discord-activity-dot" />
              </div>
              <div className="np-content">
                <div className="np-art-wrapper fallback">
                  <div className="np-game-icon">
                    <i className="fa-solid fa-gamepad" />
                  </div>
                </div>
                <div className="np-text">
                  <span className="np-song">{gameActivity.name}</span>
                  {gameActivity.details && <span className="np-game-details">{gameActivity.details}</span>}
                  {gameActivity.state && <span className="np-game-state">{gameActivity.state}</span>}
                  {gameElapsed && <span className="np-game-timer">{gameElapsed}</span>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
