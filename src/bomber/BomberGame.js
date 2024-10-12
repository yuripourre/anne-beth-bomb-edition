import { gGameEngine } from "../app.js";
import { gInputEngine } from "../InputEngine.js";
import { Tile } from "./Tile.js";
import { Level } from "./Level.js";
import { Bot } from "./Bot.js";
import { Player } from "./Player.js";
import { ModeMenu } from "./menu/ModeMenu.js";
import { PowerUp } from "./PowerUp.js";
import { Stairs } from "./Stairs.js";
import { Engine } from "../Engine.js";
import { Utils } from "./Utils.js";
import { StoryLevelGenerator } from "./StoryLevelGenerator.js";

export class BomberGame extends Engine {

    static MODE_SURVIVAL = "story";
    static MODE_BATTLE = "battle";

    tileSize = 32;
    tilesX = 17;
    tilesY = 11;

    menu = null;
    stairs = null;

    gameMode = BomberGame.MODE_BATTLE;
    botsCount = 2; /* 0 - 3 */
    playersCount = 2; /* 1 - 2 */
    powerUpsPercent = 16;

    players = [];
    bots = [];
    // Separate into colliding and not colliding tiles
    tiles = [];

    bombs = [];
    powerUps = [];
    levels = [];

    currentLevel = 1;
    currentLevelTheme = null;

    constructor() {
        super();
        this.size = {
            w: this.tileSize * this.tilesX,
            h: this.tileSize * this.tilesY
        };
    }

    load() {
        this.size.w = 640;
        this.size.h = 360;

        super.load();

        // If menu is open, offset is fine
        //this.canvas.x = (640 - this.tilesX * this.tileSize) / 2;

        const that = this;

        // Load assets
        var queue = new createjs.LoadQueue();

        // Define levels

        //this.levels.push(new Level("classic", "static/img/levels/classic/block.png", "static/img/levels/classic/grass.png", "static/img/levels/classic/wall.png"));
        this.levels.push(new Level("original", "static/img/levels/original/tile_wood.png", "static/img/levels/original/tile_grass.png", "static/img/levels/original/tile_wall.png"));
        this.levels.push(new Level("bricks", "static/img/levels/bricks/wood.png", "static/img/levels/bricks/bricks.png", "static/img/levels/bricks/stone.png"));

        queue.addEventListener("complete", function () {
            that.imgs['charDarkMageImg'] = queue.getResult("charDarkMage");
            that.imgs['charGoblinImg'] = queue.getResult("charGoblin");
            that.imgs['charSkullImg'] = queue.getResult("charSkull");
            that.imgs['charPumpkinImg'] = queue.getResult("charPumpkin");
            that.imgs['playerGirlImg'] = queue.getResult("witch");
            that.imgs['playerGirl2Img'] = queue.getResult("princess");
            that.imgs['bombImg'] = queue.getResult("bomb");
            that.imgs['fireImg'] = queue.getResult("fire");
            that.imgs['powerUpsImg'] = queue.getResult("powerups");
            that.imgs['objectsImg'] = queue.getResult("objects");

            // Load levels
            for (let l = 0; l < that.levels.length; l++) {
                var level = that.levels[l];
                level.blockImg = queue.getResult(`${level.name}_tile_block`);
                level.floorImg = queue.getResult(`${level.name}_tile_floor`);
                level.wallImg = queue.getResult(`${level.name}_tile_wall`);
            }

            that.setup();
        });

        var manifest = [
            { id: "charSkull", src: "static/img/chars/skull.png" },
            { id: "charDarkMage", src: "static/img/chars/dark_mage.png" },
            { id: "charGoblin", src: "static/img/chars/goblin.png" },
            { id: "charPurpleGoblin", src: "static/img/chars/purple_goblin.png" },
            { id: "charPumpkin", src: "static/img/chars/pumpkin.png" },
            { id: "witch", src: "static/img/chars/witch.png" },
            { id: "princess", src: "static/img/chars/princess.png" },
            { id: "bomb", src: "static/img/bomb.png" },
            { id: "fire", src: "static/img/fire.png" },
            { id: "powerups", src: "static/img/powerups.png" },
            { id: "objects", src: "static/img/objects/tileset.png" },
            { id: "menu", src: "static/img/ui/menu.jpg" },
        ];

        // Add level images to manifest
        for (let l = 0; l < that.levels.length; l++) {
            var level = that.levels[l];

            manifest.push({ id: `${level.name}_tile_block`, src: level.blockFile });
            manifest.push({ id: `${level.name}_tile_floor`, src: level.floorFile });
            manifest.push({ id: `${level.name}_tile_wall`, src: level.wallFile });
        }

        queue.loadManifest(manifest);

        createjs.Sound.addEventListener("fileload", this.onSoundLoaded);
        createjs.Sound.alternateExtensions = ["mp3"];
        createjs.Sound.registerSound("static/sound/powerup.ogg", "powerup");
        createjs.Sound.registerSound("static/sound/bomb.ogg", "bomb");
        createjs.Sound.registerSound("static/sound/game.ogg", "game");

        // Create menu
        this.menu = new ModeMenu();
    }

    setup() {
        if (!gInputEngine.bindings.length) {
            gInputEngine.bindKey(38, 'up');
            gInputEngine.bindKey(37, 'left');
            gInputEngine.bindKey(40, 'down');
            gInputEngine.bindKey(39, 'right');
            gInputEngine.bindKey(32, 'bomb');
            gInputEngine.bindKey(18, 'bomb');

            gInputEngine.bindKey(87, 'up2');
            gInputEngine.bindKey(65, 'left2');
            gInputEngine.bindKey(83, 'down2');
            gInputEngine.bindKey(68, 'right2');
            gInputEngine.bindKey(16, 'bomb2');

            // Enter to confirm
            gInputEngine.bindKey(13, 'confirm');
            gInputEngine.bindKey(27, 'escape');
            gInputEngine.bindKey(77, 'mute');

            gInputEngine.bindGamepadButtonDown(0, 12, 'up');
            gInputEngine.bindGamepadButtonDown(0, 13, 'down');
            gInputEngine.bindGamepadButtonDown(0, 14, 'left');
            gInputEngine.bindGamepadButtonDown(0, 15, 'right');
            gInputEngine.bindGamepadButtonUp(0, 1, 'bomb');
            gInputEngine.bindGamepadButtonUp(0, 1, 'confirm');

            gInputEngine.bindGamepadButtonDown(1, 12, 'up2');
            gInputEngine.bindGamepadButtonDown(1, 13, 'down2');
            gInputEngine.bindGamepadButtonDown(1, 14, 'left2');
            gInputEngine.bindGamepadButtonDown(1, 15, 'right2');
            gInputEngine.bindGamepadButtonUp(1, 1, 'bomb2');
            gInputEngine.bindGamepadButtonUp(1, 1, 'confirm');

            gInputEngine.setup();
        }

        // Toggle sound
        gInputEngine.addListener('mute', this.toggleSound);

        // Reset bombs, tiles and power ups
        this.bombs = [];
        this.tiles = [];
        this.powerUps = [];

        // Get a random level theme
        var levelIndex = Math.floor(Math.random() * this.levels.length);
        this.currentLevelTheme = this.levels[levelIndex];

        if (this.gameMode === BomberGame.MODE_BATTLE) {
            // Draw tiles
            this.drawTiles();
            this.drawPowerUps();
            this.spawnBots();
            this.spawnPlayers();
        } else {
            this.stairs = new Stairs();
            StoryLevelGenerator.generateLevel(this.currentLevelTheme);

            // Move or spawn players
            if (this.currentLevel == 1) {
                this.spawnPlayers();
            } else {
                this.resetPlayers();
            }
        }
        
        if (Utils.isMobile()) {
            // Bind actions
            gInputEngine.showVirtualJoystick();
            // We also need to display buttons
        }

        // Restart listener
        // Timeout because when you press enter in address bar too long, it would not show menu
        /* setTimeout(function () {
            gInputEngine.addListener('restart', function () {
                if (gGameEngine.playersCount === 0) {
                    gGameEngine.menu.setMode('single');
                } else {
                    gGameEngine.menu.hide();
                    gGameEngine.restart();
                }
            });
        }, 200); */

        const that = this;
        // Escape listener
        gInputEngine.addListener('escape', function () {
            if (!gGameEngine.menu.visible) {
                // Reset canvas position
                that.stage.x = 0;
                gGameEngine.menu.show();
            }
        });

        if (gGameEngine.playersCount > 0) {
            if (this.soundtrackLoaded) {
                this.playSoundtrack();
            }
        }

        if (!gGameEngine.playing) {
            this.menu.show();
        }

        // Start loop
        super.setup();
    }

    onSoundLoaded(sound) {
        if (sound.id === 'game') {
            gGameEngine.soundtrackLoaded = true;
            if (gGameEngine.playersCount > 0) {
                gGameEngine.playSoundtrack();
            }
        }
    }

    update() {
        super.update();

        // Player
        for (let i = 0; i < gGameEngine.players.length; i++) {
            const player = gGameEngine.players[i];
            player.update();
        }

        // Bots
        for (let i = 0; i < gGameEngine.bots.length; i++) {
            const bot = gGameEngine.bots[i];
            bot.update();
        }

        // Bombs
        for (let i = 0; i < gGameEngine.bombs.length; i++) {
            const bomb = gGameEngine.bombs[i];
            bomb.update();
        }

        if (gGameEngine.gameMode === BomberGame.MODE_SURVIVAL) {
            if (gGameEngine.stairs) {
                gGameEngine.stairs.update();
            }
        }

        // Menu
        gGameEngine.menu.update();
    }

    drawTiles() {
        for (let i = 0; i < this.tilesY; i++) {
            for (let j = 0; j < this.tilesX; j++) {
                if ((i === 0 || j === 0 || i === this.tilesY - 1 || j === this.tilesX - 1)
                    || (j % 2 === 0 && i % 2 === 0)) {
                    // Wall tiles
                    const tile = new Tile(Tile.TILE_WALL, { x: j, y: i });
                    this.stage.addChild(tile.bmp);
                    this.tiles.push(tile);
                } else {
                    // Grass tiles
                    const tile = new Tile(Tile.TILE_FLOOR, { x: j, y: i });
                    this.stage.addChild(tile.bmp);

                    // Wood tiles
                    if (!(i <= 2 && j <= 2)
                        && !(i >= this.tilesY - 3 && j >= this.tilesX - 3)
                        && !(i <= 2 && j >= this.tilesX - 3)
                        && !(i >= this.tilesY - 3 && j <= 2)) {

                        var wood = new Tile(Tile.TILE_BLOCK, { x: j, y: i });
                        this.stage.addChild(wood.bmp);
                        this.tiles.push(wood);
                    }
                }
            }
        }
    }

    drawPowerUps() {
        // Cache woods tiles
        const woods = [];
        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            if (tile.material === Tile.TILE_BLOCK) {
                woods.push(tile);
            }
        }

        // Sort tiles randomly
        woods.sort(function () {
            return 0.5 - Math.random();
        });

        // Distribute power ups to quarters of map precisely fairly
        for (let j = 0; j < 4; j++) {
            const powerUpsCount = Math.round(woods.length * this.powerUpsPercent * 0.01 / 4);
            let placedCount = 0;
            for (let i = 0; i < woods.length; i++) {
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

                    placedCount++;

                    tile.powerUp = powerUp;
                }
            }
        }
        // Move all tiles to front
        for (let i = this.tilesX; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            this.moveToFront(tile.bmp);
        }
    }

    spawnBots() {
        this.bots = [];

        const skullImg = gGameEngine.imgs['charSkullImg'];
        const darkMageImg = gGameEngine.imgs['charDarkMageImg'];

        if (this.botsCount >= 1) {
            const bot2 = new Bot({ x: 1, y: this.tilesY - 2 }, null, null, skullImg);
            this.bots.push(bot2);
        }

        if (this.botsCount >= 2) {
            const bot3 = new Bot({ x: this.tilesX - 2, y: 1 }, null, null, darkMageImg);
            this.bots.push(bot3);
        }

        if (this.botsCount >= 3) {
            const bot = new Bot({ x: this.tilesX - 2, y: this.tilesY - 2 }, null, null, skullImg);
            this.bots.push(bot);
        }

        if (this.botsCount >= 4) {
            const bot = new Bot({ x: 1, y: 1 }, null, null, skullImg);
            this.bots.push(bot);
        }
    }

    spawnPlayers() {
        this.players = [];

        if (this.playersCount >= 1) {
            const player = new Player({ x: 1, y: 1 }, null, null, gGameEngine.imgs['playerGirlImg']);
            this.players.push(player);
        }

        if (this.playersCount >= 2) {
            const controls = {
                'up': 'up2',
                'left': 'left2',
                'down': 'down2',
                'right': 'right2',
                'bomb': 'bomb2'
            };
            const player2 = new Player({ x: this.tilesX - 2, y: this.tilesY - 2 }, controls, 1, gGameEngine.imgs['playerGirl2Img']);
            this.players.push(player2);
        }
    }

    resetPlayers() {
        if (this.playersCount >= 1) {
            const playerOne = this.players[0];
            playerOne.teleport({ x: 1, y: 1 });
        }

        if (this.playersCount >= 2) {
            const playerTwo = this.players[1];
            playerTwo.teleport({ x: 1, y: 1 });
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
        for (let i = 0; i < this.tiles.length; i++) {
            const tile = this.tiles[i];
            if (tile.position.x === position.x && tile.position.y === position.y) {
                return tile;
            }
        }
    }

    /**
     * Returns tile material at given position.
     */
    getTileMaterial(position) {
        const tile = this.getTile(position);
        return (tile) ? tile.material : Tile.TILE_FLOOR;
    }

    checkGameOver() {
        if (gGameEngine.countPlayersAlive() === 0) {
            this.gameOver('lose');
        }

        let botsAlive = false;
    
        for (let i = 0; i < this.bots.length; i++) {
            const bot = this.bots[i];
            if (bot.alive) {
                botsAlive = true;
            }
        }

        if (this.gameMode === BomberGame.MODE_BATTLE) {
            if (this.countPlayersAlive() === 1 && this.playersCount === 2) {
                this.gameOver('win');
            }
    
            if (!botsAlive && this.countPlayersAlive() === 1) {
                this.gameOver('win');
            }
        } else {
            if (!botsAlive) {
                // Open stair to next level
                console.log(gGameEngine.stairs);
                gGameEngine.stairs.open();
                // TODO make sound
            }
        }
    }

    gameOver(status) {
        if (this.menu.visible) { return; }

        this.stage.x = 0;
        if (status === 'win') {
            let winText = "You won!";
            if (this.playersCount > 1) {
                const winner = this.getWinner();
                winText = winner === 0 ? "Player 1 won!" : "Player 2 won!";
            }
            this.menu.show([{ text: winText, color: '#669900' }, { text: ' ;D', color: '#99CC00' }]);
        } else {
            this.menu.show([{ text: 'Game Over', color: '#CC0000' }, { text: ' :(', color: '#FF4444' }]);
        }
    }

    getWinner() {
        for (let i = 0; i < gGameEngine.players.length; i++) {
            const player = gGameEngine.players[i];
            if (player.alive) {
                return i;
            }
        }
    }

    restart() {
        this.stage.x = (640 - this.tilesX * this.tileSize) / 2;

        gInputEngine.removeAllListeners();
        gGameEngine.stage.removeAllChildren();
        gGameEngine.setup();
    }

    /**
     * Moves specified child to the front.
     */
    moveToFront(child) {
        const children = gGameEngine.stage.numChildren;
        gGameEngine.stage.setChildIndex(child, children - 1);
    }

    countPlayersAlive() {
        let playersAlive = 0;
        for (let i = 0; i < gGameEngine.players.length; i++) {
            if (gGameEngine.players[i].alive) {
                playersAlive++;
            }
        }
        return playersAlive;
    }

    getPlayersAndBots() {
        const players = [];

        for (let i = 0; i < gGameEngine.players.length; i++) {
            players.push(gGameEngine.players[i]);
        }

        for (let i = 0; i < gGameEngine.bots.length; i++) {
            players.push(gGameEngine.bots[i]);
        }

        return players;
    }

    getLevelBlockImage() {
        return this.currentLevelTheme.blockImg;
    }

    getLevelFloorImage() {
        return this.currentLevelTheme.floorImg;
    }

    getLevelWallImage() {
        return this.currentLevelTheme.wallImg;
    }

    nextLevel() {
        gGameEngine.currentLevel++;
        gGameEngine.setup();
    }
}
