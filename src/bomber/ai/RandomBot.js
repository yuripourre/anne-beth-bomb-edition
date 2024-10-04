import {Utils} from "../Utils.js";
import {gGameEngine} from "../../app.js";
import {Bot} from "../Bot.js";
import {Tile} from "../Tile.js";

/**
 * This enemy has a completely random behavior
 */
export class RandomBot extends Bot {
    constructor(position, controls, id, img) {
        super(position, controls, id, img);
    }

    update() {
        if (!this.alive) {
            this.fade();
            return;
        }

        this.wait = false;

        if (!this.started && this.startTimer < this.startTimerMax) {
            this.startTimer++;
            if (this.startTimer >= this.startTimerMax) {
                this.started = true;
            }
            this.animate('idle');
            this.wait = true;
        }

        if (this.targetBitmapPosition.x === this.bmp.x && this.targetBitmapPosition.y === this.bmp.y) {
            this.findTargetPosition();
        }

        if (!this.wait) {
            this.moveToTargetPosition();
        }

        if (this.detectFireCollision()) {
            this.die();
        }

        if (this.detectFireCollision()) {
            this.die();
        }
    }

    findTargetPosition() {
        var directions = ['up', 'down', 'left', 'right'];
        var randomDirection = directions[Math.floor(Math.random() * directions.length)];
        this.direction = randomDirection;

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
            this.findTargetPosition(); // Retry finding a valid position
        }
    }
}
