import {gGameEngine} from "../app.js";
import {Utils} from "./Utils.js";

export class PowerUp {

    static POWER_UP_BOMB = 'bomb';
    static POWER_UP_FIRE = 'fire';
    static POWER_UP_SPEED = 'speed';

    types = [PowerUp.POWER_UP_SPEED, PowerUp.POWER_UP_BOMB, PowerUp.POWER_UP_FIRE];

    type = '';
    position = {};
    bmp = null;
    spriteIndex = 0;

    constructor(position, spriteIndex) {
        this.type = this.types[spriteIndex];
        this.spriteIndex = spriteIndex;

        this.position = position;
    }

    create() {
        var tileSize = gGameEngine.tileSize;

        this.bmp = new createjs.Bitmap(gGameEngine.imgs['powerUpsImg']);
        var pixels = Utils.convertToBitmapPosition(this.position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;
        this.bmp.sourceRect = new createjs.Rectangle(this.spriteIndex * tileSize, 0, tileSize, tileSize);
        gGameEngine.stage.addChild(this.bmp);
    }

    destroy() {
        gGameEngine.stage.removeChild(this.bmp);
        Utils.removeFromArray(gGameEngine.powerUps, this);
    }
}
