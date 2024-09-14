// Breakable tiles
TILE_BLOCK = 'block';
// Walkable tiles
TILE_FLOOR = 'floor';
// Unbreakable tiles
TILE_WALL = 'wall';

class Tile {
    /**
     * Entity position on map grid
     */
    position = {};

    /**
     * Bitmap dimensions
     */
    size = {
        w: 32,
        h: 32
    };

    /**
     * Bitmap animation
     */
    bmp = null;

    material = '';

    constructor(material, position) {
        this.material = material;
        this.position = position;
        var img;
        if (material === TILE_FLOOR) {
            img = gGameEngine.getLevelFloorImage();
        } else if (material === TILE_WALL) {
            img = gGameEngine.getLevelWallImage();
        } else if (material === TILE_BLOCK) {
            img = gGameEngine.getLevelBlockImage();
        }
        this.bmp = new createjs.Bitmap(img);
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        if (material === TILE_FLOOR) {
            this.bmp.sourceRect = new createjs.Rectangle(0, 0, gGameEngine.tileSize, gGameEngine.tileSize);
        } else if (material === TILE_WALL) {
            this.bmp.sourceRect = new createjs.Rectangle(0, 0, gGameEngine.tileSize, gGameEngine.tileSize);
        } else if (material === TILE_BLOCK) {
            this.bmp.sourceRect = new createjs.Rectangle(0, 0, gGameEngine.tileSize, gGameEngine.tileSize);
        }
    }

    update() {
    }

    remove() {
        gGameEngine.canvas.removeChild(this.bmp);
        for (var i = 0; i < gGameEngine.tiles.length; i++) {
            var tile = gGameEngine.tiles[i];
            if (this === tile) {
                gGameEngine.tiles.splice(i, 1);
            }
        }
    }
}