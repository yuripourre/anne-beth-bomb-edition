import {gGameEngine} from "../app.js";
import {Utils} from "./Utils.js";

export class Stairs {

    created = false;
    opened = false;
    position = {};
    bmp = null;
    spriteIndex = 0;

    constructor() {}

    create() {
        if (this.created) {
            return;
        }
        var tileSize = gGameEngine.tileSize;

        this.bmp = new createjs.Bitmap(gGameEngine.imgs['objectsImg']);
        
        this.bmp.sourceRect = new createjs.Rectangle(this.spriteIndex * tileSize, 0, tileSize, tileSize);
        gGameEngine.stage.addChild(this.bmp);

        this.created = true;
    }

    move(position) {
        this.position = position;
        var pixels = Utils.convertToBitmapPosition(this.position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        this.spriteIndex = 0;
        this.bmp.sourceRect.x = this.spriteIndex * gGameEngine.tileSize;
    }

    open() {
        this.opened = true;
        this.spriteIndex = 1;
        this.bmp.sourceRect.x = this.spriteIndex * gGameEngine.tileSize;
    }

    update() {
        if (!this.opened) {
            return;
        }
        // If player is on stairs
        for (let i = 0; i < gGameEngine.players.length; i++) {
            var pl = gGameEngine.players[i];
            if (Utils.comparePositions(pl.position, gGameEngine.stairs.position)) {
                // New level
                gGameEngine.nextLevel();
                break;
            }
        }
    }

    destroy() {
        gGameEngine.stage.removeChild(this.bmp);
    }
}
