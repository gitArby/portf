export class SFX {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.currentMusic = null;
    }

    playTone(freq, type, duration, vol=0.1) {
        if(this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playMusic(type) {
        this.stopMusic();
        
        const urls = {
            tavern: 'https://actions.google.com/sounds/v1/crowds/pub_ambience.ogg',
            cave: 'https://actions.google.com/sounds/v1/water/water_leak.ogg',
            forest: 'https://actions.google.com/sounds/v1/ambiences/forest_morning.ogg',
            combat: 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg'
        };
        
        if(urls[type]) {
            this.currentMusic = new Audio(urls[type]);
            this.currentMusic.loop = true;
            this.currentMusic.volume = 0.4;
            this.currentMusic.play().catch(e => console.log("Music play blocked by browser", e));
        }
    }

    stopMusic() {
        if(this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic = null;
        }
    }

    playTurn() {
        // Zvuk rohu / zvonu (kombinace dvou tónů)
        this.playTone(440, 'triangle', 1.0, 0.2); // A4
        setTimeout(() => this.playTone(659.25, 'triangle', 1.5, 0.2), 200); // E5
    }

    playPing() {
        // Krátké pípnutí
        this.playTone(880, 'sine', 0.5, 0.1);
    }
}
