import {gGameEngine} from "../app.js";
import {gInputEngine} from "../InputEngine.js";
import {Engine} from "../Engine.js";

export class TileMapExample extends Engine {
    tileSize = 32;
    tilesX = 21;
    tilesY = 13;

    tiles = [];

    screen = null;

    tileMapData = null;

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

    async load() {
        this.size.w = 640;
        this.size.h = 360;

        this.character.x = 0;
        this.character.y = 0;

        super.load();

        // Load the Tiled map JSON
        await this.loadMapData('static/map/example.json');
        this.screen = new createjs.Container();

        // Bypassing createjs
        // Load the tileset image as a spritesheet
        this.tileset = new Image();
        this.tileset.src = 'static/map/tileset.png';  // Your tileset image file (e.g., 32x32 pixel tiles)
        this.tileset.onload = () => {
            this.drawMap();
        };
    }

    drawMap() {

        const spriteSheet = new createjs.SpriteSheet({
            images: [this.tileset],
            frames: { width: this.tileSize, height: this.tileSize },
        });

        // Assuming the map has a "layers" array and the first layer is the tile layer
        const tileLayer = this.tileMapData.layers.find(layer => layer.type === 'tilelayer');
        if (tileLayer) {
            //const tilesX = tileLayer.width;
            //const tilesY = tileLayer.height;
            const tilesX = this.tilesX;
            const tilesY = this.tilesY;

            // Loop over the tile layer data and create shapes
            for (let r = 0; r < tilesY; r++) {
                for (let c = 0; c < tilesX; c++) {
                    // We need to use the layer width to calculate the tile index
                    const tileIndex = r * tileLayer.width + c;
                    const tileId = tileLayer.data[tileIndex];
                    const tileType = this.getTileType(tileId); // Get the tile type/color

                    // Create a new sprite from the spritesheet for each tile
                    const tileSprite = new createjs.Sprite(spriteSheet);
                    tileSprite.gotoAndStop(tileType.frameIndex);

                    tileSprite.x = c * this.tileSize;
                    tileSprite.y = r * this.tileSize;
                    this.tiles.push(tileSprite);
                    this.screen.addChild(tileSprite);
                }
            }
        }

        this.stage.addChild(this.screen);

        // We need to call setup manually if we are not loading assets
        this.setup();
    }

    async loadMapData(mapUrl) {
        const response = await fetch(mapUrl);
        this.tileMapData = await response.json();
    }

    getTileType(tileId) {
        // Simple function to map Tiled tile IDs to colors or other properties
        const tileTypes = {
            0: { name: "grass", color: "#009900", frameIndex: 0 },
            1: { name: "dirt", color: "#b5651d", frameIndex: 4 },
            2: { name: "water", color: "#0000ff", frameIndex: 20 },
            3: { name: "stone", color: "#666666", frameIndex: 36 },
            // Add more mappings based on your Tiled map tileset
        };

        return tileTypes[tileId] || { name: "unknown", color: "#ffffff" }; // Default to white if tileId doesn't match
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

    moveMap(dx, dy) {
        // Update character position
        this.character.x += dx;
        this.character.y += dy;

        const tileOffsetX = this.character.x % this.tileSize;
        const tileOffsetY = this.character.y % this.tileSize;

        // Player Index Offset
        const px = Math.floor(this.character.x / this.tileSize);
        const py = Math.floor(this.character.y / this.tileSize);

        const tileLayer = this.tileMapData.layers.find(layer => layer.type === 'tilelayer');

        // Update tile positions
        for (let r = 0; r < this.tilesY; r++) {
            for (let c = 0; c < this.tilesX; c++) {
                // We need to use the layer width to calculate the tile index
                const tileIndex = (r + py) * tileLayer.width + c + px;
                const tileId = tileLayer.data[tileIndex];
                const tileType = this.getTileType(tileId); // Get the tile type/color

                const spriteIndex = r * this.tilesX + c;
                const tileSprite = this.tiles[spriteIndex];
                // Clear previous graphics
                //tileSprite.graphics.clear();
                tileSprite.gotoAndStop(tileType.frameIndex);

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
            gGameEngine.moveMap(dx, dy);
        }

        super.update();
    }
}
