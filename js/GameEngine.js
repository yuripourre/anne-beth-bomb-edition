class GameEngine {
    tileSize = 32;
    tilesX = 17;
    tilesY = 13;
    size = {};
    fps = 50;
    botsCount = 2; /* 0 - 3 */
    playersCount = 2; /* 1 - 2 */
    powerUpsPercent = 16;

    canvas = null;
    menu = null;
    players = [];
    bots = [];
    tiles = [];
    bombs = [];
    powerUps = [];
    levels = [];
    currentLevel = null;

    playerBoyImg = null;
    playerBoyImg2 = null;
    playerGirlImg = null;
    playerGirl2Img = null;
    bombImg = null;
    fireImg = null;
    powerUpsImg = null;

    playing = false;
    mute = false;
    soundtrackLoaded = false;
    soundtrackPlaying = false;
    soundtrack = null;

    constructor() {
        this.size = {
            w: this.tileSize * this.tilesX,
            h: this.tileSize * this.tilesY
        };
    }

    load() {
        // Init canvas
        this.canvas = new createjs.Stage("canvas");
        this.canvas.enableMouseOver();

        // Load assets
        var queue = new createjs.LoadQueue();
        var that = this;

        // Define levels
        this.levels.push(new Level("default", "static/img/levels/default/tile_wood.png", "static/img/levels/default/tile_grass.png", "static/img/levels/default/tile_wall.png"));
        this.levels.push(new Level("bricks", "static/img/levels/bricks/wood.png", "static/img/levels/bricks/bricks.png", "static/img/levels/bricks/stone.png"));

        queue.addEventListener("complete", function() {
            that.playerBoyImg = queue.getResult("playerBoy");
            that.playerBoy2Img = queue.getResult("playerBoy2");
            that.playerGirlImg = queue.getResult("playerGirl");
            that.playerGirl2Img = queue.getResult("playerGirl2");
            that.bombImg = queue.getResult("bomb");
            that.fireImg = queue.getResult("fire");
            that.powerUpsImg = queue.getResult("powerups");

            // Load levels
            for (var l = 0; l < that.levels.length; l++) {
                var level = that.levels[l];
                level.blockImg = queue.getResult(`${level.name}_tile_block`);
                level.floorImg = queue.getResult(`${level.name}_tile_floor`);
                level.wallImg = queue.getResult(`${level.name}_tile_wall`);
            }

            that.setup();
        });

        var manifest = [
            {id: "playerBoy", src: "static/img/george.png"},
            {id: "playerBoy2", src: "static/img/george2.png"},
            {id: "playerGirl", src: "static/img/betty.png"},
            {id: "playerGirl2", src: "static/img/betty2.png"},
            {id: "bomb", src: "static/img/bomb.png"},
            {id: "fire", src: "static/img/fire.png"},
            {id: "powerups", src: "static/img/powerups.png"}
        ];

        // Add level images to manifest
        for (var l = 0; l < that.levels.length; l++) {
            var level = that.levels[l];

            manifest.push({id: `${level.name}_tile_block`, src: level.blockFile});
            manifest.push({id: `${level.name}_tile_floor`, src: level.floorFile});
            manifest.push({id: `${level.name}_tile_wall`, src: level.wallFile});
        }

        queue.loadManifest(manifest);

        createjs.Sound.addEventListener("fileload", this.onSoundLoaded);
        createjs.Sound.alternateExtensions = ["mp3"];
        createjs.Sound.registerSound("static/sound/bomb.ogg", "bomb");
        createjs.Sound.registerSound("static/sound/game.ogg", "game");

        // Create menu
        this.menu = new Menu();
    }

    setup() {
        if (!gInputEngine.bindings.length) {
            gInputEngine.setup();
        }

        this.bombs = [];
        this.tiles = [];
        this.powerUps = [];

        // Get a random level
        var levelIndex = Math.floor(Math.random() * this.levels.length);
        this.currentLevel = this.levels[levelIndex];

        // Draw tiles
        this.drawTiles();
        this.drawPowerUps();

        this.spawnBots();
        this.spawnPlayers();

        // Toggle sound
        gInputEngine.addListener('mute', this.toggleSound);

        // Restart listener
        // Timeout because when you press enter in address bar too long, it would not show menu
        setTimeout(function() {
            gInputEngine.addListener('restart', function() {
                if (gGameEngine.playersCount === 0) {
                    gGameEngine.menu.setMode('single');
                } else {
                    gGameEngine.menu.hide();
                    gGameEngine.restart();
                }
            });
        }, 200);

        // Escape listener
        gInputEngine.addListener('escape', function() {
            if (!gGameEngine.menu.visible) {
                gGameEngine.menu.show();
            }
        });

        // Start loop
        if (!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', gGameEngine.update);
            createjs.Ticker.framerate = this.fps;
        }

        if (gGameEngine.playersCount > 0) {
            if (this.soundtrackLoaded) {
                this.playSoundtrack();
            }
        }

        if (!this.playing) {
            this.menu.show();
        }
    }

    onSoundLoaded(sound) {
        if (sound.id === 'game') {
            gGameEngine.soundtrackLoaded = true;
            if (gGameEngine.playersCount > 0) {
                gGameEngine.playSoundtrack();
            }
        }
    }

    playSoundtrack() {
        if (!gGameEngine.soundtrackPlaying) {
            gGameEngine.soundtrack = createjs.Sound.play("game", "none", 0, 0, -1);
            gGameEngine.soundtrack.volume = 1;
            gGameEngine.soundtrackPlaying = true;
        }
    }

    update() {
        // Player
        for (var i = 0; i < gGameEngine.players.length; i++) {
            var player = gGameEngine.players[i];
            player.update();
        }

        // Bots
        for (var i = 0; i < gGameEngine.bots.length; i++) {
            var bot = gGameEngine.bots[i];
            bot.update();
        }

        // Bombs
        for (var i = 0; i < gGameEngine.bombs.length; i++) {
            var bomb = gGameEngine.bombs[i];
            bomb.update();
        }

        // Menu
        gGameEngine.menu.update();

        // Canvas
        gGameEngine.canvas.update();
    }

    drawTiles() {
        for (var i = 0; i < this.tilesY; i++) {
            for (var j = 0; j < this.tilesX; j++) {
                if ((i === 0 || j === 0 || i === this.tilesY - 1 || j === this.tilesX - 1)
                    || (j % 2 === 0 && i % 2 === 0)) {
                    // Wall tiles
                    var tile = new Tile(TILE_WALL, { x: j, y: i });
                    this.canvas.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else {
                    // Grass tiles
                    var tile = new Tile(TILE_FLOOR, { x: j, y: i });
                    this.canvas.addChild(tile.bmp);

                    // Wood tiles
                    if (!(i <= 2 && j <= 2)
                        && !(i >= this.tilesY - 3 && j >= this.tilesX - 3)
                        && !(i <= 2 && j >= this.tilesX - 3)
                        && !(i >= this.tilesY - 3 && j <= 2)) {

                        var wood = new Tile(TILE_BLOCK, { x: j, y: i });
                        this.canvas.addChild(wood.bmp);
                        this.tiles.push(wood);
                    }
                }
            }
        }
    }

    drawPowerUps() {
        // Cache woods tiles
        var woods = [];
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            if (tile.material === TILE_BLOCK) {
                woods.push(tile);
            }
        }

        // Sort tiles randomly
        woods.sort(function() {
            return 0.5 - Math.random();
        });

        // Distribute power ups to quarters of map precisely fairly
        for (var j = 0; j < 4; j++) {
            var powerUpsCount = Math.round(woods.length * this.powerUpsPercent * 0.01 / 4);
            var placedCount = 0;
            for (var i = 0; i < woods.length; i++) {
                if (placedCount > powerUpsCount) {
                    break;
                }

                var tile = woods[i];
                if ((j === 0 && tile.position.x < this.tilesX / 2 && tile.position.y < this.tilesY / 2)
                    || (j === 1 && tile.position.x < this.tilesX / 2 && tile.position.y > this.tilesY / 2)
                    || (j === 2 && tile.position.x > this.tilesX / 2 && tile.position.y < this.tilesX / 2)
                    || (j === 3 && tile.position.x > this.tilesX / 2 && tile.position.y > this.tilesX / 2)) {

                    var typePosition = placedCount % 3;
                    var powerUp = new PowerUp(tile.position, typePosition);
                    this.powerUps.push(powerUp);

                    // Move wood to front
                    this.moveToFront(tile.bmp);

                    placedCount++;
                }
            }
        }
    }

    spawnBots() {
        this.bots = [];

        var botImg = gGameEngine.playerBoyImg;
        var botImg2 = gGameEngine.playerBoy2Img;

        if (this.botsCount >= 1) {
            var bot2 = new Bot({ x: 1, y: this.tilesY - 2 }, null, null, botImg);
            this.bots.push(bot2);
        }

        if (this.botsCount >= 2) {
            var bot3 = new Bot({ x: this.tilesX - 2, y: 1 }, null, null, botImg2);
            this.bots.push(bot3);
        }

        if (this.botsCount >= 3) {
            var bot = new Bot({ x: this.tilesX - 2, y: this.tilesY - 2 }, null, null, botImg);
            this.bots.push(bot);
        }

        if (this.botsCount >= 4) {
            var bot = new Bot({ x: 1, y: 1 }, null, null, botImg);
            this.bots.push(bot);
        }
    }

    spawnPlayers() {
        this.players = [];

        if (this.playersCount >= 1) {
            var player = new Player({ x: 1, y: 1 }, null, null, gGameEngine.playerGirlImg);
            this.players.push(player);
        }

        if (this.playersCount >= 2) {
            var controls = {
                'up': 'up2',
                'left': 'left2',
                'down': 'down2',
                'right': 'right2',
                'bomb': 'bomb2'
            };
            var player2 = new Player({ x: this.tilesX - 2, y: this.tilesY - 2 }, controls, 1, gGameEngine.playerGirl2Img);
            this.players.push(player2);
        }
    }

    /**
     * Checks whether two rectangles intersect.
     */
    intersectRect(a, b) {
        return (a.left <= b.right && b.left <= a.right && a.top <= b.bottom && b.top <= a.bottom);
    }

    /**
     * Returns tile at given position.
     */
    getTile(position) {
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            if (tile.position.x === position.x && tile.position.y === position.y) {
                return tile;
            }
        }
    }

    /**
     * Returns tile material at given position.
     */
    getTileMaterial(position) {
        var tile = this.getTile(position);
        return (tile) ? tile.material : TILE_FLOOR ;
    }

    gameOver(status) {
        if (gGameEngine.menu.visible) { return; }

        if (status === 'win') {
            var winText = "You won!";
            if (gGameEngine.playersCount > 1) {
                var winner = gGameEngine.getWinner();
                winText = winner === 0 ? "Player 1 won!" : "Player 2 won!";
            }
            this.menu.show([{text: winText, color: '#669900'}, {text: ' ;D', color: '#99CC00'}]);
        } else {
            this.menu.show([{text: 'Game Over', color: '#CC0000'}, {text: ' :(', color: '#FF4444'}]);
        }
    }

    getWinner() {
        for (var i = 0; i < gGameEngine.players.length; i++) {
            var player = gGameEngine.players[i];
            if (player.alive) {
                return i;
            }
        }
    }

    restart() {
        gInputEngine.removeAllListeners();
        gGameEngine.canvas.removeAllChildren();
        gGameEngine.setup();
    }

    /**
     * Moves specified child to the front.
     */
    moveToFront(child) {
        var children = gGameEngine.canvas.numChildren;
        gGameEngine.canvas.setChildIndex(child, children - 1);
    }

    toggleSound() {
        if (gGameEngine.mute) {
            gGameEngine.mute = false;
            gGameEngine.soundtrack.resume();
        } else {
            gGameEngine.mute = true;
            gGameEngine.soundtrack.pause();
        }
    }

    countPlayersAlive() {
        var playersAlive = 0;
        for (var i = 0; i < gGameEngine.players.length; i++) {
            if (gGameEngine.players[i].alive) {
                playersAlive++;
            }
        }
        return playersAlive;
    }

    getPlayersAndBots() {
        var players = [];

        for (var i = 0; i < gGameEngine.players.length; i++) {
            players.push(gGameEngine.players[i]);
        }

        for (var i = 0; i < gGameEngine.bots.length; i++) {
            players.push(gGameEngine.bots[i]);
        }

        return players;
    }

    getLevelBlockImage() {
        return this.currentLevel.blockImg;
    }

    getLevelFloorImage() {
        return this.currentLevel.floorImg;
    }

    getLevelWallImage() {
        return this.currentLevel.wallImg;
    }
}

gGameEngine = new GameEngine();