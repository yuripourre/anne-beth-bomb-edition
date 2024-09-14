import {Utils} from "../Utils";
import {gGameEngine} from "../GameEngine";
import {Bot} from "../Bot";
import {Tile} from "../Tile";

/**
 * This enemy has a completely random behavior
 */
class RandomBot extends Bot {
    constructor(position, controls, id, img) {
        super(position, controls, id, img);
    }

    update() {
        if (!this.alive) {
            this.fade();
            return;
        }

        if (this.targetBitmapPosition.x === this.bmp.x && this.targetBitmapPosition.y === this.bmp.y) {
            this.findRandomTargetPosition();
        }

        this.moveToTargetPosition();
        this.handlePowerUpCollision();

        if (this.detectFireCollision()) {
            this.die();
        }
    }

    findRandomTargetPosition() {
        var directions = ['up', 'down', 'left', 'right'];
        var randomDirection = directions[Math.floor(Math.random() * directions.length)];

        switch (randomDirection) {
            case 'up':
                this.dirX = 0;
                this.dirY = -1;
                break;
            case 'down':
                this.dirX = 0;
                this.dirY = 1;
                break;
            case 'left':
                this.dirX = -1;
                this.dirY = 0;
                break;
            case 'right':
                this.dirX = 1;
                this.dirY = 0;
                break;
        }

        var target = { x: this.position.x + this.dirX, y: this.position.y + this.dirY };
        if (gGameEngine.getTileMaterial(target) === Tile.TILE_FLOOR && !this.detectWallCollision(Utils.convertToBitmapPosition(target))) {
            this.targetPosition = target;
            this.targetBitmapPosition = Utils.convertToBitmapPosition(this.targetPosition);
        } else {
            this.findRandomTargetPosition(); // Retry finding a valid position
        }
    }
}
