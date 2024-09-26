import {gGameEngine} from "../app.js";
import {gInputEngine} from "../InputEngine.js";
import {Engine} from "../Engine.js";

export class TileMapExample extends Engine {
    tileSize = 32;
    tilesX = 21;
    tilesY = 13;

    tiles = [];

    screen = null;

    tileMap = [
        [0, 1, 2, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 1, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 2, 0, 1, 2, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 2, 0, 1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [2, 0, 1, 2, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 2, 2, 2, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    tileTypes = {
        0: "grass",
        1: "dirt",
        2: "water"
    };

    constructor() {
        super();
        this.size = {
            w: this.tileSize * this.tilesX,
            h: this.tileSize * this.tilesY
        };

        this.character = {
            x: 0,
            y: 0
        };
    }

    load() {
        this.size.w = 640;
        this.size.h = 360;

        this.character.x = 0;
        this.character.y = 0;

        super.load();

        this.screen = new createjs.Container();

        for (let r = 0; r < this.tilesY; r++) {
            for (let c = 0; c < this.tilesX; c++) {
                const tile = new createjs.Shape();
                // Fill with green and add black border
                //const tileSprite = new createjs.Sprite(spriteSheet, tileTypes[tileMap[r][c]]);
                tile.graphics.beginFill("#009900")
                    .setStrokeStyle(1) // Set border thickness
                    .beginStroke("black") // Set border color
                    .drawRect(0, 0, this.tileSize, this.tileSize);
                tile.x = c * this.tileSize;
                tile.y = r * this.tileSize;
                this.tiles.push(tile);
                this.screen.addChild(tile);
            }
        }

        this.stage.addChild(this.screen);

        // We need to call setup manually if we are not loading assets
        this.setup();
    }

    setup() {
        if (!gInputEngine.bindings.length) {
            gInputEngine.bindKey(38, 'up');
            gInputEngine.bindKey(37, 'left');
            gInputEngine.bindKey(40, 'down');
            gInputEngine.bindKey(39, 'right');

            gInputEngine.setup();
        }

        super.setup();
    }

    moveCharacter(dx, dy) {
        // Update character position
        this.character.x += dx;
        this.character.y += dy;

        const tileOffsetX = this.character.x % this.tileSize;
        const tileOffsetY = this.character.y % this.tileSize;

        // Player Index Offset
        const px = Math.floor(this.character.x / this.tileSize);
        const py = Math.floor(this.character.y / this.tileSize);

        // Update tile positions
        for (let r = 0; r < this.tilesY; r++) {
            for (let c = 0; c < this.tilesX; c++) {
                const tileIndex = r * this.tilesX + c;  // Get index in the pool
                const tileSprite = this.tiles[tileIndex];

                // Clear previous graphics
                tileSprite.graphics.clear();

                // Update the sprite's animation based on the updated tileMap
                const tileType = this.tileTypes[this.tileMap[r + py][c + px]];

                if (tileType === 'grass') {
                    tileSprite.graphics.beginFill("#009900")
                        .setStrokeStyle(1) // Set border thickness
                        .beginStroke("black") // Set border color
                        .drawRect(0, 0, this.tileSize, this.tileSize)
                } else if (tileType === 'dirt') {
                    tileSprite.graphics.beginFill("#999999")
                        .setStrokeStyle(1) // Set border thickness
                        .beginStroke("black") // Set border color
                        .drawRect(0, 0, this.tileSize, this.tileSize)
                } else if (tileType === 'water') {
                    tileSprite.graphics.beginFill("#000099")
                        .setStrokeStyle(1) // Set border thickness
                        .beginStroke("black") // Set border color
                        .drawRect(0, 0, this.tileSize, this.tileSize)
                }

                tileSprite.x = c * this.tileSize - tileOffsetX;
                tileSprite.y = r * this.tileSize - tileOffsetY;
            }
        }
    }

    update() {
        let dx = 0;
        let dy = 0;

        const speed = 1;

        if (gInputEngine.actions['up']) {
            dy = -speed;
        } else if (gInputEngine.actions['down']) {
            dy = speed;
        }
        if (gInputEngine.actions['left']) {
            dx = -speed;
        } else if (gInputEngine.actions['right']) {
            dx = speed;
        }

        if (dx || dy) {
            gGameEngine.moveCharacter(dx, dy);
        }

        super.update();
    }
}
