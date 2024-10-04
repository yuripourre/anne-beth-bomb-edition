import {Bot} from "../Bot.js";
import {Utils} from "../Utils.js";

export class ChaseBot extends Bot {
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

            // Chase logic: find the player or nearest threat and move towards them
            if (this.shouldChase()) {
                this.chasePlayer();
            }

            if (!this.wait) {
                this.findTargetPosition();
            }
        }

        if (!this.wait) {
            this.moveToTargetPosition();
        }

        if (this.detectFireCollision()) {
            this.die();
        }
    }

    /**
     * Dahl-like behavior: determines whether the bot should chase the player.
     */
    shouldChase() {
        return Math.random() > 0.7; // 70% chance of chasing
    }

    /**
     * Logic for chasing the player or nearest threat.
     */
    chasePlayer() {
        const playerPosition = this.getPlayerPosition();

        if (playerPosition) {
            const dx = playerPosition.x - this.position.x;
            const dy = playerPosition.y - this.position.y;

            // Move in the direction that reduces the distance to the player
            if (Math.abs(dx) > Math.abs(dy)) {
                this.dirX = dx > 0 ? 1 : -1;
                this.dirY = 0;
                this.direction = this.dirX > 0 ? 'right' : 'left';
            } else {
                this.dirX = 0;
                this.dirY = dy > 0 ? 1 : -1;
                this.direction = this.dirY > 0 ? 'down' : 'up';
            }
        }
    }

    /**
     * Overrides the findTargetPosition to prioritize chasing the player or moving towards them.
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
