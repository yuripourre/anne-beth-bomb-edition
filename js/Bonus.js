Bonus = Entity.extend({
    types: ['speed', 'bomb', 'fire'],

    type: '',
    position: {},
    bmp: null,

    init: function(position, typePosition) {
        this.type = this.types[typePosition];
        
        this.position = position;

        var tileSize = gGameEngine.tileSize;
        
        this.bmp = new createjs.Bitmap(gGameEngine.bonusesImg);
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;
        this.bmp.sourceRect = new createjs.Rectangle(typePosition * tileSize, 0, tileSize, tileSize);
        gGameEngine.stage.addChild(this.bmp);
    },

    destroy: function() {
        gGameEngine.stage.removeChild(this.bmp);
        Utils.removeFromArray(gGameEngine.bonuses, this);
    }
});
