import {gGameEngine} from "../app.js";
import {Utils} from "./Utils.js";
import {Tile} from "./Tile.js";
import {Fire} from "./Fire.js";

export class Bomb {
    /**
     * Entity position on map grid
     */
    position = {};

    /**
     * How far the fire reaches when bomb explodes
     */
    strength = 1;

    /**
     * Bitmap dimensions
     */
    size = {
        w: 28,
        h: 28
    };

    /**
     * Bitmap animation
     */
    bmp = null;

    /**
     * Timer in frames
     */
    timer = 0;

    /**
     * Max timer value in seconds
     */
    timerMax = 2.5;

    exploded = false;

    fires = [];

    explodeListener = null;

    constructor(position, strength) {
        this.strength = strength;

        var spriteSheet = new createjs.SpriteSheet({
            images: [gGameEngine.imgs['bombImg']],
            frames: {
                width: this.size.w,
                height: this.size.h,
                regX: 5,
                regY: 5
            },
            animations: {
                idle: [0, 4, "idle", 0.15]
            }
        });
        this.bmp = new createjs.Sprite(spriteSheet);
        this.bmp.gotoAndPlay('idle');

        this.position = position;

        var pixels = Utils.convertToBitmapPosition(position);
        this.bmp.x = pixels.x + this.size.w / 4;
        this.bmp.y = pixels.y + this.size.h / 4;

        this.fires = [];

        // Allow players and bots that are already on this position to escape
        var players = gGameEngine.getPlayersAndBots();
        for (let i = 0; i < players.length; i++) {
            var player = players[i];
            if (Utils.comparePositions(player.position, this.position)) {
            //if (Utils.compareTilePositions(player.position, this.position)) {
                player.escapeBomb = this;
            }
        }
    }

    update() {
        if (this.exploded) { return; }

        this.timer++;
        if (this.timer > this.timerMax * createjs.Ticker.getMeasuredFPS()) {
            this.explode();
        }
    }

    explode() {
        this.exploded = true;

        if (!gGameEngine.mute && gGameEngine.soundtrackPlaying) {
            var bombSound = createjs.Sound.play("bomb");
            bombSound.volume = 0.2;
        }

        // Fire in all directions!
        var positions = this.getDangerPositions();
        for (let i = 0; i < positions.length; i++) {
            var position = positions[i];
            this.fire(position);

            var material = gGameEngine.getTileMaterial(position);
            if (material === Tile.TILE_BLOCK) {
                var tile = gGameEngine.getTile(position);
                tile.remove();
            } else if (material === Tile.TILE_FLOOR) {
                // Explode bombs in fire
                for (let j = 0; j < gGameEngine.bombs.length; j++) {
                    var bomb = gGameEngine.bombs[j];
                    if (!bomb.exploded
                        && Utils.comparePositions(bomb.position, position)) {
                        bomb.explode();
                    }
                }
                // Destroy Power-Ups
                for (let j = 0; j < gGameEngine.powerUps.length; j++) {
                    var powerUp = gGameEngine.powerUps[j];
                    if (Utils.comparePositions(powerUp.position, position)) {
                        powerUp.destroy();
                    }
                }
            }
        }

        this.remove();
    }

    /**
     * Returns positions that are going to be covered by fire.
     */
    getDangerPositions() {
        var positions = [];
        positions.push(this.position);

        for (let i = 0; i < 4; i++) {
            var dirX;
            var dirY;
            if (i === 0) { dirX = 1; dirY = 0; }
            else if (i === 1) { dirX = -1; dirY = 0; }
            else if (i === 2) { dirX = 0; dirY = 1; }
            else if (i === 3) { dirX = 0; dirY = -1; }

            for (let j = 1; j <= this.strength; j++) {
                var explode = true;
                var last = false;

                var position = { x: this.position.x + j * dirX, y: this.position.y + j * dirY };


                var material = gGameEngine.getTileMaterial(position);
                if (material === Tile.TILE_WALL) { // One can not simply burn the wall
                    explode = false;
                    last = true;
                } else if (material === Tile.TILE_BLOCK) {
                    explode = true;
                    last = true;
                }

                if (explode) {
                    positions.push(position);
                }

                if (last) {
                    break;
                }
            }
        }

        return positions;
    }

    fire(position) {
        var fire = new Fire(position, this);
        this.fires.push(fire);
    }

    remove() {
        gGameEngine.stage.removeChild(this.bmp);
    }

    setExplodeListener(listener) {
        this.explodeListener = listener;
    }
}
