import {Utils} from "../Utils";
import {Bot} from "../Bot";

class AlignedBot extends Bot {
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

            // Aligning to horizontal or vertical direction
            if (this.shouldAlign()) {
                this.alignToDirection();
            }

            if (!this.wait) {
                this.findTargetPosition();
            }
        }

        if (!this.wait) {
            this.moveToTargetPosition();
        }
        this.handlePowerUpCollision();

        if (this.detectFireCollision()) {
            this.die();
        }
    }

    /**
     * Ovape-like behavior: checks whether the bot should align to vertical/horizontal direction.
     */
    shouldAlign() {
        return Math.random() > 0.5;
    }

    /**
     * Aligns bot to either a horizontal or vertical direction before moving.
     */
    alignToDirection() {
        const directions = ['up', 'down', 'left', 'right'];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];

        switch (randomDirection) {
            case 'up':
                this.dirX = 0;
                this.dirY = -1;
                this.direction = 'up';
                break;
            case 'down':
                this.dirX = 0;
                this.dirY = 1;
                this.direction = 'down';
                break;
            case 'left':
                this.dirX = -1;
                this.dirY = 0;
                this.direction = 'left';
                break;
            case 'right':
                this.dirX = 1;
                this.dirY = 0;
                this.direction = 'right';
                break;
        }
    }

    /**
     * Overrides the findTargetPosition to prioritize aligned movement like Ovape.
     */
    findTargetPosition() {
        const target = { x: this.position.x, y: this.position.y };
        target.x += this.dirX;
        target.y += this.dirY;

        const targets = this.getPossibleTargets();
        if (targets.length > 1) {
            const previousPosition = this.getPreviousPosition();
            for (let i = 0; i < targets.length; i++) {
                const item = targets[i];
                if (item.x === previousPosition.x && item.y === previousPosition.y) {
                    targets.splice(i, 1);
                }
            }
        }
        this.targetPosition = this.getRandomTarget(targets);
        if (this.targetPosition && this.targetPosition.x) {
            this.loadTargetPosition(this.targetPosition);
            this.targetBitmapPosition = Utils.convertToBitmapPosition(this.targetPosition);
        }
    }
}
