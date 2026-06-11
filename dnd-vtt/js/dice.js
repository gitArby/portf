export class Dice {
    constructor(app) {
        this.app = app;
        this.bindEvents();
    }

    bindEvents() {
        document.querySelectorAll('.dice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sides = parseInt(e.currentTarget.getAttribute('data-sides'));
                this.app.rollDice(sides);
                
                btn.style.transform = 'scale(0.9)';
                setTimeout(() => btn.style.transform = '', 100);
            });
        });
    }

    roll(sides) {
        return Math.floor(Math.random() * sides) + 1;
    }

    show3DAnimation(sides, result) {
        // Vytvoří overlay pro 3D kostku
        const overlay = document.createElement('div');
        overlay.className = 'dice-overlay';
        
        const container = document.createElement('div');
        container.className = 'dice-3d-container';
        
        const dice = document.createElement('div');
        dice.className = 'dice-3d';
        
        // Zpočátku ukazovat otazník nebo jen D
        dice.innerHTML = `d${sides}`;
        
        container.appendChild(dice);
        overlay.appendChild(container);
        document.body.appendChild(overlay);

        // Po dokončení většiny roll animace (cca 1 sekunda) ukážeme výsledek
        setTimeout(() => {
            dice.innerHTML = result;
            // Necháme chvíli svítit a pak fade out
            setTimeout(() => {
                dice.classList.add('dice-fade-out');
                setTimeout(() => overlay.remove(), 1000);
            }, 2000);
        }, 1200);
    }
}
