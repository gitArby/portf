import { Props } from './assets.js';

export class UI {
    constructor(app) {
        this.app = app;
        
        // Screens
        this.loginScreen = document.getElementById('login-screen');
        this.gameScreen = document.getElementById('game-screen');
        
        // Inputs
        this.nameInput = document.getElementById('player-name');
        this.roomInput = document.getElementById('room-code');
        this.errorMsg = document.getElementById('login-error');
        
        // Chat
        this.chatMessages = document.getElementById('chat-messages');
        this.chatForm = document.getElementById('chat-form');
        this.chatInput = document.getElementById('chat-input');
        
        // Buttons
        this.btnHost = document.getElementById('btn-host');
        this.btnJoin = document.getElementById('btn-join');
        
        this.bindEvents();
    }

    bindEvents() {
        this.btnHost.addEventListener('click', () => {
            const name = this.nameInput.value.trim();
            if (!name) return this.showError("Zadejte prosím své jméno.");
            this.app.hostGame(name);
        });

        this.btnJoin.addEventListener('click', () => {
            const name = this.nameInput.value.trim();
            const room = this.roomInput.value.trim().toUpperCase();
            if (!name) return this.showError("Zadejte prosím své jméno.");
            if (!room) return this.showError("Zadejte kód místnosti.");
            this.app.joinGame(name, room);
        });

        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = this.chatInput.value.trim();
            if (text) {
                if(text.startsWith('/')) {
                    this.app.handleCommand(text);
                } else {
                    this.app.sendMessage(text);
                }
                this.chatInput.value = '';
            }
        });

        document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
                document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
                
                e.currentTarget.classList.add('active');
                const targetId = e.currentTarget.getAttribute('data-target');
                document.getElementById(targetId).classList.add('active');
                document.getElementById(targetId).classList.remove('hidden');
                
                if(targetId === 'tab-map') window.dispatchEvent(new Event('resize'));
            });
        });

        document.getElementById('btn-leave').addEventListener('click', () => window.location.reload());
        document.getElementById('btn-copy-code').addEventListener('click', () => {
            navigator.clipboard.writeText(document.getElementById('display-room-code').innerText);
            alert("Kód zkopírován!");
        });

        // HD Props UI Init
        document.querySelectorAll('.prop-item-hd').forEach(img => {
            const propKey = img.getAttribute('data-prop');
            if(Props[propKey]) {
                img.src = Props[propKey].src;
            }
        });
        
        // Modal pro Novou Mapu
        const modal = document.getElementById('modal-new-map');
        document.getElementById('btn-new-map').addEventListener('click', () => {
            document.getElementById('modal-map-name').value = `Mapa ${this.app.maps.length + 1}`;
            document.getElementById('modal-map-bg').value = '';
            document.getElementById('modal-map-grid').value = 50;
            modal.classList.remove('hidden');
        });

        document.getElementById('modal-btn-cancel').addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        document.getElementById('modal-btn-create').addEventListener('click', () => {
            const name = document.getElementById('modal-map-name').value.trim() || 'Nová Mapa';
            const gridSize = parseInt(document.getElementById('modal-map-grid').value) || 50;
            const bgInput = document.getElementById('modal-map-bg');
            
            if(bgInput.files && bgInput.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    this.app.createNewMap(name, ev.target.result, gridSize);
                    modal.classList.add('hidden');
                };
                reader.readAsDataURL(bgInput.files[0]);
            } else {
                this.app.createNewMap(name, null, gridSize);
                modal.classList.add('hidden');
            }
        });

        // Export a Import Světa
        document.getElementById('btn-export-world').addEventListener('click', () => {
            this.app.exportWorld();
        });

        const importUpload = document.getElementById('import-world-upload');
        if (importUpload) {
            importUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        this.app.importWorld(ev.target.result);
                        importUpload.value = ''; // Reset input
                    };
                    reader.readAsText(file);
                }
            });
        }

        // Combat Tracker UI
        document.getElementById('btn-add-combatant').addEventListener('click', () => {
            const name = document.getElementById('combat-name').value.trim();
            const init = parseInt(document.getElementById('combat-init').value) || 0;
            const hp = parseInt(document.getElementById('combat-hp').value) || 10;
            if(name) {
                this.app.addCombatant(name, init, hp, false);
                document.getElementById('combat-name').value = '';
            }
        });
        document.getElementById('btn-next-turn').addEventListener('click', () => {
            this.app.nextTurn();
        });

        // Handout UI
        const handoutUpload = document.getElementById('handout-upload');
        if(handoutUpload) {
            handoutUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if(file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const img = new Image();
                        img.onload = () => {
                            const max_size = 1200; // Handouts mohou být větší, stačí Full HD
                            let w = img.width;
                            let h = img.height;
                            if (w > max_size || h > max_size) {
                                const ratio = Math.min(max_size / w, max_size / h);
                                w *= ratio;
                                h *= ratio;
                            }
                            const tempCanvas = document.createElement('canvas');
                            tempCanvas.width = w;
                            tempCanvas.height = h;
                            const tCtx = tempCanvas.getContext('2d');
                            tCtx.drawImage(img, 0, 0, w, h);
                            
                            const compressedDataUrl = tempCanvas.toDataURL('image/webp', 0.85);
                            this.app.showHandout(compressedDataUrl);
                        };
                        img.src = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        document.getElementById('close-handout').addEventListener('click', () => {
            document.getElementById('handout-overlay').classList.add('hidden');
        });
    }

    showTurnOverlay(name) {
        const overlay = document.getElementById('turn-overlay');
        document.getElementById('turn-name').textContent = name;
        overlay.classList.add('active');
        
        // Zvukový efekt - malý ping pomocí syntetizátoru
        this.app.sfx.playTurn();

        setTimeout(() => {
            overlay.classList.remove('active');
        }, 3000);
    }

    showHandoutImage(dataUrl) {
        const overlay = document.getElementById('handout-overlay');
        document.getElementById('handout-img').src = dataUrl;
        overlay.classList.remove('hidden');
    }

    initCharacterSheet() {
        // Character Tabs
        document.querySelectorAll('.char-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.char-tab').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.char-pane').forEach(p => p.classList.remove('active'));
                e.currentTarget.classList.add('active');
                document.getElementById(e.currentTarget.getAttribute('data-target')).classList.add('active');
            });
        });

        const inputs = ['char-name', 'char-class', 'char-hp', 'char-ac', 'char-str', 'char-dex', 'char-con', 'char-int', 'char-wis', 'char-cha', 'char-inventory', 'char-spells'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if(!el) return;
            
            // Sync handler
            el.addEventListener('change', () => {
                const key = id.replace('char-', '');
                this.app.characterData[key] = el.value;
                this.app.syncCharacterData();
            });

            // Rolovátko myší (Mouse Wheel) pro čísla
            if(el.type === 'number') {
                el.addEventListener('wheel', (e) => {
                    e.preventDefault();
                    const step = parseFloat(el.step) || 1;
                    const val = parseFloat(el.value) || 0;
                    if(e.deltaY < 0) {
                        el.value = val + step;
                    } else {
                        el.value = val - step;
                    }
                    el.dispatchEvent(new Event('change'));
                });
            }
        });
        
        // Obnova dat při spuštění (pokud jsou uložena z minula)
        inputs.forEach(id => {
            const key = id.replace('char-', '');
            const el = document.getElementById(id);
            if(el && this.app.characterData[key]) {
                el.value = this.app.characterData[key];
            }
        });

        // Makra pro klikatelné statistiky
        document.querySelectorAll('.rollable-stat').forEach(el => {
            el.addEventListener('click', () => {
                const statId = el.getAttribute('data-stat');
                const statName = el.getAttribute('data-name');
                const inputEl = document.getElementById(statId);
                if(inputEl) {
                    const score = parseInt(inputEl.value) || 10;
                    const modifier = Math.floor((score - 10) / 2);
                    
                    const d20 = Math.floor(Math.random() * 20) + 1;
                    const total = d20 + modifier;
                    
                    const charName = document.getElementById('char-name').value || this.app.playerName;
                    
                    const modStr = modifier >= 0 ? `+${modifier}` : `${modifier}`;
                    const msg = `Hází na <b>${statName}</b> (1d20 ${modStr}): [${d20}] ${modStr} = <b style="font-size:1.2em">${total}</b>`;
                    
                    this.app.network.broadcast({ type: 'chat', sender: charName, text: msg });
                    this.addDiceMessage(charName, msg);
                    this.app.dice.show3DAnimation(20, total);
                }
            });
        });
    }

    showError(msg) {
        this.errorMsg.textContent = msg;
        this.errorMsg.classList.remove('hidden');
    }

    showGameScreen(roomCode, isHost) {
        this.loginScreen.classList.remove('active');
        this.gameScreen.classList.remove('hidden');
        document.getElementById('display-room-code').textContent = roomCode;
        
        if (isHost) {
            document.getElementById('map-manager').classList.remove('hidden');
            document.getElementById('dm-map-tools').classList.remove('hidden');
        } else {
            // Omezení práv (skrytí DM nástrojů)
            const toolDraw = document.getElementById('tool-draw');
            if (toolDraw) toolDraw.style.display = 'none';
            const toolWall = document.getElementById('tool-wall');
            if (toolWall) toolWall.style.display = 'none';
            const toolToken = document.getElementById('tool-token');
            if (toolToken && toolToken.parentElement) toolToken.parentElement.style.display = 'none';
            const toolAoe = document.getElementById('tool-aoe');
            if (toolAoe && toolAoe.parentElement) toolAoe.parentElement.style.display = 'none';
            const bestiary = document.getElementById('dm-bestiary');
            if (bestiary) bestiary.style.display = 'none';
        }
    }

    renderMapsList() {
        const ul = document.getElementById('maps-list');
        ul.innerHTML = '';
        this.app.maps.forEach(map => {
            const li = document.createElement('li');
            li.textContent = map.name;
            if(map.id === this.app.currentMapId) li.classList.add('active');
            
            li.addEventListener('click', () => this.app.switchMap(map.id));
            ul.appendChild(li);
        });
    }

    renderBestiary() {
        const ul = document.getElementById('bestiary-list');
        if (!ul) return;
        ul.innerHTML = '';
        
        // Import Bestiary listu (předpokládáme, že je uložený v app.bestiary)
        if (!this.app.bestiary) return;
        
        this.app.bestiary.forEach(monster => {
            const li = document.createElement('li');
            li.className = 'bestiary-item';
            li.draggable = true;
            li.style.cursor = 'grab';
            li.style.padding = '0.5rem';
            li.style.background = 'rgba(0,0,0,0.4)';
            li.style.borderRadius = '5px';
            li.style.display = 'flex';
            li.style.alignItems = 'center';
            li.style.gap = '0.5rem';
            
            li.innerHTML = `
                <div style="width: 20px; height: 20px; background: ${monster.color}; border-radius: 50%;"></div>
                <span>${monster.name} (HP: ${monster.hp}, AC: ${monster.ac})</span>
            `;
            
            li.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'bestiary', monster }));
            });
            
            ul.appendChild(li);
        });
    }

    addChatMessage(sender, text) {
        const div = document.createElement('div');
        div.className = 'chat-msg';
        div.innerHTML = `<div class="sender">${sender}</div><div class="content">${text}</div>`;
        this.chatMessages.appendChild(div);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    addDiceMessage(sender, text) {
        const div = document.createElement('div');
        div.className = 'chat-msg dice';
        div.innerHTML = `<div class="sender">${sender} <i class="fas fa-dice"></i></div><div class="content">${text}</div>`;
        this.chatMessages.appendChild(div);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    addSystemMessage(text) {
        const div = document.createElement('div');
        div.className = 'chat-msg system';
        div.innerHTML = `<div class="content"><i>${text}</i></div>`;
        this.chatMessages.appendChild(div);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    updatePlayersList(players) {
        const ul = document.getElementById('players-list');
        ul.innerHTML = '';
        players.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-user"></i> ${p.name} ${p.isHost ? '<i class="fas fa-crown host-badge"></i>' : ''}`;
            ul.appendChild(li);
        });
    }

    renderCombatList() {
        const ul = document.getElementById('combat-list');
        ul.innerHTML = '';
        this.app.combatants.forEach((c, index) => {
            const li = document.createElement('li');
            if(index === this.app.activeTurnIndex) li.classList.add('active-turn');
            
            let conditionsHtml = '';
            if (this.app.isHost) {
                const conds = [
                    { id: 'poisoned', icon: '🟢', title: 'Otráven' },
                    { id: 'stunned', icon: '⭐', title: 'Omráčen' },
                    { id: 'bleeding', icon: '🩸', title: 'Krvácí' }
                ];
                conditionsHtml = `<div class="conditions-panel" style="display:flex; gap:0.3rem; margin-top:0.3rem;">` +
                    conds.map(cond => {
                        const hasCond = c.conditions && c.conditions.includes(cond.id);
                        return `<span title="${cond.title}" style="cursor:pointer; opacity:${hasCond?1:0.3}; filter:${hasCond?'':'grayscale(100%)'}" onclick="window.gameApp.toggleCondition('${c.name}', '${cond.id}')">${cond.icon}</span>`;
                    }).join('') + `</div>`;
            }

            li.innerHTML = `
                <div class="combatant-info">
                    <span class="combatant-init">${c.init}</span>
                    <div>
                        <strong>${c.name}</strong> ${c.isPlayer ? '<i class="fas fa-user" style="font-size:0.8rem;color:#aaa"></i>' : ''}<br>
                        <span style="font-size:0.8rem; color:#aaa">HP: ${c.hp}</span>
                        ${conditionsHtml}
                    </div>
                </div>
            `;
            
            // Host can delete combatants
            if(this.app.isHost) {
                const delBtn = document.createElement('button');
                delBtn.innerHTML = '<i class="fas fa-times"></i>';
                delBtn.className = 'icon-btn';
                delBtn.style.color = '#ef4444';
                delBtn.onclick = () => this.app.removeCombatant(c.name);
                li.appendChild(delBtn);
            }
            
            ul.appendChild(li);
        });
    }
}
