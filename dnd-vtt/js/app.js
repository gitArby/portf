import { Network } from './network.js';
import { UI } from './ui.js';
import { Dice } from './dice.js';
import { MapCanvas } from './map.js';
import { SFX } from './sfx.js';
import { Bestiary } from './assets.js';

class App {
    constructor() {
        this.playerName = '';
        this.isHost = false;
        
        // State
        this.maps = [ { id: Date.now(), name: "Základní Mapa" } ];
        this.currentMapId = this.maps[0].id;
        
        this.combatants = [];
        this.activeTurnIndex = -1;

        // Character Data
        this.characterData = {
            name: '', class: '', hp: 10, ac: 10, str:10, dex:10, con:10, int:10, wis:10, cha:10, notes: ''
        };

        // Modules
        this.sfx = new SFX();
        this.ui = new UI(this);
        this.network = new Network(this);
        this.dice = new Dice(this);
        this.map = new MapCanvas(this);
        this.bestiary = Bestiary;
    }

    hostGame(name) {
        this.playerName = name;
        this.isHost = true;
        this.loadData(); // Load previous session if exists
        this.network.initializeHost();
    }

    joinGame(name, roomCode) {
        this.playerName = name;
        this.isHost = false;
        this.network.initializeClient(roomCode);
    }

    onGameJoined(roomCode) {
        this.ui.showGameScreen(roomCode, this.isHost);
        this.ui.addSystemMessage(`Připojeno do místnosti ${roomCode}.`);
        this.map.initCanvas();
        this.ui.initCharacterSheet(); // Set listeners

        if(this.isHost) {
            this.ui.renderMapsList();
            this.ui.renderCombatList();
            this.ui.renderBestiary();
            this.saveData(); // initial save
        } else {
            // Tell host who I am and my current character stats
            this.syncCharacterData();
        }
    }

    // --- LOCAL STORAGE ---
    saveData() {
        if(!this.isHost) return;
        // Uložit aktuální stav mapy před savem
        const currentMap = this.maps.find(m => m.id === this.currentMapId);
        if(currentMap) currentMap.state = this.map.getState();

        const saveObj = {
            maps: this.maps,
            currentMapId: this.currentMapId,
            combatants: this.combatants,
            activeTurnIndex: this.activeTurnIndex
        };
        try {
            localStorage.setItem('dnd-vtt-save', JSON.stringify(saveObj));
        } catch(e) { console.warn("Nelze uložit data do LocalStorage (možná příliš velká mapa)."); }
    }

    loadData() {
        const data = localStorage.getItem('dnd-vtt-save');
        if(data) {
            try {
                const saveObj = JSON.parse(data);
                this.maps = saveObj.maps || this.maps;
                this.currentMapId = saveObj.currentMapId || this.maps[0].id;
                this.combatants = saveObj.combatants || [];
                this.activeTurnIndex = saveObj.activeTurnIndex !== undefined ? saveObj.activeTurnIndex : -1;
                
                const targetMap = this.maps.find(m => m.id === this.currentMapId);
                if(targetMap && targetMap.state) {
                    // mapCanvas isn't initialized fully yet, we will load state in switchMap or when canvas is ready
                    setTimeout(() => {
                        this.map.loadState(targetMap.state);
                    }, 500);
                }
            } catch(e) { console.error("Chyba při načítání pozice.", e); }
        }
    }

    // --- MESSAGING ---
    sendMessage(text) {
        this.network.broadcast({ type: 'chat', sender: this.playerName, text: text });
        this.ui.addChatMessage("Ty", text);
    }

    handleCommand(cmdString) {
        const parts = cmdString.substring(1).trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (cmd === 'clear') {
            this.ui.chatMessages.innerHTML = '';
            this.ui.addSystemMessage('Chat vymazán.');
            return;
        }
        
        if (cmd === 'roll' || cmd === 'r') {
            const expr = args.join('');
            const match = expr.match(/^(\d+)d(\d+)([\+\-]\d+)?$/i);
            if (match) {
                const count = parseInt(match[1]) || 1;
                const sides = parseInt(match[2]) || 20;
                const mod = parseInt(match[3]) || 0;
                let total = 0;
                let rolls = [];
                for(let i=0; i<count; i++) {
                    const r = Math.floor(Math.random() * sides) + 1;
                    rolls.push(r);
                    total += r;
                }
                total += mod;
                const msg = `Hází ${expr}: [${rolls.join(', ')}] ${mod > 0 ? '+'+mod : (mod < 0 ? mod : '')} = <b>${total}</b>`;
                this.network.broadcast({ type: 'chat', sender: this.playerName, text: msg });
                this.ui.addDiceMessage("Ty", msg);
                this.dice.show3DAnimation(sides, total);
            } else {
                this.ui.addSystemMessage('Neplatný formát hodu. Použij např. /roll 2d6+3');
            }
            return;
        }

        if (cmd === 'w' || cmd === 'whisper') {
            if (args.length < 2) return this.ui.addSystemMessage('Použití: /w [Jméno] [Zpráva]');
            const targetName = args[0];
            const msg = args.slice(1).join(' ');
            const whisperData = { type: 'chat', sender: this.playerName, text: `<i>(Šeptá)</i> ${msg}`, target: targetName };
            this.network.broadcast(whisperData);
            this.ui.addChatMessage(`Šeptáš pro ${targetName}`, `<i>${msg}</i>`);
            return;
        }

        if(!this.isHost) {
            this.ui.addSystemMessage('Tento příkaz může používat jen DM.');
            return;
        }

        if (cmd === 'dmg' || cmd === 'heal') {
            if(args.length < 2) return this.ui.addSystemMessage(`Použití: /${cmd} [jméno] [hodnota]`);
            const val = parseInt(args.pop());
            const name = args.join(' ');
            if(isNaN(val)) return this.ui.addSystemMessage('Neplatná hodnota.');
            
            const c = this.combatants.find(c => c.name.toLowerCase() === name.toLowerCase());
            if(!c) return this.ui.addSystemMessage(`Postava ${name} nenalezena v Combat Trackeru.`);
            
            if(cmd === 'dmg') c.hp -= val;
            if(cmd === 'heal') c.hp += val;
            
            this.syncCombatState();
            const actionText = cmd === 'dmg' ? 'ztrácí' : 'získává';
            const msg = `${name} ${actionText} ${val} HP. (Nové HP: ${c.hp})`;
            this.network.broadcast({ type: 'chat', sender: 'Systém', text: `<i>${msg}</i>` });
            this.ui.addSystemMessage(msg);
            return;
        }
        
        this.ui.addSystemMessage(`Neznámý příkaz: ${cmd}`);
    }

    rollDice(sides) {
        const result = this.dice.roll(sides);
        const secretCheckbox = document.getElementById('secret-roll');
        const isSecret = secretCheckbox && secretCheckbox.checked && this.isHost;

        if (isSecret) {
            const secretText = `hodil tajně D${sides} za plentou...`;
            this.network.broadcast({ type: 'chat', sender: 'Systém', text: `<i>Dungeon Master ${secretText}</i>` });
            this.ui.addDiceMessage(this.playerName, `[TAJNÝ HOD D${sides}] padlo: <b>${result}</b>`);
        } else {
            const text = `hodil D${sides} a padlo: ${result}`;
            const msgData = { type: 'dice', sender: this.playerName, text: text, result: result, sides: sides };
            this.network.broadcast(msgData);
            this.ui.addDiceMessage(this.playerName, text);
        }
        
        this.dice.show3DAnimation(sides, result);
    }

    // --- EXPORT & IMPORT ---
    exportWorld() {
        if (!this.isHost) return this.ui.showError("Exportovat může pouze DM.");
        this.saveData(); // Ujistíme se, že máme čerstvá data
        
        const worldData = {
            maps: this.maps,
            currentMapId: this.currentMapId,
            combatants: this.combatants,
            activeTurnIndex: this.activeTurnIndex
        };
        
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(worldData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "fantasy-vtt-world.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        
        this.ui.addSystemMessage("Svět úspěšně exportován do souboru.");
    }

    importWorld(jsonString) {
        if (!this.isHost) return this.ui.showError("Importovat může pouze DM.");
        try {
            const worldData = JSON.parse(jsonString);
            if (!worldData.maps || !worldData.combatants) throw new Error("Neplatný formát souboru.");
            
            this.maps = worldData.maps;
            this.combatants = worldData.combatants;
            this.activeTurnIndex = worldData.activeTurnIndex || 0;
            
            // Switch to saved map
            this.currentMapId = worldData.currentMapId || this.maps[0].id;
            const currentMap = this.maps.find(m => m.id === this.currentMapId) || this.maps[0];
            this.map.loadState(currentMap.state);
            
            this.ui.renderMapsList();
            this.ui.renderCombatList();
            this.syncCombatState();
            
            // Broadcast celého světa (jako by se hráči připojili)
            this.network.broadcast({
                type: 'init',
                mapState: this.map.getState(),
                combatants: this.combatants,
                activeTurnIndex: this.activeTurnIndex
            });
            
            this.saveData();
            this.ui.addSystemMessage("Svět byl úspěšně nahrán z importovaného souboru.");
        } catch (e) {
            console.error(e);
            this.ui.showError("Chyba při nahrávání souboru: " + e.message);
        }
    }

    // --- MAP MANAGEMENT ---
    createNewMap(name = null, bgUrl = null, gridSize = 50) {
        if(!this.isHost) return;
        const mapName = name || `Mapa ${this.maps.length + 1}`;
        const newMap = { id: Date.now(), name: mapName, state: { elements: [], hasFog: false, fogReveals: [], backgroundImgUrl: bgUrl } };
        this.maps.push(newMap);
        
        // Nastavíme velikost mřížky do inputu, pokud existuje
        const gridInput = document.getElementById('grid-size');
        if(gridInput) gridInput.value = gridSize;
        
        this.switchMap(newMap.id);
        this.ui.renderMapsList();
        this.saveData();
    }

    switchMap(mapId) {
        if(!this.isHost) return;
        const currentMap = this.maps.find(m => m.id === this.currentMapId);
        if(currentMap) currentMap.state = this.map.getState();

        this.currentMapId = mapId;
        const targetMap = this.maps.find(m => m.id === mapId);
        
        if(targetMap.state) this.map.loadState(targetMap.state);
        else this.map.clearCanvas(false);

        this.ui.renderMapsList();
        this.network.broadcast({ type: 'map_sync_state', state: this.map.getState() });
        this.saveData();
    }

    // --- CHARACTER & COMBAT ---
    syncCharacterData() {
        this.network.broadcast({
            type: 'char_update',
            player: this.playerName,
            data: this.characterData
        });
    }

    addCombatant(name, init, hp, isPlayer=false) {
        if(!this.isHost) return;
        const existing = this.combatants.find(c => c.name === name);
        if(existing) {
            existing.init = init;
            existing.hp = hp;
        } else {
            this.combatants.push({ name, init, hp, isPlayer, conditions: [] });
        }
        
        // Sort by initiative
        this.combatants.sort((a,b) => b.init - a.init);
        this.syncCombatState();
    }

    removeCombatant(name) {
        if(!this.isHost) return;
        this.combatants = this.combatants.filter(c => c.name !== name);
        this.syncCombatState();
    }

    toggleCondition(name, condition) {
        if(!this.isHost) return;
        const c = this.combatants.find(c => c.name === name);
        if(c) {
            if(!c.conditions) c.conditions = [];
            const idx = c.conditions.indexOf(condition);
            if(idx > -1) c.conditions.splice(idx, 1);
            else c.conditions.push(condition);
            this.syncCombatState();
            this.map.render();
        }
    }

    nextTurn() {
        if(!this.isHost || this.combatants.length === 0) return;
        this.activeTurnIndex++;
        if(this.activeTurnIndex >= this.combatants.length) this.activeTurnIndex = 0;
        this.syncCombatState();
        
        // Broadcast the active turn announcement
        const activeName = this.combatants[this.activeTurnIndex].name;
        this.network.broadcast({ type: 'turn_announce', name: activeName });
        this.ui.showTurnOverlay(activeName);
    }

    syncCombatState() {
        if(!this.isHost) return;
        this.ui.renderCombatList();
        this.network.broadcast({
            type: 'combat_state',
            combatants: this.combatants,
            activeTurnIndex: this.activeTurnIndex
        });
        this.saveData();
    }

    // --- HANDOUTS ---
    showHandout(dataUrl) {
        if(!this.isHost) return;
        this.ui.showHandoutImage(dataUrl);
        this.network.broadcast({ type: 'show_handout', img: dataUrl });
    }

    // --- JUKEBOX ---
    playJukebox(type) {
        if(!this.isHost) return;
        this.sfx.playMusic(type);
        this.network.broadcast({ type: 'music', track: type });
    }

    stopJukebox() {
        if(!this.isHost) return;
        this.sfx.stopMusic();
        this.network.broadcast({ type: 'music_stop' });
    }

    // --- NETWORK HANDLER ---
    handleIncomingMessage(data) {
        switch(data.type) {
            case 'chat': 
                if (data.target && data.target.toLowerCase() !== this.playerName.toLowerCase() && !this.isHost && data.sender.toLowerCase() !== this.playerName.toLowerCase()) {
                    return; // Zpráva není pro mě
                }
                this.ui.addChatMessage(data.sender, data.text); 
                break;
            case 'dice': 
                this.ui.addDiceMessage(data.sender, data.text); 
                this.dice.show3DAnimation(data.sides, data.result);
                break;
            case 'system': this.ui.addSystemMessage(data.text); break;
            case 'show_handout': this.ui.showHandoutImage(data.img); break;
            
            // Map
            case 'map_draw': this.map.elements.push(data.element); this.map.render(); if(this.isHost) this.saveData(); break;
            case 'map_move_token': this.map.moveToken(data.id, data.x, data.y); if(this.isHost) this.saveData(); break;
            case 'map_hide_element': this.map.setElementVisibility(data.id, data.isHidden); if(this.isHost) this.saveData(); break;
            case 'map_delete_element': this.map.deleteElement(data.id); if(this.isHost) this.saveData(); break;
            case 'map_clear': this.map.clearCanvas(false); if(this.isHost) this.saveData(); break;
            case 'map_bg': this.map.setBackground(data.bg, false); if(this.isHost) this.saveData(); break;
            case 'map_ping': 
                this.map.showPing(data.x, data.y, data.color); 
                this.sfx.playPing();
                break;
            case 'map_ruler_update':
                this.map.networkRuler = { start: data.start, end: data.end, color: data.color };
                this.map.render();
                break;
            case 'map_ruler_clear':
                this.map.networkRuler = null;
                this.map.render();
                break;
            case 'map_fog_reset': this.map.resetFog(false); if(this.isHost) this.saveData(); break;
            case 'map_fog_clear': this.map.clearFog(false); if(this.isHost) this.saveData(); break;
            case 'map_fog_reveal': this.map.addFogReveal(data.reveal); if(this.isHost) this.saveData(); break;
            case 'map_state_request': 
                if(this.isHost) {
                    this.network.broadcast({ type: 'map_sync_state', state: this.map.getState() });
                    this.syncCombatState();
                }
                break;
            case 'map_sync_state': this.map.loadState(data.state); break;
            
            // System
            case 'players_update': this.ui.updatePlayersList(data.players); break;
            
            // Combat & Character
            case 'char_update':
                if(this.isHost) {
                    const c = this.combatants.find(c => c.name === data.player);
                    if(c) {
                        c.hp = data.data.hp;
                        this.syncCombatState();
                    } else {
                        this.addCombatant(data.player, 0, data.data.hp, true);
                    }
                }
                break;
            case 'combat_state':
                this.combatants = data.combatants;
                this.activeTurnIndex = data.activeTurnIndex;
                this.ui.renderCombatList();
                break;
            case 'turn_announce':
                this.ui.showTurnOverlay(data.name);
                break;
            case 'show_handout':
                this.ui.showHandoutImage(data.img);
                break;
            case 'music':
                this.sfx.playMusic(data.track);
                break;
            case 'music_stop':
                this.sfx.stopMusic();
                break;
        }
    }
}

window.onload = () => { window.gameApp = new App(); };
