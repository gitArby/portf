import { Textures, Props, Avatars } from './assets.js';

export class MapCanvas {
    constructor(app) {
        this.app = app;
        this.canvas = document.getElementById('game-map');
        this.ctx = this.canvas.getContext('2d');
        this.container = this.canvas.parentElement;
        
        // Settings
        this.gridSizeInput = document.getElementById('grid-size');
        this.gridSnapInput = document.getElementById('grid-snap');

        // State
        this.backgroundImgUrl = null;
        this.backgroundImg = null;
        this.elements = []; // lines, tokens
        this.hasFog = false;
        this.fogReveals = [];

        // Interaction state
        this.isDrawing = false;
        this.isDragging = false;
        this.draggedElement = null;
        this.currentLine = null;
        
        this.currentTool = 'select';
        this.colorInput = document.getElementById('tool-color');
        
        // Terrain
        this.currentTerrain = 'grass';
        this.terrainSizeInput = document.getElementById('terrain-size');
        
        // Props a Avatars
        this.currentProp = 'tree';
        this.currentAvatar = 'color';
        this.currentAoe = 'circle';
        
        // Měření
        this.isMeasuring = false;
        this.measureStart = null;
        this.measureEnd = null;
        this.networkRuler = null; // {start, end, color} od ostatních
        
        // Offscreen canvas pro mlhu
        this.fogCanvas = document.createElement('canvas');
        this.fogCtx = this.fogCanvas.getContext('2d');

        // Kamera a Výběr
        this.camera = { x: 0, y: 0, zoom: 1.0 };
        this.isPanning = false;
        this.selectedElement = null;

        this.bindEvents();
    }

    initCanvas() {
        this.canvas.width = this.container.clientWidth;
        this.canvas.height = this.container.clientHeight;
        this.fogCanvas.width = this.canvas.width;
        this.fogCanvas.height = this.canvas.height;
        
        window.addEventListener('resize', () => {
            this.canvas.width = this.container.clientWidth;
            this.canvas.height = this.container.clientHeight;
            this.fogCanvas.width = this.canvas.width;
            this.fogCanvas.height = this.canvas.height;
            this.render();
        });

        if(this.gridSizeInput) {
            this.gridSizeInput.addEventListener('change', () => this.render());
        }
        
        this.render();
    }

    getState() {
        return {
            backgroundImgUrl: this.backgroundImgUrl,
            elements: JSON.parse(JSON.stringify(this.elements)),
            hasFog: this.hasFog,
            fogReveals: JSON.parse(JSON.stringify(this.fogReveals))
        };
    }

    loadState(state) {
        this.elements = state.elements || [];
        this.hasFog = state.hasFog || false;
        this.fogReveals = state.fogReveals || [];
        this.setBackground(state.backgroundImgUrl, false);
    }

    bindEvents() {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                if(btn.id === 'tool-clear') {
                    if(confirm("Opravdu smazat celou mapu?")) this.clearCanvas(true);
                    return;
                }
                if(btn.id === 'tool-fog-reset') {
                    this.resetFog(true);
                    return;
                }
                if(btn.id === 'tool-fog-clear') {
                    this.clearFog(true);
                    return;
                }
                if(btn.id === 'bg-upload' || btn.htmlFor === 'bg-upload') return;

                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (btn.id === 'tool-select') this.currentTool = 'select';
                if (btn.id === 'tool-draw') this.currentTool = 'draw';
                if (btn.id === 'tool-eraser') this.currentTool = 'eraser';
                if (btn.id === 'tool-token') this.currentTool = 'token';
                if (btn.id === 'tool-fog-reveal') this.currentTool = 'fog_reveal';
                if (btn.id === 'tool-ruler') this.currentTool = 'ruler';
                if (btn.id === 'tool-hide') this.currentTool = 'hide';
                if (btn.id === 'tool-prop') this.currentTool = 'prop';
                if (btn.id === 'tool-terrain') this.currentTool = 'terrain';
                if (btn.id === 'tool-aoe') this.currentTool = 'aoe';
            });
        });

        // Výběr terénu
        document.querySelectorAll('.terrain-btn').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTerrain = e.target.getAttribute('data-terrain');
                document.getElementById('tool-terrain').click();
            });
        });

        // Výběr propu (HD)
        document.querySelectorAll('.prop-item-hd').forEach(item => {
            item.addEventListener('click', (e) => {
                this.currentProp = e.target.getAttribute('data-prop');
                document.getElementById('tool-prop').click();
            });
        });

        // Výběr avatara
        document.querySelectorAll('.avatar-btn').forEach(item => {
            item.addEventListener('click', (e) => {
                document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentAvatar = e.target.getAttribute('data-avatar');
                document.getElementById('tool-token').click();
            });
        });

        // Výběr AoE
        document.querySelectorAll('.aoe-btn[data-aoe]').forEach(item => {
            item.addEventListener('click', (e) => {
                this.currentAoe = e.target.getAttribute('data-aoe');
                document.getElementById('tool-aoe').click();
            });
        });

        const bgUpload = document.getElementById('bg-upload');
        if(bgUpload) {
            bgUpload.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if(file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => this.setBackground(ev.target.result, true);
                    reader.readAsDataURL(file);
                }
            });
        }

        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseout', () => this.onMouseUp());
        
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), {passive: false});
        
        this.canvas.addEventListener('contextmenu', (e) => {
            if(this.isPanning) { e.preventDefault(); return; } // Pokud panujeme pravým, nezobrazuj menu
            e.preventDefault();
            const pos = this.getMousePos(e);
            this.showPing(pos.screenX, pos.screenY, this.colorInput.value);
            this.app.network.broadcast({ type: 'map_ping', x: pos.screenX, y: pos.screenY, color: this.colorInput.value });
        });

        // --- Drag & Drop obrázků ---
        this.container.addEventListener('dragover', (e) => {
            e.preventDefault(); // Nutné pro drop
        });

        this.container.addEventListener('drop', (e) => {
            e.preventDefault();
            if(!this.app.isHost) return;
            
            const pos = this.getMousePos(e);
            
            // 1. Zkusit Bestiář (přes JSON dataTransfer)
            try {
                const dataStr = e.dataTransfer.getData('application/json');
                if (dataStr) {
                    const data = JSON.parse(dataStr);
                    if (data.type === 'bestiary' && data.monster) {
                        const m = data.monster;
                        // Vypočítat unikátní jméno (např. Goblin 2)
                        const existing = this.app.combatants.filter(c => c.name.startsWith(m.name));
                        const uniqueName = existing.length > 0 ? `${m.name} ${existing.length + 1}` : m.name;
                        
                        // Vytvořit token na mapě
                        const token = { 
                            id: Date.now()+Math.random().toString(), 
                            type: 'token', 
                            name: uniqueName, 
                            avatar: m.avatar, 
                            color: m.color, 
                            x: this.snapToGrid(pos.x), 
                            y: this.snapToGrid(pos.y), 
                            isHidden: false 
                        };
                        this.elements.push(token);
                        this.render();
                        this.app.network.broadcast({ type: 'map_draw', element: token });
                        
                        // Přidat do combat trackeru s náhodnou iniciativou
                        let init = 0;
                        if(m.initMod !== undefined) init = Math.floor(Math.random()*20)+1 + m.initMod;
                        this.app.addCombatant(uniqueName, init, m.hp, false);
                        
                        document.getElementById('tool-select').click();
                        return; // Konec, nejedná se o soubor
                    }
                }
            } catch (err) {}

            // 2. Jinak je to obrázek z PC
            const file = e.dataTransfer.files[0];
            if (!file || !file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.onload = (ev) => {
                const img = new Image();
                img.onload = () => {
                    // Komprese / Zmenšení pro síť přes off-screen canvas
                    const max_size = 500;
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
                    
                    // WebP komprese pro sítě
                    const compressedDataUrl = tempCanvas.toDataURL('image/webp', 0.8);
                    
                    const prop = { 
                        id: Date.now()+Math.random().toString(), 
                        type: 'custom_image', 
                        src: compressedDataUrl, 
                        x: this.snapToGrid(pos.x), 
                        y: this.snapToGrid(pos.y), 
                        scale: 1.0, 
                        isHidden: false 
                    };
                    
                    this.elements.push(prop);
                    this.render();
                    this.app.network.broadcast({ type: 'map_draw', element: prop });
                    document.getElementById('tool-select').click();
                };
                img.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    getMousePos(evt) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = evt.clientX - rect.left;
        const screenY = evt.clientY - rect.top;
        return { 
            x: (screenX - this.camera.x) / this.camera.zoom, 
            y: (screenY - this.camera.y) / this.camera.zoom,
            screenX: screenX,
            screenY: screenY
        };
    }

    snapToGrid(val) {
        if(this.gridSnapInput && this.gridSnapInput.checked && this.gridSizeInput) {
            const size = parseInt(this.gridSizeInput.value) || 50;
            return Math.round(val / size) * size;
        }
        return val;
    }

    onWheel(e) {
        e.preventDefault();
        
        // Změna velikosti objektu (Scale)
        if (this.currentTool === 'select' && this.selectedElement) {
            const scaleStep = e.deltaY < 0 ? 0.1 : -0.1;
            this.selectedElement.scale = Math.max(0.2, Math.min(10.0, (this.selectedElement.scale || 1.0) + scaleStep));
            this.render();
            this.app.network.broadcast({ type: 'map_scale_element', id: this.selectedElement.id, scale: this.selectedElement.scale });
            if(this.app.isHost) this.app.saveData();
            return;
        }

        // Zoom mapy
        const zoomIntensity = 0.1;
        const pos = this.getMousePos(e);
        const delta = e.deltaY < 0 ? 1 : -1;
        const zoomFactor = Math.exp(delta * zoomIntensity);
        
        this.camera.zoom *= zoomFactor;
        this.camera.zoom = Math.max(0.1, Math.min(5.0, this.camera.zoom));
        
        this.camera.x = e.clientX - this.canvas.getBoundingClientRect().left - pos.x * this.camera.zoom;
        this.camera.y = e.clientY - this.canvas.getBoundingClientRect().top - pos.y * this.camera.zoom;
        
        this.render();
    }

    onMouseDown(e) {
        if (e.button === 1 || e.button === 2) {
            this.isPanning = true;
            this.panStart = { x: e.clientX, y: e.clientY };
            this.camStart = { x: this.camera.x, y: this.camera.y };
            return;
        }
        
        if(e.button !== 0) return;
        const pos = this.getMousePos(e);
        if (this.currentTool === 'draw' || this.currentTool === 'terrain' || this.currentTool === 'wall') {
            this.isDrawing = true;
            const size = this.currentTool === 'terrain' ? (this.terrainSizeInput ? parseInt(this.terrainSizeInput.value) : 80) : 3;
            const type = this.currentTool === 'terrain' ? 'terrain' : (this.currentTool === 'wall' ? 'wall' : 'line');
            const style = this.currentTool === 'terrain' ? this.currentTerrain : (this.currentTool === 'wall' ? '#ff0000' : this.colorInput.value);
            
            this.currentLine = { id: Date.now()+Math.random().toString(), type: type, color: style, size: size, points: [pos] };
            this.elements.push(this.currentLine);
            this.render();
        } 
        else if (this.currentTool === 'aoe') {
            this.isDrawing = true;
            this.currentLine = { id: Date.now()+Math.random().toString(), type: 'aoe', aoeType: this.currentAoe, points: [pos, pos] };
            this.elements.push(this.currentLine);
            this.render();
        }
        else if (this.currentTool === 'fog_reveal') {
            this.isDrawing = true;
            this.currentLine = { id: Date.now()+Math.random().toString(), type: 'reveal', points: [pos] };
            this.fogReveals.push(this.currentLine);
            this.render();
        }
        else if (this.currentTool === 'ruler') {
            this.isMeasuring = true;
            this.measureStart = pos;
            this.measureEnd = pos;
        }
        else if (this.currentTool === 'prop') {
            const prop = { id: Date.now()+Math.random().toString(), type: 'prop', text: this.currentProp, x: this.snapToGrid(pos.x), y: this.snapToGrid(pos.y), isHidden: false };
            this.elements.push(prop);
            this.render();
            this.app.network.broadcast({ type: 'map_draw', element: prop });
            document.getElementById('tool-select').click();
        }
        else if (this.currentTool === 'token') {
            const tokenName = prompt("Zadejte jméno postavy pro propojení s Combat Trackerem (nebo nechte prázdné):", "") || "";
            const token = { id: Date.now()+Math.random().toString(), type: 'token', name: tokenName, avatar: this.currentAvatar, color: this.colorInput.value, x: this.snapToGrid(pos.x), y: this.snapToGrid(pos.y), isHidden: false };
            this.elements.push(token);
            this.render();
            this.app.network.broadcast({ type: 'map_draw', element: token });
            document.getElementById('tool-select').click();
        }
        else if (this.currentTool === 'select' || this.currentTool === 'hide') {
            this.selectedElement = null; // Zrušit výběr
            for (let i = this.elements.length - 1; i >= 0; i--) {
                const el = this.elements[i];
                let isHit = false;
                if ((el.type === 'token' || el.type === 'prop' || el.type === 'custom_image')) {
                    let r = (el.type === 'prop' ? 50 : 25);
                    if (el.type === 'custom_image') r = el.imgObj ? Math.max(el.imgObj.width, el.imgObj.height) / 2 : 50;
                    r *= (el.scale || 1.0);
                    if(Math.hypot(el.x - pos.x, el.y - pos.y) <= r) isHit = true;
                } else if ((el.type === 'line' || el.type === 'wall' || el.type === 'terrain' || el.type === 'aoe') && this.app.isHost) {
                    if (el.points.some(p => Math.hypot(p.x - pos.x, p.y - pos.y) <= 20)) isHit = true;
                }

                if (isHit) {
                    if (this.currentTool === 'hide' && this.app.isHost) {
                        el.isHidden = !el.isHidden;
                        this.render();
                        this.app.network.broadcast({ type: 'map_hide_element', id: el.id, isHidden: el.isHidden });
                        this.app.saveData();
                        break;
                    } else if (this.currentTool === 'select') {
                        // KONTROLA OPRÁVNĚNÍ
                        if (!this.app.isHost && (el.type !== 'token' || el.name !== this.app.playerName)) {
                            continue; // Pokud nejsem DM a není to můj token, ignoruju výběr a zkusím něco pod tím
                        }
                        this.isDragging = true;
                        this.draggedElement = el;
                        this.selectedElement = el; // Vybráno
                        this.lastDragPos = { x: pos.x, y: pos.y }; // pro posun linek
                        break;
                    }
                }
            }
            this.render();
        }
        else if (this.currentTool === 'eraser') {
            this.eraseAt(pos);
        }
    }

    onMouseMove(e) {
        if (this.isPanning) {
            const dx = e.clientX - this.panStart.x;
            const dy = e.clientY - this.panStart.y;
            this.camera.x = this.camStart.x + dx;
            this.camera.y = this.camStart.y + dy;
            this.render();
            return;
        }

        const pos = this.getMousePos(e);

        if (this.isDrawing && this.currentLine) {
            if (this.currentTool === 'aoe') {
                this.currentLine.points[1] = pos;
            } else {
                this.currentLine.points.push(pos);
            }
            this.render();
        }
        else if (this.isDragging && this.draggedElement) {
            const el = this.draggedElement;
            if (el.type === 'token' || el.type === 'prop' || el.type === 'custom_image') {
                const snappedX = this.snapToGrid(pos.x);
                const snappedY = this.snapToGrid(pos.y);
                if(el.x !== snappedX || el.y !== snappedY) {
                    el.x = snappedX;
                    el.y = snappedY;
                    this.render();
                    this.app.network.broadcast({ type: 'map_move_token', id: el.id, x: snappedX, y: snappedY });
                }
            } else if (el.type === 'line' || el.type === 'wall' || el.type === 'terrain' || el.type === 'aoe') {
                if (!this.lastDragPos) this.lastDragPos = { x: pos.x, y: pos.y };
                const dx = pos.x - this.lastDragPos.x;
                const dy = pos.y - this.lastDragPos.y;
                el.points.forEach(p => { p.x += dx; p.y += dy; });
                this.lastDragPos = { x: pos.x, y: pos.y };
                this.render();
                
                // Překreslit celou linku u ostatních: jednoduše smažeme a nakreslíme
                this.app.network.broadcast({ type: 'map_delete_element', id: el.id });
                this.app.network.broadcast({ type: 'map_draw', element: el });
            }
        }
        else if (this.isMeasuring) {
            this.measureEnd = pos;
            this.render();
            this.app.network.broadcast({ type: 'map_ruler_update', start: this.measureStart, end: this.measureEnd, color: this.colorInput.value });
        }
        else if (this.currentTool === 'eraser' && e.buttons === 1) {
            this.eraseAt(pos);
        }
    }

    onMouseUp() {
        if (this.isPanning) {
            this.isPanning = false;
        }
        if (this.isDrawing && this.currentLine) {
            if(this.currentTool === 'fog_reveal') {
                this.app.network.broadcast({ type: 'map_fog_reveal', reveal: this.currentLine });
            } else {
                this.app.network.broadcast({ type: 'map_draw', element: this.currentLine });
            }
            if(this.app.isHost) this.app.saveData();
        }
        if (this.isDragging) {
            if (this.hasFog && this.draggedElement && this.draggedElement.type === 'token') {
                const autoReveal = {
                    id: Date.now() + Math.random().toString(),
                    type: 'reveal',
                    points: [{ x: this.draggedElement.x, y: this.draggedElement.y }],
                    radius: 250
                };
                this.fogReveals.push(autoReveal);
                this.app.network.broadcast({ type: 'map_fog_reveal', reveal: autoReveal });
                this.render();
            }
            if(this.app.isHost) this.app.saveData();
        }
        if (this.isMeasuring) {
            this.isMeasuring = false;
            this.measureStart = null;
            this.measureEnd = null;
            this.render();
            this.app.network.broadcast({ type: 'map_ruler_clear' });
        }
        
        this.isDrawing = false;
        this.currentLine = null;
        this.isDragging = false;
        this.draggedElement = null;
        this.lastDragPos = null;
    }

    eraseAt(pos) {
        const eraseRadius = 15;
        let deleted = false;
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const el = this.elements[i];
            
            // KONTROLA OPRÁVNĚNÍ: Jen DM může mazat propy a cizí tokeny a linky
            if (!this.app.isHost && (el.type !== 'token' || el.name !== this.app.playerName)) {
                continue;
            }

            if (el.type === 'token' || el.type === 'prop' || el.type === 'custom_image') {
                let r = (el.type === 'prop' ? 50 : 25) * (el.scale || 1.0);
                if (el.type === 'custom_image') r = (el.imgObj ? Math.max(el.imgObj.width, el.imgObj.height) / 2 : 50) * (el.scale || 1.0);
                if (Math.hypot(el.x - pos.x, el.y - pos.y) <= r) {
                    this.app.network.broadcast({ type: 'map_delete_element', id: el.id });
                    this.elements.splice(i, 1);
                    deleted = true; break;
                }
            } 
            else if (el.type === 'line' || el.type === 'aoe') {
                if (el.points.some(p => Math.hypot(p.x - pos.x, p.y - pos.y) <= eraseRadius)) {
                    this.app.network.broadcast({ type: 'map_delete_element', id: el.id });
                    this.elements.splice(i, 1);
                    deleted = true; break;
                }
            }
        }
        if(deleted) { this.render(); if(this.app.isHost) this.app.saveData(); }
    }

    deleteElement(id) {
        this.elements = this.elements.filter(el => el.id !== id);
        this.render();
    }

    setElementVisibility(id, isHidden) {
        const el = this.elements.find(e => e.id === id);
        if(el) {
            el.isHidden = isHidden;
            this.render();
        }
    }

    moveToken(id, x, y) {
        const token = this.elements.find(el => el.id === id);
        if (token && (token.type === 'token' || token.type === 'prop' || token.type === 'custom_image')) { token.x = x; token.y = y; this.render(); }
    }

    setBackground(dataUrl, emit) {
        this.backgroundImgUrl = dataUrl;
        if (!dataUrl) {
            this.backgroundImg = null;
            this.render();
            if (emit) this.app.network.broadcast({ type: 'map_bg', bg: null });
            return;
        }
        const img = new Image();
        img.onload = () => { this.backgroundImg = img; this.render(); };
        img.src = dataUrl;
        if (emit) this.app.network.broadcast({ type: 'map_bg', bg: dataUrl });
    }

    resetFog(emit) {
        this.hasFog = true;
        this.fogReveals = [];
        this.render();
        if(emit) {
            this.app.network.broadcast({ type: 'map_fog_reset' });
            if(this.app.isHost) this.app.saveData();
        }
    }

    clearFog(emit) {
        this.hasFog = false;
        this.fogReveals = [];
        this.render();
        if(emit) {
            this.app.network.broadcast({ type: 'map_fog_clear' });
            if(this.app.isHost) this.app.saveData();
        }
    }

    addFogReveal(reveal) {
        this.hasFog = true;
        this.fogReveals.push(reveal);
        this.render();
    }

    clearCanvas(emit) {
        this.elements = [];
        this.hasFog = false;
        this.fogReveals = [];
        this.setBackground(null, emit);
        if (emit) this.app.network.broadcast({ type: 'map_clear' });
    }

    showPing(x, y, color) {
        const ping = document.createElement('div');
        ping.className = 'ping-ring';
        ping.style.left = x + 'px';
        ping.style.top = y + 'px';
        ping.style.borderColor = color;
        this.container.appendChild(ping);
        setTimeout(() => { if(ping.parentElement) ping.remove(); }, 1000);
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.camera.x, this.camera.y);
        this.ctx.scale(this.camera.zoom, this.camera.zoom);

        // Pozadí
        if (this.backgroundImg) {
            const hRatio = this.canvas.width / this.backgroundImg.width;
            const vRatio = this.canvas.height / this.backgroundImg.height;
            const ratio  = Math.min ( hRatio, vRatio );
            const centerShift_x = ( this.canvas.width - this.backgroundImg.width*ratio ) / 2;
            const centerShift_y = ( this.canvas.height - this.backgroundImg.height*ratio ) / 2;  
            this.ctx.drawImage(this.backgroundImg, 0,0, this.backgroundImg.width, this.backgroundImg.height,
                               centerShift_x,centerShift_y,this.backgroundImg.width*ratio, this.backgroundImg.height*ratio);  
        }

        // Grid
        if (this.gridSizeInput) {
            const size = parseInt(this.gridSizeInput.value) || 50;
            const left = Math.floor(-this.camera.x / this.camera.zoom / size) * size;
            const top = Math.floor(-this.camera.y / this.camera.zoom / size) * size;
            const right = left + (this.canvas.width / this.camera.zoom) + size;
            const bottom = top + (this.canvas.height / this.camera.zoom) + size;

            this.ctx.beginPath();
            this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
            this.ctx.lineWidth = 1 / this.camera.zoom;
            for(let x = left; x < right; x += size) { this.ctx.moveTo(x, top); this.ctx.lineTo(x, bottom); }
            for(let y = top; y < bottom; y += size) { this.ctx.moveTo(left, y); this.ctx.lineTo(right, y); }
            this.ctx.stroke(); this.ctx.closePath();
        }

        // Kresby, Terén a Tokeny
        this.elements.forEach(el => {
            // Skryté vrstvy logic
            if (el.isHidden && !this.app.isHost) return; // Hráči to nevidí vůbec
            if (el.type === 'wall' && !this.app.isHost) return; // Hráči nevidí zdi
            this.ctx.globalAlpha = el.isHidden ? 0.4 : 1.0; // DM vidí poloprůhledně
            
            if (el.type === 'line' || el.type === 'terrain' || el.type === 'wall') {
                if (el.points.length < 2) return;
                this.ctx.beginPath();
                this.ctx.moveTo(el.points[0].x, el.points[0].y);
                for (let i = 1; i < el.points.length; i++) this.ctx.lineTo(el.points[i].x, el.points[i].y);
                
                if (el.type === 'terrain' && Textures[el.color]) {
                    this.ctx.strokeStyle = this.ctx.createPattern(Textures[el.color], 'repeat');
                } else {
                    this.ctx.strokeStyle = el.color; 
                }
                
                this.ctx.lineWidth = el.size || 3;
                this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round';
                this.ctx.stroke(); this.ctx.closePath();
            } 
            else if (el.type === 'aoe') {
                if(el.points.length < 2) return;
                const start = el.points[0];
                const end = el.points[1];
                const radius = Math.hypot(end.x - start.x, end.y - start.y);
                
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
                this.ctx.lineWidth = 2;
                
                this.ctx.beginPath();
                if (el.aoeType === 'circle') {
                    this.ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
                } else if (el.aoeType === 'cone') {
                    const angle = Math.atan2(end.y - start.y, end.x - start.x);
                    const spread = Math.PI / 4; // 45 degrees
                    this.ctx.moveTo(start.x, start.y);
                    this.ctx.arc(start.x, start.y, radius, angle - spread, angle + spread);
                    this.ctx.lineTo(start.x, start.y);
                }
                this.ctx.fill();
                this.ctx.stroke();
                this.ctx.closePath();
            }
            else if (el.type === 'prop' && Props[el.text]) {
                const img = Props[el.text];
                const scale = el.scale || 1.0;
                this.ctx.drawImage(img, el.x - 50*scale, el.y - 50*scale, 100*scale, 100*scale);
            }
            else if (el.type === 'custom_image') {
                if(!el.imgObj) {
                    el.imgObj = new Image();
                    el.imgObj.src = el.src;
                    el.imgObj.onload = () => this.render();
                } else if(el.imgObj.complete) {
                    const scale = el.scale || 1.0;
                    const w = el.imgObj.width * scale;
                    const h = el.imgObj.height * scale;
                    this.ctx.drawImage(el.imgObj, el.x - w/2, el.y - h/2, w, h);
                }
            }
            else if (el.type === 'token') {
                const scale = el.scale || 1.0;
                if (el.avatar && el.avatar !== 'color' && Avatars[el.avatar]) {
                    this.ctx.save();
                    this.ctx.beginPath();
                    this.ctx.arc(el.x, el.y, 25*scale, 0, Math.PI * 2);
                    this.ctx.clip();
                    this.ctx.drawImage(Avatars[el.avatar], el.x - 25*scale, el.y - 25*scale, 50*scale, 50*scale);
                    this.ctx.restore();
                    
                    this.ctx.beginPath();
                    this.ctx.arc(el.x, el.y, 25*scale, 0, Math.PI * 2);
                    this.ctx.strokeStyle = el.color || '#fff';
                    this.ctx.lineWidth = 3 / this.camera.zoom;
                    this.ctx.stroke();
                } else {
                    this.ctx.beginPath();
                    this.ctx.arc(el.x, el.y, 15*scale, 0, Math.PI * 2);
                    this.ctx.fillStyle = el.color; this.ctx.fill();
                    this.ctx.strokeStyle = '#fff'; this.ctx.lineWidth = 2 / this.camera.zoom; this.ctx.stroke();
                }
                
                // HP Bar logic
                if (el.name) {
                    const combatant = this.app.combatants.find(c => c.name.toLowerCase() === el.name.toLowerCase());
                    if (combatant) {
                        const hpPct = Math.max(0, Math.min(1, combatant.hp / 50));
                        const barWidth = 40 * scale;
                        const barHeight = 6 * scale;
                        const barY = el.y + 30 * scale;
                        this.ctx.fillStyle = '#222';
                        this.ctx.fillRect(el.x - barWidth/2, barY, barWidth, barHeight);
                        this.ctx.fillStyle = hpPct > 0.5 ? '#2ecc71' : (hpPct > 0.2 ? '#f39c12' : '#e74c3c');
                        this.ctx.fillRect(el.x - barWidth/2, barY, barWidth * hpPct, barHeight);
                        
                        this.ctx.font = `${Math.max(10, 10*scale)}px Arial`;
                        this.ctx.fillStyle = '#fff';
                        this.ctx.textAlign = 'center';
                        this.ctx.fillText(combatant.hp, el.x, barY + 12 * scale);

                        // Podmínky
                        if (combatant.conditions && combatant.conditions.length > 0) {
                            let condText = '';
                            if (combatant.conditions.includes('poisoned')) condText += '🟢';
                            if (combatant.conditions.includes('stunned')) condText += '⭐';
                            if (combatant.conditions.includes('bleeding')) condText += '🩸';
                            this.ctx.font = `${Math.max(12, 12*scale)}px Arial`;
                            this.ctx.fillText(condText, el.x, barY - 10 * scale);
                        }
                    }
                }
            }
            
            this.ctx.globalAlpha = 1.0; // reset
        });

        // Vykreslení bounding boxu pokud je něco vybrané
        if (this.selectedElement) {
            const el = this.selectedElement;
            const scale = el.scale || 1.0;
            let r = (el.type === 'prop' ? 50 : 25) * scale;
            if (el.type === 'custom_image') {
                r = (el.imgObj ? Math.max(el.imgObj.width, el.imgObj.height) / 2 : 50) * scale;
            }
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 2 / this.camera.zoom;
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeRect(el.x - r, el.y - r, r*2, r*2);
            this.ctx.setLineDash([]);
        }

        // Pravítko
        const renderRuler = (start, end, color) => {
            this.ctx.beginPath();
            this.ctx.moveTo(start.x, start.y);
            this.ctx.lineTo(end.x, end.y);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 4;
            this.ctx.setLineDash([10, 10]);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            this.ctx.closePath();
            
            // Text
            const gridSize = parseInt(this.gridSizeInput ? this.gridSizeInput.value : 50) || 50;
            const distPx = Math.hypot(end.x - start.x, end.y - start.y);
            const distSquares = Math.round(distPx / gridSize);
            const distFeet = distSquares * 5; // 5 stop za políčko D&D standard
            
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 4;
            const text = `${distFeet} ft`;
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            this.ctx.strokeText(text, midX, midY - 10);
            this.ctx.fillText(text, midX, midY - 10);
        };

        if (this.isMeasuring && this.measureStart && this.measureEnd) {
            renderRuler(this.measureStart, this.measureEnd, this.colorInput.value);
        }
        if (this.networkRuler) {
            renderRuler(this.networkRuler.start, this.networkRuler.end, this.networkRuler.color);
        }

        // Fog of War
        if(this.hasFog) {
            this.ctx.restore(); // Dočasně obnovit pro nakreslení vrstvy mlhy
            
            this.fogCtx.clearRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);
            this.fogCtx.globalCompositeOperation = 'source-over';
            
            this.fogCtx.fillStyle = this.app.isHost ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 1.0)';
            this.fogCtx.fillRect(0, 0, this.fogCanvas.width, this.fogCanvas.height);

            this.fogCtx.globalCompositeOperation = 'destination-out';
            this.fogCtx.lineCap = 'round';
            this.fogCtx.lineJoin = 'round';
            
            this.fogCtx.save();
            this.fogCtx.translate(this.camera.x, this.camera.y);
            this.fogCtx.scale(this.camera.zoom, this.camera.zoom);
            
            this.fogCtx.lineWidth = 60;
            this.fogCtx.strokeStyle = 'rgba(0,0,0,1)';

            this.fogReveals.forEach(rev => {
                if(rev.points.length < 2) {
                    const r = rev.radius || 30;
                    this.fogCtx.beginPath();
                    this.fogCtx.arc(rev.points[0].x, rev.points[0].y, r, 0, Math.PI*2);
                    this.fogCtx.fill();
                } else {
                    this.fogCtx.lineWidth = rev.radius ? rev.radius * 2 : 60;
                    this.fogCtx.beginPath();
                    this.fogCtx.moveTo(rev.points[0].x, rev.points[0].y);
                    for (let i = 1; i < rev.points.length; i++) this.fogCtx.lineTo(rev.points[i].x, rev.points[i].y);
                    this.fogCtx.stroke();
                }
            });

            // Dynamická Viditelnost (Raycasting)
            const segments = this.getWallSegments();
            this.elements.forEach(el => {
                if (el.type === 'token' && !el.isHidden) {
                    // Povolíme světlo jen z hráčských tokenů (nebo DM vidí všechny)
                    if (this.app.isHost || el.name === this.app.playerName) {
                        const radius = 350; // Dohled postavy
                        const poly = this.getVisibilityPolygon({x: el.x, y: el.y}, radius, segments);
                        
                        if (poly.length > 0) {
                            this.fogCtx.beginPath();
                            this.fogCtx.moveTo(poly[0].x, poly[0].y);
                            for(let i=1; i<poly.length; i++) {
                                this.fogCtx.lineTo(poly[i].x, poly[i].y);
                            }
                            this.fogCtx.closePath();
                            
                            const gradient = this.fogCtx.createRadialGradient(el.x, el.y, 0, el.x, el.y, radius);
                            gradient.addColorStop(0, 'rgba(0,0,0,1)');
                            gradient.addColorStop(1, 'rgba(0,0,0,0)');
                            
                            this.fogCtx.fillStyle = gradient;
                            this.fogCtx.fill();
                        }
                    }
                }
            });

            this.fogCtx.restore();

            this.ctx.drawImage(this.fogCanvas, 0, 0);
            
            // Re-apply pro zbytek (pokud by něco bylo)
            this.ctx.save();
            this.ctx.translate(this.camera.x, this.camera.y);
            this.ctx.scale(this.camera.zoom, this.camera.zoom);
        }
        this.ctx.restore();
    }

    // --- RAYCASTING LOGIKA ---
    getWallSegments() {
        const segments = [];
        const B = 4000;
        segments.push({p1: {x: -B, y: -B}, p2: {x: B, y: -B}});
        segments.push({p1: {x: B, y: -B}, p2: {x: B, y: B}});
        segments.push({p1: {x: B, y: B}, p2: {x: -B, y: B}});
        segments.push({p1: {x: -B, y: B}, p2: {x: -B, y: -B}});

        this.elements.forEach(el => {
            if (el.type === 'wall' && !el.isHidden) {
                for (let i = 0; i < el.points.length - 1; i++) {
                    segments.push({
                        p1: {x: el.points[i].x, y: el.points[i].y},
                        p2: {x: el.points[i+1].x, y: el.points[i+1].y}
                    });
                }
            }
        });
        return segments;
    }

    getVisibilityPolygon(origin, radius, baseSegments) {
        // Deep copy of segments so we can add bounding box specific to this token
        const segments = [...baseSegments];
        const R = radius;
        segments.push({p1: {x: origin.x - R, y: origin.y - R}, p2: {x: origin.x + R, y: origin.y - R}});
        segments.push({p1: {x: origin.x + R, y: origin.y - R}, p2: {x: origin.x + R, y: origin.y + R}});
        segments.push({p1: {x: origin.x + R, y: origin.y + R}, p2: {x: origin.x - R, y: origin.y + R}});
        segments.push({p1: {x: origin.x - R, y: origin.y + R}, p2: {x: origin.x - R, y: origin.y - R}});

        const points = [];
        segments.forEach(seg => { points.push(seg.p1, seg.p2); });

        const angles = [];
        points.forEach(p => {
            const angle = Math.atan2(p.y - origin.y, p.x - origin.x);
            angles.push(angle - 0.0001, angle, angle + 0.0001);
        });

        const intersects = [];
        angles.forEach(angle => {
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            const ray = { p1: origin, p2: { x: origin.x + dx * R * 1.5, y: origin.y + dy * R * 1.5 } };

            let closestIntersect = null;
            let minT1 = Infinity;

            segments.forEach(seg => {
                const intersect = this.getIntersection(ray, seg);
                if (intersect && intersect.param < minT1) {
                    minT1 = intersect.param;
                    closestIntersect = intersect;
                }
            });

            if (closestIntersect) {
                closestIntersect.angle = angle;
                intersects.push(closestIntersect);
            }
        });

        intersects.sort((a, b) => a.angle - b.angle);
        return intersects;
    }

    getIntersection(ray, segment) {
        const r_px = ray.p1.x; const r_py = ray.p1.y;
        const r_dx = ray.p2.x - ray.p1.x; const r_dy = ray.p2.y - ray.p1.y;
        const s_px = segment.p1.x; const s_py = segment.p1.y;
        const s_dx = segment.p2.x - segment.p1.x; const s_dy = segment.p2.y - segment.p1.y;

        const T2 = r_dx * s_dy - r_dy * s_dx;
        if (T2 === 0) return null;

        const T1 = (s_px - r_px) * s_dy - (s_py - r_py) * s_dx;
        const paramRay = T1 / T2;
        const U1 = (s_px - r_px) * r_dy - (s_py - r_py) * r_dx;
        const paramSeg = U1 / T2;

        if (paramRay > 0 && paramSeg >= 0 && paramSeg <= 1) {
            return { x: r_px + r_dx * paramRay, y: r_py + r_dy * paramRay, param: paramRay };
        }
        return null;
    }
}
