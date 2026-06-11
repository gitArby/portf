export class Network {
    constructor(app) {
        this.app = app;
        this.peer = null;
        this.connections = [];
        this.players = [];
    }

    // Host creates a room
    initializeHost() {
        // Generate a random 4 letter code for the room
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
        
        this.peer = new Peer('dnd-vtt-room-' + roomCode);
        
        this.peer.on('open', (id) => {
            this.players.push({ name: this.app.playerName, id: id, isHost: true });
            this.app.onGameJoined(roomCode);
            this.updatePlayersList();
        });

        this.peer.on('connection', (conn) => {
            this.connections.push(conn);
            
            conn.on('data', (data) => {
                if (data.type === 'join') {
                    this.players.push({ name: data.name, id: conn.peer, isHost: false });
                    this.updatePlayersList();
                    this.broadcast({ type: 'system', text: `${data.name} se připojil k dobrodružství.` });
                    // Request map sync for new player
                    this.app.handleIncomingMessage({ type: 'map_state' });
                } else {
                    // Host receives message and broadcasts to everyone else
                    this.app.handleIncomingMessage(data);
                    this.broadcast(data, conn.peer);
                }
            });

            conn.on('close', () => {
                this.players = this.players.filter(p => p.id !== conn.peer);
                this.updatePlayersList();
            });
        });

        this.peer.on('error', (err) => {
            this.app.ui.showError("Chyba při vytváření místnosti: " + err.message);
        });
    }

    // Client joins a room
    initializeClient(roomCode) {
        this.peer = new Peer();
        
        this.peer.on('open', (id) => {
            const conn = this.peer.connect('dnd-vtt-room-' + roomCode);
            
            conn.on('open', () => {
                this.connections.push(conn);
                conn.send({ type: 'join', name: this.app.playerName });
                this.app.onGameJoined(roomCode);
            });

            conn.on('data', (data) => {
                this.app.handleIncomingMessage(data);
            });

            conn.on('close', () => {
                this.app.ui.addSystemMessage("Spojení s hostitelem bylo ztraceno.");
            });
        });

        this.peer.on('error', (err) => {
            this.app.ui.showError("Nepodařilo se připojit k místnosti.");
        });
    }

    // Send to all connected peers
    broadcast(data, excludePeerId = null) {
        this.connections.forEach(conn => {
            if (conn.peer !== excludePeerId) {
                conn.send(data);
            }
        });
    }

    updatePlayersList() {
        this.app.handleIncomingMessage({ type: 'players_update', players: this.players });
        this.broadcast({ type: 'players_update', players: this.players });
    }
}
