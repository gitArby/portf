// --- HD Assets & Textures ---
// Tento modul obsahuje definice SVG grafik pro terény a objekty.

const createDataUrl = (svgString) => {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svgString);
};

const preloadImage = (svgString) => {
    const img = new Image();
    img.src = createDataUrl(svgString);
    return img;
};

// 1. Textury pro terén (bezešvé vzory 64x64)
export const Textures = {
    grass: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#3B7A3B"/><path d="M10,15 Q15,5 20,15 M40,45 Q45,35 50,45 M25,50 Q30,40 35,50 M50,15 Q55,5 60,15" stroke="#2D602D" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`),
    water: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#1C537B"/><path d="M0,20 Q16,10 32,20 T64,20 M0,50 Q16,40 32,50 T64,50" stroke="#256B9E" stroke-width="3" fill="none"/></svg>`),
    stone: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#555"/><path d="M0,32 L64,32 M32,0 L32,64" stroke="#444" stroke-width="2"/><rect x="4" y="4" width="24" height="24" fill="#666" rx="2"/><rect x="36" y="4" width="24" height="24" fill="#666" rx="2"/><rect x="4" y="36" width="24" height="24" fill="#666" rx="2"/><rect x="36" y="36" width="24" height="24" fill="#666" rx="2"/></svg>`),
    wood: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#6B4226"/><path d="M0,16 L64,16 M0,32 L64,32 M0,48 L64,48" stroke="#4A2E1B" stroke-width="2"/><path d="M10,0 L10,16 M50,16 L50,32 M25,32 L25,48 M45,48 L45,64" stroke="#4A2E1B" stroke-width="2"/></svg>`)
};

// 2. HD Props (Vysoce kvalitní objekty)
export const Props = {
    tree: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <!-- Shadow -->
        <ellipse cx="50" cy="85" rx="35" ry="10" fill="rgba(0,0,0,0.3)"/>
        <!-- Trunk -->
        <rect x="42" y="60" width="16" height="30" fill="#5C3A21" rx="2"/>
        <path d="M45,60 L50,40 L55,60" fill="#4A2E1B"/>
        <!-- Leaves -->
        <circle cx="50" cy="40" r="25" fill="#2E662E"/>
        <circle cx="35" cy="50" r="20" fill="#2E662E"/>
        <circle cx="65" cy="50" r="20" fill="#2E662E"/>
        <circle cx="50" cy="25" r="20" fill="#3B7A3B"/>
        <circle cx="35" cy="35" r="18" fill="#3B7A3B"/>
        <circle cx="65" cy="35" r="18" fill="#3B7A3B"/>
    </svg>`),
    tower: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <ellipse cx="50" cy="90" rx="40" ry="10" fill="rgba(0,0,0,0.3)"/>
        <!-- Base -->
        <rect x="30" y="40" width="40" height="50" fill="#777"/>
        <path d="M30,40 L70,40 L70,90 L30,90 Z" fill="none" stroke="#555" stroke-width="2"/>
        <rect x="35" y="45" width="10" height="10" fill="#444"/>
        <rect x="55" y="45" width="10" height="10" fill="#444"/>
        <rect x="35" y="65" width="10" height="10" fill="#444"/>
        <rect x="55" y="65" width="10" height="10" fill="#444"/>
        <!-- Door -->
        <path d="M42,90 L42,75 Q50,65 58,75 L58,90 Z" fill="#4A2E1B"/>
        <!-- Battlements -->
        <rect x="25" y="30" width="50" height="10" fill="#666"/>
        <rect x="25" y="20" width="10" height="10" fill="#666"/>
        <rect x="45" y="20" width="10" height="10" fill="#666"/>
        <rect x="65" y="20" width="10" height="10" fill="#666"/>
    </svg>`),
    camp: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <ellipse cx="50" cy="85" rx="30" ry="8" fill="rgba(0,0,0,0.3)"/>
        <!-- Logs -->
        <path d="M30,80 L70,70" stroke="#4A2E1B" stroke-width="6" stroke-linecap="round"/>
        <path d="M30,70 L70,80" stroke="#3A2111" stroke-width="6" stroke-linecap="round"/>
        <!-- Fire -->
        <path d="M50,75 Q30,55 50,30 Q70,55 50,75" fill="#E65C00"/>
        <path d="M50,75 Q40,60 50,45 Q60,60 50,75" fill="#FFB300"/>
    </svg>`),
    chest: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <ellipse cx="50" cy="80" rx="35" ry="10" fill="rgba(0,0,0,0.3)"/>
        <rect x="25" y="45" width="50" height="35" fill="#6B4226" rx="3"/>
        <path d="M25,45 Q50,25 75,45 Z" fill="#5C3A21"/>
        <rect x="25" y="43" width="50" height="4" fill="#B8860B"/>
        <rect x="25" y="75" width="50" height="5" fill="#B8860B"/>
        <rect x="25" y="45" width="5" height="35" fill="#B8860B"/>
        <rect x="70" y="45" width="5" height="35" fill="#B8860B"/>
        <circle cx="50" cy="45" r="5" fill="#DAA520"/>
        <rect x="48" y="45" width="4" height="6" fill="#333"/>
    </svg>`),
    skull: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <ellipse cx="50" cy="85" rx="25" ry="8" fill="rgba(0,0,0,0.3)"/>
        <circle cx="50" cy="45" r="25" fill="#E0E0E0"/>
        <path d="M35,60 L65,60 L60,80 L40,80 Z" fill="#E0E0E0"/>
        <circle cx="40" cy="45" r="7" fill="#222"/>
        <circle cx="60" cy="45" r="7" fill="#222"/>
        <path d="M48,55 L52,55 L50,60 Z" fill="#222"/>
        <path d="M42,70 L42,80 M48,70 L48,80 M52,70 L52,80 M58,70 L58,80" stroke="#222" stroke-width="2"/>
    </svg>`)
};

// 3. HD Avatars (Portréty tokenů)
export const Avatars = {
    knight: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#555" stroke="#ccc" stroke-width="4"/><path d="M20,45 L20,30 Q30,15 40,30 L40,45 Z" fill="#ccc"/><rect x="25" y="32" width="10" height="5" fill="#333"/><path d="M30,10 L30,25" stroke="#d4af37" stroke-width="3"/></svg>`),
    mage: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#3b2b54" stroke="#8a2be2" stroke-width="4"/><path d="M15,50 L30,20 L45,50 Z" fill="#4b0082"/><path d="M20,25 Q30,5 40,25 Z" fill="#8a2be2"/><circle cx="30" cy="35" r="5" fill="#fff" opacity="0.5"/></svg>`),
    goblin: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#4B5320" stroke="#2E8B57" stroke-width="4"/><path d="M10,25 L20,35 L10,40 Z" fill="#6B8E23"/><path d="M50,25 L40,35 L50,40 Z" fill="#6B8E23"/><ellipse cx="30" cy="35" rx="15" ry="12" fill="#556B2F"/><circle cx="25" cy="33" r="2" fill="#000"/><circle cx="35" cy="33" r="2" fill="#000"/></svg>`),
    dragon: preloadImage(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#8B0000" stroke="#FF4500" stroke-width="4"/><path d="M30,15 Q40,30 30,45 Q20,30 30,15 Z" fill="#FF0000"/><path d="M30,15 Q35,5 45,10 Q35,20 30,15 Z" fill="#FF4500"/><path d="M30,15 Q25,5 15,10 Q25,20 30,15 Z" fill="#FF4500"/><circle cx="27" cy="30" r="2" fill="#FFD700"/><circle cx="33" cy="30" r="2" fill="#FFD700"/></svg>`)
};

// 4. Bestiář (Databáze monster)
export const Bestiary = [
    { id: 'goblin', name: 'Goblin', hp: 7, ac: 15, initMod: 2, avatar: 'goblin', color: '#2E8B57' },
    { id: 'orc', name: 'Skřet (Orc)', hp: 15, ac: 13, initMod: 1, avatar: 'goblin', color: '#8B4513' },
    { id: 'skeleton', name: 'Kostlivec', hp: 13, ac: 13, initMod: 2, avatar: 'knight', color: '#DDDDDD' },
    { id: 'dragon', name: 'Drak (Mladý)', hp: 110, ac: 18, initMod: 4, avatar: 'dragon', color: '#8B0000' },
    { id: 'bandit', name: 'Bandita', hp: 11, ac: 12, initMod: 1, avatar: 'knight', color: '#444444' }
];
