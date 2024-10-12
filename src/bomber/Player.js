import {gGameEngine} from "../app.js";
import {gInputEngine} from "../InputEngine.js";
import {Utils} from "./Utils.js";
import {PowerUp} from "./PowerUp.js";
import {Bot} from "./Bot.js";
import {Bomb} from "./Bomb.js";

export class Player {
    id = 0;

    driftVelocity = 1;

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
        if (!this.alive || gGameEngine.menu.visible) return;

        let newPos = { x: this.bmp.x, y: this.bmp.y };
        let movingX = 0;
        let movingY = 0;

        if (gInputEngine.actions[this.controls.up]) {
            movingY = -this.velocity;
        }
        if (gInputEngine.actions[this.controls.down]) {
            movingY = this.velocity;
        }
        if (gInputEngine.actions[this.controls.left]) {
            movingX = -this.velocity;
        }
        if (gInputEngine.actions[this.controls.right]) {
            movingX = this.velocity;
        }

        // Adjust animation based on movement
        this.updateAnimation(movingX, movingY);

        // Adjust position based on inputs
        newPos.x += movingX;

        let updated = false;
        if (!this.detectWallCollision(newPos) && !this.detectBombCollision(newPos)) {
            this.bmp.x = newPos.x;
            this.bmp.y = newPos.y;
            updated = true;
        } else {
            newPos.x -= movingX;
        }

        newPos.y += movingY;

        if (!this.detectWallCollision(newPos) && !this.detectBombCollision(newPos)) {
            this.bmp.x = newPos.x;
            this.bmp.y = newPos.y;
        }

        newPos = this.snapAndDrift(newPos, movingX, movingY);
        //if (updated) {
            this.updatePosition();
        //}

        if (this.detectFireCollision()) {
            this.die();
        }

        this.handlePowerUpCollision();
    }

    updateAnimation(movingX, movingY) {
        if (movingX === 0 && movingY === 0) {
            this.animate('idle');
        } else if (movingY < 0) {
            this.animate('up');
        } else if (movingY > 0) {
            this.animate('down');
        } else if (movingX < 0) {
            this.animate('left');
        } else if (movingX > 0) {
            this.animate('right');
        }
    }

    snapAndDrift(position, movingX, movingY) {
        const tileSize = gGameEngine.tileSize;
        const centerX = Math.round(position.x / tileSize) * tileSize;
        const centerY = Math.round(position.y / tileSize) * tileSize;

        const tolerance = tileSize / 3;
        const offset = this.driftVelocity / 2;

        // Drift horizontally
        if (Math.abs(position.x - centerX) < tolerance) {
            if (position.x < centerX) {
                position.x += offset; // Apply gentle drift right
            } else if (position.x > centerX) {
                position.x -= offset; // Apply gentle drift left
            }
        }

        // Drift vertically
        if (Math.abs(position.y - centerY) < tolerance) {
            if (position.y < centerY) {
                position.y += offset; // Apply gentle drift down
            } else if (position.y > centerY) {
                position.y -= offset; // Apply gentle drift up
            }
        }

        return position;
    }

    updatePosition() {
        this.position = Utils.convertToEntityPosition(this.bmp);
    }

    detectWallCollision(position) {
        const player = {
            x: position.x + 2,
            y: position.y + 2,
            width: this.size.w - 4,
            height: this.size.h - 4,
        };

        const tiles = gGameEngine.tiles;
        for (let tile of tiles) {
            if (this.collideTile(player, tile.position.x, tile.position.y)) {
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

        return (
            player.x + player.width > tileHitbox.left &&
            player.x < tileHitbox.right &&
            player.y + player.height > tileHitbox.top &&
            player.y < tileHitbox.bottom
        );
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
