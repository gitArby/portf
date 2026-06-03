/**
 * AppState Module
 * Centralized state container holding all dynamic values of the application.
 * Utilizes a Proxy to implement the Observer pattern, allowing other modules
 * to subscribe to state changes and react automatically.
 */

// Internal raw state object
const rawState = {
    // General UI
    activeTopoNode: null,
    currentLang: localStorage.getItem('lang') || 'cs',
    activeTheme: localStorage.getItem('theme') || 'green',
    phrases: ['Tech nadšenec', 'hráč her', 'PC builder', 'web developer'],

    // Discord & Spotify presence
    spotifyInterval: null,
    lastPresenceData: null,
    audioEnabled: localStorage.getItem('audio') !== 'false',
    audioCtx: null,

    // Easter Egg
    clickCount: 0,
    lastClickTime: 0,

    // Snake game state
    snakeGameInterval: null,
    snake: [],
    snakeDir: 'right',
    nextSnakeDir: 'right',
    snakeFood: { x: 5, y: 5 },
    snakeScoreValue: 0,
    snakeHighScoreValue: parseInt(localStorage.getItem('snake_highscore') || '0', 10),

    // Minesweeper game state
    minesRows: 10,
    minesCols: 10,
    minesCountValue: 15,
    minesBoard: [],
    minesTimerInterval: null,
    minesTimeElapsed: 0,
    minesFlagMode: false,
    minesGameOverState: false,
    minesGameWonState: false,
    minesFirstClick: true,

    // Typing game state
    typeGameInterval: null,
    typeWords: [],
    typeScoreValue: 0,
    typeHighScoreValue: parseInt(localStorage.getItem('type_highscore') || '0', 10),
    typeIntegrity: 100,
    typeWordSpawnTimer: 0,
    typeBaseSpeed: 1.0
};

// Map of listeners for each state key
const listeners = new Map();

/**
 * Subscribes to changes on a specific state key.
 * 
 * @param {string} key - The state property name to listen to.
 * @param {Function} callback - The function to call when the value changes (receives new value and old value).
 * @returns {Function} Unsubscribe function.
 */
export function subscribe(key, callback) {
    if (!listeners.has(key)) {
        listeners.set(key, new Set());
    }
    listeners.get(key).add(callback);

    // Return an unsubscribe function
    return () => {
        const keyListeners = listeners.get(key);
        if (keyListeners) {
            keyListeners.delete(callback);
            if (keyListeners.size === 0) {
                listeners.delete(key);
            }
        }
    };
}

/**
 * Proxy-wrapped Application State.
 * Assigning a value to any property here will trigger registered listeners if the value changed.
 */
export const AppState = new Proxy(rawState, {
    set(target, property, value) {
        const oldValue = target[property];
        if (oldValue !== value) {
            target[property] = value;
            
            // Notify listeners
            const keyListeners = listeners.get(property);
            if (keyListeners) {
                keyListeners.forEach(callback => {
                    try {
                        callback(value, oldValue);
                    } catch (err) {
                        console.error(`Error in subscriber for state key "${property}":`, err);
                    }
                });
            }
        }
        return true;
    }
});
