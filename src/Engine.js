import {gGameEngine} from "./app.js";

export class Engine {
    size = {};
    fps = 50;

    stage = null;

    // Loaded Sprites
    imgs = [];

    // Sounds
    playing = false;
    mute = false;
    soundtrackLoaded = false;
    soundtrackPlaying = false;
    soundtrack = null;

    load() {
        // Init canvas
        this.stage = new createjs.Stage("game-canvas");
        this.stage.enableMouseOver();
        // Prevent default on mouse click (necessary if canvas is inside an iframe)
        this.stage.preventSelection = false;

        const that = this;

        addEventListener("fullscreenchange", (event) => {
            // On Exit Full Screen
            if (document.fullscreenElement == null) {
                that.stage.scaleX = 1;
                that.stage.scaleY = 1;

                that.stage.width = this.size.w;
                that.stage.height = this.size.h;
            } else {
                // browser viewport size
                const w = window.innerWidth;
                const h = window.innerHeight;

                // stage dimensions
                const ow = this.size.w;
                const oh = this.size.h;

                // keep aspect ratio
                const scale = Math.min(w / ow, h / oh);

                // adjust canvas size
                that.stage.width = ow * scale;
                that.stage.height = oh * scale;
            }
        });
    }

    setup() {
        // Start game loop
        if (!createjs.Ticker.hasEventListener('tick')) {
            createjs.Ticker.addEventListener('tick', gGameEngine.update);
            createjs.Ticker.framerate = this.fps;
        }
    }

    update() {
        // Canvas
        gGameEngine.stage.update();
    }

    toggleSound() {
        if (gGameEngine.mute) {
            gGameEngine.mute = false;
            gGameEngine.soundtrack.paused = false;
            gGameEngine.soundtrack.muted = false;
        } else {
            gGameEngine.mute = true;
            gGameEngine.soundtrack.paused = true;
            gGameEngine.soundtrack.muted = true;
        }
    }

    playSoundtrack() {
        if (!gGameEngine.soundtrackPlaying) {
            gGameEngine.soundtrack = createjs.Sound.play("game", {loop: -1});
            gGameEngine.soundtrack.volume = 1;
            gGameEngine.soundtrackPlaying = true;
        }
    }
}
