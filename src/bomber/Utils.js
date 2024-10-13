import {gGameEngine} from "../app.js";

export class Utils {

    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * Returns true if positions are equal.
     */
    static comparePositions(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    };

    static compareTilePositions(pos1, pos2) {
        const a = Utils.convertToEntityPosition(pos1);
        const b = Utils.convertToEntityPosition(pos2);

        return this.comparePositions(a, b);
    };

    /**
     * Convert bitmap pixels position to entity on grid position.
     */
    static convertToEntityPosition(pixels) {
        var position = {};
        position.x = Math.round(pixels.x / gGameEngine.tileSize);
        position.y = Math.round(pixels.y /gGameEngine.tileSize);
        return position;
    };

    /**
     * Convert entity on grid position to bitmap pixels position.
     */
    static convertToBitmapPosition(entity) {
        var position = {};
        position.x = entity.x * gGameEngine.tileSize;
        position.y = entity.y * gGameEngine.tileSize;
        return position;
    };

    /**
     * Removes an item from array.
     */
    static removeFromArray(array, item) {
        for (let i = 0; i < array.length; i++) {
            if (item === array[i]) {
                array.splice(i, 1);
            }
        }
        return array;
    };

}
