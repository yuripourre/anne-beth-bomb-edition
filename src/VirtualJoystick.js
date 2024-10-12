import { gGameEngine } from "./app.js";
import { gInputEngine } from "./InputEngine.js";

export class VirtualJoystick {

    radius = 50;
    knobRadius = 20;

    centerX = 20;
    centerY = 300;

    // Virtual joystick parts
    joystickBase = null;
    joystickKnob = null;

    isTouching = false;
    visible = false;
    initialized = false;

    deadZone = 0.1;

    init() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        const stage = gGameEngine.stage;
        // Enable touch support on mobile devices
        createjs.Touch.enable(stage);
        
        this.joystickBase = new createjs.Shape();
        this.joystickBase.graphics.beginFill("gray").drawCircle(0, 0, this.radius);
        this.joystickBase.x = this.centerX;
        this.joystickBase.y = this.centerY;

        this.joystickKnob = new createjs.Shape();
        this.joystickKnob.graphics.beginFill("red").drawCircle(0, 0, this.knobRadius);
        this.joystickKnob.x = this.centerX;
        this.joystickKnob.y = this.centerY;

        const actor = this;
        this.joystickKnob.on("mousedown", function(evt) {
            actor.isTouching = true;
        });

        stage.on("stagemousemove", function(evt) {
            if (!actor.visible) {
                return;
            }
            if (actor.isTouching) {
                evt.preventDefault(); // Prevent scrolling
                
                const jx = evt.stageX - actor.knobRadius * 2 - actor.knobRadius / 4;
                const jy = evt.stageY + actor.knobRadius / 2 - actor.knobRadius / 4;

                const dx = jx - actor.centerX;
                const dy = actor.centerY - jy;
                const distance = Math.sqrt(dx * dx + dy * dy);
            
                let directionX = 0;
                let directionY = 0;

                if (distance < actor.radius) {
                    actor.joystickKnob.x = jx;
                    actor.joystickKnob.y = jy;

                    directionX = dx / actor.radius;
                    directionY = dy / actor.radius;
                } else {
                    // We could use a LUT here
                    const angle = Math.atan2(dy, dx);
                    actor.joystickKnob.x = actor.centerX + actor.radius * Math.cos(angle);
                    actor.joystickKnob.y = actor.centerY - actor.radius * Math.sin(angle);

                    directionX = Math.cos(angle);
                    directionY = Math.sin(angle);
                }

                if(Math.abs(directionX) < actor.deadZone) {
                    directionX = 0;
                }

                if(Math.abs(directionY) < actor.deadZone) {
                    directionY = 0;
                }

                console.log(directionX, directionY);
                console.log("---------------------------");
                actor.processVirtualJoystick(directionX, directionY);
            }
        });

        stage.on("stagemouseup", function (evt) {
            evt.preventDefault();
            actor.isTouching = false;

            // Reset knob position
            actor.joystickKnob.x = actor.centerX;
            actor.joystickKnob.y = actor.centerY;
            actor.processVirtualJoystick(0, 0);
        });
    }

    show() {
        this.visible = true;
        // Add to stage
        const stage = gGameEngine.stage;
        stage.addChild(this.joystickBase, this.joystickKnob);
    }

    hide() {
        this.visible = false;
        // Remove from stage
        const stage = gGameEngine.stage;
        stage.removeChild(this.joystickBase, this.joystickKnob);
    }

    processVirtualJoystick(directionX, directionY) {
        gInputEngine.processVirtualJoystick(directionX, directionY);
    }
}