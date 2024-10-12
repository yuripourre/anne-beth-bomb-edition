import {gGameEngine} from "../app.js";
import {gInputEngine} from "../InputEngine.js";
import {Utils} from "./Utils.js";
import {PowerUp} from "./PowerUp.js";
import {Bot} from "./Bot.js";
import {Bomb} from "./Bomb.js";

export class Player {
    id = 0;

    /**
     * Moving speed
     */
    velocity = 2;

    /**
     * Max number of bombs user can spawn
     */
    bombsMax = 1;

    /**
     * How far the fire reaches when bomb explodes
     */
    bombStrength = 1;

    /**
     * Entity position on map grid
     */
    position = {};

    /**
     * Bitmap dimensions
     */
    size = {
        w: 32,
        h: 32
    };

    /**
     * Bitmap animation
     */
    bmp = null;

    alive = true;

    bombs = [];

    controls = {
        'up': 'up',
        'left': 'left',
        'down': 'down',
        'right': 'right',
        'bomb': 'bomb'
    };

    /**
     * Bomb that player can escape from even when there is a collision
     */
    escapeBomb = null;

    deadTimer = 0;

    constructor(position, controls, id, img) {
        if (id) {
            this.id = id;
        }

        if (controls) {
            this.controls = controls;
        }

        const numFrames = 3;

        var spriteSheet = new createjs.SpriteSheet({
            images: [img],
            frames: { width: this.size.w, height: this.size.h, regX: 0, regY: 0 },
            animations: {
                idle: [0, 0, 'idle'],
                down: [0, 2, 'down', 0.1],
                left: [3, 5, 'left', 0.1],
                right: [6, 8, 'right', 0.1],
                up: [9, 11, 'up', 0.1],
                dead: [12, 15, 'dead', 0.1]
            }
        });
        this.bmp = new createjs.Sprite(spriteSheet);

        this.position = position;
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;

        gGameEngine.stage.addChild(this.bmp);

        this.bombs = [];
        this.setBombsListener();
    }

    teleport(position) {
        this.position = position;
        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x;
        this.bmp.y = pixels.y;
    }

    setBombsListener() {
        // Subscribe to bombs spawning
        if (!(this instanceof Bot)) {
            var that = this;
            gInputEngine.addListener(this.controls.bomb, function() {
                // Check whether there is already bomb on this position
                for (let i = 0; i < gGameEngine.bombs.length; i++) {
                    var bomb = gGameEngine.bombs[i];
                    if (Utils.comparePositions(bomb.position, that.position)) {
                        return;
                    }
                }

                var unexplodedBombs = 0;
                for (let i = 0; i < that.bombs.length; i++) {
                    if (!that.bombs[i].exploded) {
                        unexplodedBombs++;
                    }
                }

                if (unexplodedBombs < that.bombsMax) {
                    var bomb = new Bomb(that.position, that.bombStrength);
                    gGameEngine.stage.addChild(bomb.bmp);
                    that.bombs.push(bomb);
                    gGameEngine.bombs.push(bomb);

                    bomb.setExplodeListener(function() {
                        Utils.removeFromArray(that.bombs, bomb);
                    });
                }
            });
        }
    }

    update() {
        if (!this.alive) {
            return;
        }
        if (gGameEngine.menu.visible) {
            return;
        }

        let position = { x: this.bmp.x, y: this.bmp.y };

        let dirX = 0;
        let dirY = 0;

        if (gInputEngine.actions[this.controls.up]) {
            this.animate('up');
            position.y -= this.velocity;
            dirY = -1;
        } else if (gInputEngine.actions[this.controls.down]) {
            this.animate('down');
            position.y += this.velocity;
            dirY = 1;
        }
        
        if (gInputEngine.actions[this.controls.left]) {
            this.animate('left');
            position.x -= this.velocity;
            dirX = -1;
        } else if (gInputEngine.actions[this.controls.right]) {
            this.animate('right');
            position.x += this.velocity;
            dirX = 1;
        } 
        
        if (!gInputEngine.actions[this.controls.up] && !gInputEngine.actions[this.controls.down] && 
            !gInputEngine.actions[this.controls.left] && !gInputEngine.actions[this.controls.right]) {
            this.animate('idle');
        }

        const tileSize = gGameEngine.tileSize;
        const halfTile = tileSize / 2;

        // Only snap if within the tolerance range (near the tile center)
        if (dirX !== 0) {
            const targetPosition = {x: position.x + dirX, y: position.y};
            if (this.detectWallCollision(targetPosition) || 
                this.detectBombCollision(targetPosition)) {
                console.log("Detected wall horizontal");
                dirX = 0;
            } else {
                const snapY = Math.round(position.y / tileSize) * tileSize;
                if (Math.abs(position.y - snapY) < halfTile) {
                    position.y = snapY;

                    this.bmp.x = targetPosition.x;
                    this.bmp.y = position.y;
                    this.updatePosition();
                }
            }
        }

        if (dirY !== 0) {
            const targetPosition = {x: position.x, y: position.y + dirY};
            if (this.detectWallCollision(targetPosition) || 
                this.detectBombCollision(targetPosition)) {
                dirY = 0;
                console.log("Detected wall vertical");
            } else {
                const snapX = Math.round(position.x / tileSize) * tileSize;
                if (Math.abs(position.x - snapX) < halfTile) {
                    position.x = snapX;

                    this.bmp.x = position.x;
                    this.bmp.y = targetPosition.y;
                    this.updatePosition();
                }
            }
        }

        //position = this.snapToGrid(position, dirX, dirY);

        // We should verify the wall collision in both directions (vertical and horizontal) separately
        /* if (!this.detectWallCollision(position) && !this.detectBombCollision(position)) {
            this.bmp.x = position.x;
            this.bmp.y = position.y;
            this.updatePosition();
        } */

        /*if (!this.detectWallCollision(position)) {
            position = this.snapToGrid(position, dirX, dirY);
            this.bmp.x = position.x;
            this.bmp.y = position.y;
            this.updatePosition();
        } else if (!this.detectBombCollision(position)) {
            // Only update the position if there is no wall collision
            this.bmp.x = position.x;
            this.bmp.y = position.y;
            this.updatePosition();
        }*/

        // Handle other collisions
        if (this.detectFireCollision()) {
            this.die();
        }
        this.handlePowerUpCollision();
    }

    // Helper function to snap player to the center of a tile if near the center
    snapToGrid(position, dirX, dirY) {
        const tileSize = gGameEngine.tileSize;
        const halfTile = tileSize / 2;

        // Calculate the nearest tile center
        const snapX = Math.round(position.x / tileSize) * tileSize;
        const snapY = Math.round(position.y / tileSize) * tileSize;

        // Only snap if within the tolerance range (near the tile center)
        if (dirY !== 0) {
            if (Math.abs(position.x - snapX) < halfTile) {
                position.x = snapX;
            }
        }

        if (dirX !== 0) {
            if (Math.abs(position.y - snapY) < halfTile) {
                position.y = snapY;
            }
        }

        return position;
    }

    /**
     * Calculates and updates entity position according to its actual bitmap position
     */
    updatePosition() {
        this.position = Utils.convertToEntityPosition(this.bmp);
    }

    /**
     * Returns true when collision is detected, and we should not move to target position.
     */
    detectWallCollision(position) {
        // Define the player hitbox
        const player = {
            left: position.x,
            top: position.y,
            right: position.x + gGameEngine.tileSize,
            bottom: position.y + gGameEngine.tileSize,
        };

        // Check for collision with all wall tiles
        const tiles = gGameEngine.tiles;
        for (let i = 0; i < tiles.length; i++) {
            const tile = tiles[i];

            // If the player's hitbox overlaps with a wall tile hitbox, a collision is detected
            if (this.collideTile(player, tile.position.x, tile.position.y)) {
                console.log("Detected wall collision");
                console.log(position.x, position.y, tile.position.x, tile.position.y);
                return true;
            }
        }
        return false;
    }

    collideTile(player, x, y) {
        const tileHitbox = {
            left: x * gGameEngine.tileSize,
            top: y * gGameEngine.tileSize,
            right: (x + 1) * gGameEngine.tileSize,
            bottom: (y + 1) * gGameEngine.tileSize,
        };

        // If the player's hitbox overlaps with a wall tile hitbox, a collision is detected
        if (
            player.right > tileHitbox.left &&
            player.left < tileHitbox.right &&
            player.bottom > tileHitbox.top &&
            player.top < tileHitbox.bottom
        ) {
            return true;
        }
    }

    /**
     * Returns true when the bomb collision is detected, and we should not move to target position.
     */
    detectBombCollision(position) {
        // Define the player hitbox
        const player = {
            left: position.x,
            top: position.y,
            right: position.x + gGameEngine.tileSize,
            bottom: position.y + gGameEngine.tileSize,
        };

        for (let i = 0; i < gGameEngine.bombs.length; i++) {
            var bomb = gGameEngine.bombs[i];
            // Compare bomb position
            if (this.collideTile(player, bomb.position.x, bomb.position.y)) {
            //if (bomb.position.x === position.x && bomb.position.y === position.y) {
                // Allow to escape from bomb that appeared on my field
                if (bomb === this.escapeBomb) {
                    return false;
                } else {
                    return true;
                }
            }
        }

        // I have escaped already
        if (this.escapeBomb) {
            this.escapeBomb = null;
        }

        return false;
    }

    detectFireCollision() {
        var bombs = gGameEngine.bombs;
        for (let i = 0; i < bombs.length; i++) {
            var bomb = bombs[i];
            for (let j = 0; j < bomb.fires.length; j++) {
                var fire = bomb.fires[j];
                var collision = bomb.exploded && fire.position.x === this.position.x && fire.position.y === this.position.y;
                if (collision) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Checks whether we have got bonus and applies it.
     */
    handlePowerUpCollision() {
        for (let i = 0; i < gGameEngine.powerUps.length; i++) {
            var powerUp = gGameEngine.powerUps[i];
            if (Utils.comparePositions(powerUp.position, this.position)) {
                this.applyPowerUp(powerUp);
                if (!gGameEngine.mute && gGameEngine.soundtrackPlaying) {
                    var powerUpSound = createjs.Sound.play("powerup");
                    powerUpSound.volume = 0.2;
                }
                powerUp.destroy();
            }
        }
    }

    /**
     * Applies power-up.
     */
    applyPowerUp(powerUp) {
        if (powerUp.type === PowerUp.POWER_UP_SPEED) {
            this.velocity += 0.6;
        } else if (powerUp.type === PowerUp.POWER_UP_BOMB) {
            this.bombsMax++;
        } else if (powerUp.type === PowerUp.POWER_UP_FIRE) {
            this.bombStrength++;
        }
    }

    /**
     * Changes animation if requested animation is not already current.
     */
    animate(animation) {
        if (!this.bmp.currentAnimation || this.bmp.currentAnimation.indexOf(animation) === -1) {
            this.bmp.gotoAndPlay(animation);
        }
    }

    die() {
        this.alive = false;

        gGameEngine.checkGameOver();

        // Start dead animation
        this.bmp.gotoAndPlay('dead');
        // Hides the image after some time
        this.fade();
    }

    fade() {
        var timer = 0;
        var bmp = this.bmp;
        var fade = setInterval(function() {
            timer++;

            if (timer > 20) {
                bmp.alpha = 0;
                clearInterval(fade);
            }
        }, 30);
    }
}
