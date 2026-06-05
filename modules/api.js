/**
 * API Module
 * Manages external API connectivity and presence syncing.
 * Handles Lanyard WebSocket connectivity and HenrikDev League of Legends API requests.
 */
import { AppState, subscribe } from './state.js';
import { UISelectors } from './selectors.js';
import { i18n } from './translations.js';
import { handleAppError, withErrorBoundary } from './utils.js';

// Bezpečná extrakce pro případ, že to spustí přes starý Live Server místo Vite
const env = typeof import.meta.env !== 'undefined' ? import.meta.env : {};
const DISCORD_ID = env.VITE_DISCORD_ID || '938119246196666378';
let reconnectAttempts = 0;
const MAX_RECONNECTS = 5;

/**
 * Establish connection to Lanyard WebSocket for real-time Discord presence.
 * Includes automatic heartbeat and exponential backoff reconnection up to a max limit.
 */
export function connectLanyard() {
    if (reconnectAttempts >= MAX_RECONNECTS) {
        handleAppError(new Error('Max reconnect attempts reached'), 'Lanyard WebSocket (Discord Status)');
        const profileCard = UISelectors.discordProfileCard;
        if (profileCard) {
            profileCard.innerHTML = `
                <div class="error-fallback reveal-card" style="padding: 2rem; text-align: center; color: var(--arbyy-error); border: 1px solid var(--arbyy-error); border-radius: 8px;">
                    <i class="fa-brands fa-discord" style="font-size: 2.5rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Nelze načíst status Discordu.</p>
                    <p style="font-size: 0.8rem; opacity: 0.7;">API je momentálně nedostupné.</p>
                </div>`;
        }
        return;
    }

    try {
        const ws = new WebSocket('wss://api.lanyard.rest/socket');
        let hb;
        
        ws.onmessage = e => {
            try {
                const { op, d } = JSON.parse(e.data);
                if (op === 1) {
                    // Send heartbeats every interval requested by Lanyard server
                    hb = setInterval(() => ws.send(JSON.stringify({ op: 3 })), d.heartbeat_interval);
                    ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: DISCORD_ID } }));
                }
                if (op === 0) {
                    updatePresence(d);
                }
            } catch (err) {
                console.error('Lanyard socket message processing failed', err);
            }
        };

        ws.onclose = () => {
            clearInterval(hb);
            reconnectAttempts++;
            const backoff = Math.min(5000 * Math.pow(2, reconnectAttempts - 1), 30000);
            setTimeout(connectLanyard, backoff);
        };

        ws.onerror = err => {
            console.error('Lanyard socket connection error', err);
        };
        
        ws.onopen = () => {
            reconnectAttempts = 0;
        };
    } catch (e) {
        console.error('WebSocket initialization failed', e);
        reconnectAttempts++;
        setTimeout(connectLanyard, 5000);
    }
}

/**
 * Convert asset IDs into Discord CDN paths.
 * @param {string} appId - The Discord Application ID
 * @param {string} assetId - The asset ID from presence data
 * @returns {string} URL to the asset image
 */
function getDiscordAssetUrl(appId, assetId) {
    if (!assetId) return '';
    if (assetId.startsWith('mp:external/')) {
        return `https://media.discordapp.net/external/${assetId.replace('mp:external/', '')}`;
    }
    return `https://cdn.discordapp.com/app-assets/${appId}/${assetId}.png`;
}

/**
 * Render the interactive Discord profile presence card dynamically.
 * Updates activity, Spotify playback progress, and game timers.
 * 
 * @param {Object} data - The presence payload from Lanyard
 */
export function updatePresence(data) {
    AppState.lastPresenceData = data;
    
    // Update the navigation status indicator
    const dot = UISelectors.discordStatus;
    if (dot) {
        const colors = { online: '#43b581', idle: '#faa61a', dnd: '#f04747', offline: '#747f8d' };
        dot.style.background = colors[data.discord_status] || colors.offline;
        dot.setAttribute('title', data.discord_status);
    }

    const profileCard = UISelectors.discordProfileCard;
    if (!profileCard) return;

    // Clear progress tickers
    if (AppState.spotifyInterval) {
        clearInterval(AppState.spotifyInterval);
        AppState.spotifyInterval = null;
    }

    const user = data.discord_user;
    if (!user) return;

    const statusColors = { online: 'online', idle: 'idle', dnd: 'dnd', offline: 'offline' };
    const statusClass = statusColors[data.discord_status] || 'offline';
    const statusTitle = data.discord_status ? data.discord_status.toUpperCase() : 'OFFLINE';

    // Resolve avatar image format (supports animated GIFs)
    const isAnimated = user.avatar && user.avatar.startsWith('a_');
    const ext = isAnimated ? 'gif' : 'png';
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128` 
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    // Parse custom status activity
    const customStatusAct = data.activities?.find(a => a.type === 4);
    const customStatusText = customStatusAct ? customStatusAct.state : '';
    const customStatusEmojiUrl = customStatusAct?.emoji?.id 
        ? `https://cdn.discordapp.com/emojis/${customStatusAct.emoji.id}.${customStatusAct.emoji.animated ? 'gif' : 'png'}` 
        : '';
    const customStatusEmojiName = customStatusAct?.emoji?.name || '';

    let customStatusHtml = '';
    if (customStatusText || customStatusEmojiUrl || customStatusEmojiName) {
        const emojiImg = customStatusEmojiUrl 
            ? `<img src="${customStatusEmojiUrl}" alt="${customStatusEmojiName}" class="discord-custom-status-emoji">` 
            : (customStatusEmojiName ? `<span>${customStatusEmojiName}</span>` : '');
        
        customStatusHtml = `
            <div class="discord-custom-status">
                ${emojiImg}
                <span>${customStatusText || ''}</span>
            </div>`;
    }

    const aboutMeTitle = i18n[AppState.currentLang].games.title.includes('Minihry') ? 'O mně' : 'About Me';
    const aboutMeText = i18n[AppState.currentLang].games.title.includes('Minihry')
        ? `portfolio - <a href="https://arbyy.tech/">https://arbyy.tech/</a>\n<a href="https://scrapscrap.app/" target="_blank">https://scrapscrap.app/</a> - Zahraj si moji hru.`
        : `portfolio - <a href="https://arbyy.tech/">https://arbyy.tech/</a>\n<a href="https://scrapscrap.app/" target="_blank">https://scrapscrap.app/</a> - Play my game.`;

    // Process Spotify or Game cards
    let activityHtml = '';
    if (data.listening_to_spotify && data.spotify) {
        const sp = data.spotify;
        const labelSpotify = i18n[AppState.currentLang].nowListening;
        
        activityHtml = `
            <div class="discord-activity-box spotify-active">
                <div class="discord-activity-header">
                    <span class="discord-activity-title"><i class="fa-brands fa-spotify"></i> ${labelSpotify}</span>
                    <div class="np-equalizer">
                        <span class="eq-bar bar1"></span>
                        <span class="eq-bar bar2"></span>
                        <span class="eq-bar bar3"></span>
                    </div>
                </div>
                <div class="np-content">
                    <img src="${sp.album_art_url}" alt="cover" class="np-art">
                    <div class="np-text">
                        <span class="np-song">${sp.song}</span>
                        <span class="np-artist">${sp.artist}</span>
                        <div class="np-spotify-progress-container">
                            <div class="np-spotify-progress-bar" id="spotify-progress-bar"></div>
                        </div>
                    </div>
                </div>
            </div>`;

        const updateProgressBar = () => {
            const progressBar = document.getElementById('spotify-progress-bar');
            if (!progressBar) return;
            const start = sp.timestamps.start;
            const end = sp.timestamps.end;
            const now = Date.now();
            const total = end - start;
            const current = now - start;
            const progress = Math.max(0, Math.min(100, (current / total) * 100));
            progressBar.style.width = `${progress}%`;
        };

        setTimeout(() => {
            updateProgressBar();
            AppState.spotifyInterval = setInterval(updateProgressBar, 1000);
        }, 50);

    } else {
        const game = data.activities?.find(a => a.type === 0);
        if (game) {
            const labelGame = i18n[AppState.currentLang].nowPlaying;
            const appId = game.application_id;
            const largeImg = game.assets?.large_image ? getDiscordAssetUrl(appId, game.assets.large_image) : '';
            const smallImg = game.assets?.small_image ? getDiscordAssetUrl(appId, game.assets.small_image) : '';
            
            let imageBlock = '';
            if (largeImg) {
                imageBlock = `
                    <div class="np-art-wrapper">
                        <img src="${largeImg}" alt="${game.assets?.large_text || 'Application icon'}" class="np-art">
                        ${smallImg ? `<img src="${smallImg}" alt="${game.assets?.small_text || ''}" class="np-art-small">` : ''}
                    </div>`;
            } else {
                imageBlock = `
                    <div class="np-art-wrapper fallback">
                        <div class="np-game-icon"><i class="fa-solid fa-gamepad"></i></div>
                    </div>`;
            }

            const detailsStr = game.details ? `<span class="np-game-details">${game.details}</span>` : '';
            const stateStr = game.state ? `<span class="np-game-state">${game.state}</span>` : '';
            
            let timerStr = '';
            if (game.timestamps?.start) {
                timerStr = `<span class="np-game-timer" id="game-timer">00:00 elapsed</span>`;
            }

            activityHtml = `
                <div class="discord-activity-box">
                    <div class="discord-activity-header">
                        <span class="discord-activity-title"><i class="fa-solid fa-gamepad"></i> ${labelGame}</span>
                        <span class="discord-activity-dot"></span>
                    </div>
                    <div class="np-content">
                        ${imageBlock}
                        <div class="np-text">
                            <span class="np-song">${game.name}</span>
                            ${detailsStr}
                            ${stateStr}
                            ${timerStr}
                        </div>
                    </div>
                </div>`;

            if (game.timestamps?.start) {
                const start = game.timestamps.start;
                const updateTimer = () => {
                    const timerEl = document.getElementById('game-timer');
                    if (!timerEl) return;
                    const diff = Date.now() - start;
                    const secs = Math.floor((diff / 1000) % 60);
                    const mins = Math.floor((diff / (1000 * 60)) % 60);
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    
                    let timeStr = '';
                    if (hours > 0) {
                        timeStr += `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
                    } else {
                        timeStr += `${mins}:${secs.toString().padStart(2, '0')}`;
                    }
                    timerEl.textContent = `${timeStr} elapsed`;
                };
                setTimeout(() => {
                    updateTimer();
                    AppState.spotifyInterval = setInterval(updateTimer, 1000);
                }, 50);
            }
        }
    }

    // Build overall container card
    profileCard.innerHTML = `
        <div class="discord-card-banner"></div>
        <div class="discord-avatar-area">
            <div class="discord-avatar-wrapper">
                <img src="${avatarUrl}" alt="Avatar" class="discord-avatar">
                <div class="discord-status-badge ${statusClass}" title="${statusTitle}"></div>
            </div>
            <div class="discord-badges-container">
                <i class="fa-solid fa-shield-halved" style="color: #23a55a;" title="HypeSquad Balance"></i>
                <i class="fa-solid fa-code" style="color: #5865f2;" title="Active Developer"></i>
                <i class="fa-solid fa-gem" style="color: #f47fff;" title="Server Booster"></i>
                <i class="fa-solid fa-bolt" style="color: #ffaa04;" title="Nitro Subscriber"></i>
            </div>
        </div>
        
        <div class="discord-card-body">
            <div class="discord-names">
                <span class="discord-global-name">${user.global_name || user.username}</span>
                <div class="discord-username-row">
                    <span class="discord-username">${user.username}</span>
                    <span class="discord-pronouns">He/Him</span>
                </div>
            </div>
            
            ${customStatusHtml}
            
            <div class="discord-divider"></div>
            
            <div>
                <div class="discord-section-title">${aboutMeTitle}</div>
                <div class="discord-about-me">${aboutMeText}</div>
            </div>
            
            ${activityHtml ? `<div class="discord-divider"></div> ${activityHtml}` : ''}
        </div>`;
}

/**
 * Render dynamic League of Legends favorite champions card grid.
 * 
 * @param {string} lang - Language code ('cs' or 'en')
 */
export function renderFavoriteChampions(lang) {
    const container = UISelectors.lolChampsContainer;
    if (!container) return;

    const FAVORITE_CHAMPIONS = [
        { name: 'Draven', roleKey: 'ADC', points: 500000 },
        { name: 'Vladimir', roleKey: 'Mid', points: 500000 },
        { name: 'Viego', roleKey: 'Jungle', points: 200000 }
    ];

    const t = i18n[lang]?.lol;
    if (!t) return;

    const headerText = t.favChamps || 'Nejoblíbenější šampioni';
    const roleLabels = t.roles || {};

    let cardsHtml = '';
    FAVORITE_CHAMPIONS.forEach((champ, idx) => {
        const formattedPoints = champ.points.toLocaleString(lang === 'cs' ? 'cs-CZ' : 'en-US');
        const roleName = roleLabels[champ.roleKey] || champ.roleKey;
        
        cardsHtml += `
            <div class="champion-card reveal-card" style="--stagger-delay: ${idx + 3}">
                <div class="champion-bg" style="background-image: url('https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champ.name}_0.jpg')"></div>
                <div class="champion-overlay"></div>
                <div class="champion-info">
                    <span class="champion-role">${roleName}</span>
                    <span class="champion-name">${champ.name}</span>
                    <span class="champion-mastery">
                        <i class="fa-solid fa-fire"></i> ${formattedPoints} pts
                    </span>
                </div>
            </div>`;
    });

    container.innerHTML = `
        <h4 class="lol-champs-header reveal-stagger" style="--stagger-delay: 2.5">${headerText}</h4>
        <div class="lol-champs-grid">
            ${cardsHtml}
        </div>`;
}

/**
 * Renders static League of Legends summoner statistics (No specific rank).
 */
export async function fetchLoLStats() {
    await withErrorBoundary('lol-card', async () => {
        const card = UISelectors.lolCard;
        if (!card) return;

        // Simulujeme dynamický fetch pomocí await
        // V reálu by tady bylo fetch('https://na1.api.riotgames.com/...')
        card.innerHTML = `
            <div class="lol-info">
                <img class="lol-emblem" src="https://ddragon.leagueoflegends.com/cdn/img/ranked-emblems/Emblem_Diamond.webp" alt="Rank" onerror="this.style.display='none'">
                <div class="lol-details">
                    <div class="lol-name">arby <span class="lol-server">#him</span></div>
                    <div class="lol-rank" id="lol-rank-text">Podívej se na u.gg pro aktuální stats</div>
                </div>
            </div>`;
        
        // Auto-translate if lang is known
        const lang = AppState.currentLang || localStorage.getItem('lang') || 'cs';
        const t = i18n[lang]?.lol;
        if (t && t.statsDesc) {
            document.getElementById('lol-rank-text').textContent = t.statsDesc;
        }
    }, `
        <div class="lol-info error-state" style="justify-content: center; opacity: 0.7;">
            <i class="fa-solid fa-server" style="font-size: 2rem; margin-right: 1rem;"></i>
            <div class="lol-details">
                <div class="lol-name">LoL API nedostupné</div>
                <div class="lol-rank">Zkuste to prosím později</div>
            </div>
        </div>
    `);
}

// Bind presence and champion card refreshes to state changes
subscribe('currentLang', (newLang) => {
    renderFavoriteChampions(newLang);
    if (AppState.lastPresenceData) {
        updatePresence(AppState.lastPresenceData);
    }
});
