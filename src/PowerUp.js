import {gGameEngine} from "./GameEngine.js";
import {Utils} from "./Utils.js";

export class PowerUp {

    static POWER_UP_BOMB = 'bomb';
    static POWER_UP_FIRE = 'fire';
    static POWER_UP_SPEED = 'speed';

    types = [PowerUp.POWER_UP_SPEED, PowerUp.POWER_UP_BOMB, PowerUp.POWER_UP_FIRE];

    type = '';
    position = {};
    bmp = null;

    constructor(position, typePosition) {
        this.type = this.types[typePosition];
        
        this.position = position;

        var tileSize = gGameEngine.tileSize;
        
        this.bmp = new createjs.Bitmap(gGameEngine.powerUpsImg);
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;
        this.bmp.sourceRect = new createjs.Rectangle(typePosition * tileSize, 0, tileSize, tileSize);
        gGameEngine.canvas.addChild(this.bmp);
    }

    destroy() {
        gGameEngine.canvas.removeChild(this.bmp);
        Utils.removeFromArray(gGameEngine.powerUps, this);
    }
}
