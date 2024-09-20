import {gGameEngine} from "./GameEngine.js";

export class Utils {

    /**
     * Returns true if positions are equal.
     */
    static comparePositions(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    };


    /**
     * Convert bitmap pixels position to entity on grid position.
     */
    static convertToEntityPosition(pixels) {
        var position = {};
        position.x = Math.round((pixels.x - gGameEngine.offsetX) / gGameEngine.tileSize);
        position.y = Math.round((pixels.y - gGameEngine.offsetY) / gGameEngine.tileSize);
        return position;
    };

    /**
     * Convert entity on grid position to bitmap pixels position.
     */
    static convertToBitmapPosition(entity) {
        var position = {};
        position.x = entity.x * gGameEngine.tileSize + gGameEngine.offsetX;
        position.y = entity.y * gGameEngine.tileSize + gGameEngine.offsetY;
        return position;
    };

    /**
     * Removes an item from array.
     */
    static removeFromArray(array, item) {
        for (var i = 0; i < array.length; i++) {
            if (item === array[i]) {
                array.splice(i, 1);
            }
        }
        return array;
    };

}