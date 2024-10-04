import {Bot} from "../Bot.js";
import {Utils} from "../Utils.js";

/**
 * This bot mimics the behavior of Pontan.
 * Random Movement: Pontan moves randomly across the map and avoids obstacles.
 * Bomb Placement: Periodically places bombs as it moves. The bomb placement frequency increases when the player is nearby.
 * Obstacle Awareness: Avoids obstacles and changes direction when blocked.
 * Aggressive Mode: When the player is close, Pontan becomes more aggressive, moving faster and placing bombs more frequently.
 * Bomb Avoidance: Pontan avoids placing bombs too close to existing bombs.
 */
export class BomberBot extends Bot {
    constructor(position, controls, id, img) {
        super(position, controls, id, img);
        this.bombCooldownMax = 300; // Time between bomb placements
        this.bombCooldown = this.bombCooldownMax;
        this.aggressiveMode = false; // Aggressive mode when player is near
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

        if (!this.wait) {
            this.randomMovement();
            this.handleBombPlacement();
        }

        this.moveToTargetPosition();

        if (this.detectFireCollision()) {
            this.die();
        }
    }

    /**
     * Pontan moves randomly across the map.
     * Randomly changes direction and ensures it's not walking into walls or obstacles.
     */
    randomMovement() {
        if (!this.aggressiveMode) {
            // Change direction randomly at intervals
            if (Math.random() < 0.02) {
                const directions = ['left', 'right', 'up', 'down'];
                this.direction = directions[Math.floor(Math.random() * directions.length)];
            }
        }

        // Set movement direction based on current direction
        switch (this.direction) {
            case 'left':
                this.dirX = -1;
                this.dirY = 0;
                break;
            case 'right':
                this.dirX = 1;
                this.dirY = 0;
                break;
            case 'up':
                this.dirX = 0;
                this.dirY = -1;
                break;
            case 'down':
                this.dirX = 0;
                this.dirY = 1;
                break;
        }

        // Update target position
        this.targetPosition = { x: this.position.x + this.dirX, y: this.position.y + this.dirY };
        this.targetBitmapPosition = Utils.convertToBitmapPosition(this.targetPosition);

        // Recalculate if there's an obstacle in the way
        if (this.isBlocked(this.targetPosition)) {
            this.changeDirection(); // Pick a new random direction if blocked
        }

        // Switch to aggressive mode if player is near
        /*const playerPosition = this.getPlayerPosition();
        if (playerPosition && this.isPlayerNear(playerPosition)) {
            this.aggressiveMode = true;
            this.increaseAggressiveness();
        } else {
            this.aggressiveMode = false;
        }*/
    }

    /**
     * Places a bomb periodically, avoiding its own bombs and the player's bombs.
     */
    handleBombPlacement() {
        // Countdown for bomb placement
        if (this.bombCooldown > 0) {
            this.bombCooldown--;
        }

        // Place bomb if cooldown has expired
        if (this.bombCooldown <= 0 && this.canPlaceBomb()) {
            this.placeBomb();
            this.bombCooldown = this.bombCooldownMax; // Reset cooldown
        }
    }

    /**
     * Checks if Pontan can place a bomb at its current position.
     * Avoids placing bombs too close to other bombs.
     */
    canPlaceBomb() {
        return !this.isBombNearby(this.position); // Prevent bomb overlap
    }

    /**
     * Adjusts Pontan's behavior to be more aggressive when the player is near.
     */
    increaseAggressiveness() {
        // When in aggressive mode, increase movement speed or bomb frequency
        this.bombCooldownMax = 200; // Place bombs more frequently
    }

    /**
     * Detects if the player is near Pontan.
     * @param {Object} playerPosition - The position of the player.
     * @returns {Boolean} - True if the player is near, false otherwise.
     */
    isPlayerNear(playerPosition) {
        const distanceX = Math.abs(playerPosition.x - this.position.x);
        const distanceY = Math.abs(playerPosition.y - this.position.y);
        return distanceX <= 2 && distanceY <= 2; // Example: considers "near" as within 2 tiles
    }

    /**
     * Places a bomb at Pontan's current position.
     */
    placeBomb() {
        // Implement bomb placement logic here
        console.log("Pontan placed a bomb at position", this.position);
    }

    /**
     * Handles movement when Pontan encounters an obstacle.
     * Picks a new direction randomly.
     */
    changeDirection() {
        const directions = ['left', 'right', 'up', 'down'];
        this.direction = directions[Math.floor(Math.random() * directions.length)];
    }

    /**
     * Checks if the next position is blocked by an obstacle.
     * @param {Object} position - The next position to check.
     * @returns {Boolean} - True if blocked, false otherwise.
     */
    isBlocked(position) {
        // Example check: you can customize this based on your map/grid logic
        //return this.map.isWall(position.x, position.y);
        return false;
    }

    /**
     * Checks if there is a bomb near the current position.
     * @param {Object} position - The position to check.
     * @returns {Boolean} - True if a bomb is nearby, false otherwise.
     */
    isBombNearby(position) {
        // Example logic for checking nearby bombs
        //return this.map.isBombAt(position.x, position.y);
        return false;
    }
}
