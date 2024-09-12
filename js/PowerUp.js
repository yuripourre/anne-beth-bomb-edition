POWER_UP_BOMB = 'bomb';
POWER_UP_FIRE = 'fire';
POWER_UP_SPEED = 'speed';

class PowerUp {
    types = [POWER_UP_SPEED, POWER_UP_BOMB, POWER_UP_FIRE];

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
        gGameEngine.stage.addChild(this.bmp);
    }

    destroy() {
        gGameEngine.stage.removeChild(this.bmp);
        Utils.removeFromArray(gGameEngine.powerUps, this);
    }
}
