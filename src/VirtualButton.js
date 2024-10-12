import { gGameEngine } from "./app.js";
import { gInputEngine } from "./InputEngine.js";

export class VirtualButton {

    knobRadius = 20;

    centerX = 20;
    centerY = 300;

    // Virtual button parts
    joystickBase = null;
    joystickKnob = null;

    isPressed = false;
    visible = false;
    initialized = false;

    action = null;

    constructor(centerX, centerY, action) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.action = action;
    }

    init() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        const stage = gGameEngine.stage;
        // Enable touch support on mobile devices
        createjs.Touch.enable(stage);

        this.joystickBase = new createjs.Shape();
        this.joystickBase.graphics.beginFill("#77777799").drawCircle(0, 0, this.knobRadius * 1.2);
        this.joystickBase.x = this.centerX;
        this.joystickBase.y = this.centerY;

        this.joystickKnob = new createjs.Shape();
        this.joystickKnob.graphics.beginFill("#33333399").drawCircle(0, 0, this.knobRadius);
        this.joystickKnob.x = this.centerX;
        this.joystickKnob.y = this.centerY;

        this.buttonIcon = new createjs.Bitmap("static/img/ui/bomb.png");
        this.buttonIcon.sourceRect = new createjs.Rectangle(0, 0, 32, 32);
        this.buttonIcon.x = this.centerX - gGameEngine.tileSize / 2;
        this.buttonIcon.y = this.centerY - gGameEngine.tileSize / 2;

        const actor = this;
        this.joystickKnob.on("mousedown", function(evt) {
            actor.isPressed = true;
        });

        stage.on("stagemouseup", function (evt) {
            evt.preventDefault();
            
            // Reset knob position
            if (actor.isPressed) {
                actor.processAction();
            }

            actor.isPressed = false;
        });
    }

    show() {
        this.visible = true;
        // Add to stage
        const stage = gGameEngine.stage;
        stage.addChild(this.joystickBase, this.joystickKnob, this.buttonIcon);
    }

    hide() {
        this.visible = false;
        // Remove from stage
        const stage = gGameEngine.stage;
        stage.removeChild(this.joystickBase, this.joystickKnob, this.buttonIcon);
    }

    processAction() {
        if (!this.pressed) {
            // Activate action
            gInputEngine.triggerListeners(this.action);
        }
    }
}