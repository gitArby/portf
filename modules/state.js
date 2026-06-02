/**
 * AppState Module
 * Centralized state container holding all dynamic values of the application.
 * Prevents pollute of global window scope and provides structured state variables.
 */
export const AppState = {
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
