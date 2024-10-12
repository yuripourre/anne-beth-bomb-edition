import {VirtualJoystick} from "./VirtualJoystick.js";

export class InputEngine {

    bindings = {};
    bindingsGamepadUp = [];
    bindingsGamepadDown = [];

    pressed = {};
    actions = {};
    listeners = [];
    gamepads = []; // To track multiple gamepads
    joystickPolling = null;

    virtualJoystick = null;

    constructor() {}

    setup() {
        // This is needed to work inside itch.io
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener('keyup', this.onKeyUp.bind(this));

        // Joystick support for two gamepads
        window.addEventListener("gamepadconnected", (event) => {
            this.gamepads[event.gamepad.index] = event.gamepad;
            this.bindingsGamepadDown[event.gamepad.index] = {};
            this.bindingsGamepadUp[event.gamepad.index] = {};
            console.log("Gamepad connected at index: " + event.gamepad.index);
            if (!this.joystickPolling) this.startPollingJoystick();
        });

        window.addEventListener("gamepaddisconnected", (event) => {
            console.log("Gamepad disconnected from index: " + event.gamepad.index);
            delete this.gamepads[event.gamepad.index];
            delete this.bindingsGamepadDown[event.gamepad.index];
            delete this.bindingsGamepadUp[event.gamepad.index];
            if (this.gamepads.length === 0) this.stopPollingJoystick();
        });

        this.virtualJoystick = new VirtualJoystick();
        this.virtualJoystick.init();
    }

    onKeyDown(event) {
        const action = this.bindings[event.keyCode];
        if (action) {
            this.actions[action] = true;
            event.preventDefault();
        }
        return false;
    }

    onKeyUp(event) {
        const action = this.bindings[event.keyCode];
        // Prevents action to trigger twice
        if (action && this.actions[action]) {
            this.actions[action] = false;
            this.triggerListeners(action);
            event.preventDefault();
        }
        return false;
    }

    bindKey(key, action) {
        this.bindings[key] = action;
    }

    bindGamepadButtonDown(gamepad, key, action) {
        this.bindingsGamepadDown[gamepad] = this.bindingsGamepadDown[gamepad] || {};
        this.bindingsGamepadDown[gamepad][key] = action;
    }

    bindGamepadButtonUp(gamepad, key, action) {
        this.bindingsGamepadUp[gamepad] = this.bindingsGamepadUp[gamepad] || {};
        this.bindingsGamepadUp[gamepad][key] = action;
    }

    addListener(action, listener) {
        this.listeners[action] = this.listeners[action] || [];
        this.listeners[action].push(listener);
    }

    triggerListeners(action) {
        const listeners = this.listeners[action];
        if (listeners) {
            for (let i = 0; i < listeners.length; i++) {
                listeners[i]();
            }
        }
    }

    removeAllListeners() {
        this.listeners = [];
    }

    startPollingJoystick() {
        this.joystickPolling = setInterval(this.pollGamepads.bind(this), 1000 / 60); // Poll 60 times per second
    }

    stopPollingJoystick() {
        clearInterval(this.joystickPolling);
        this.joystickPolling = null;
    }

    pollGamepads() {
        const gamepads = navigator.getGamepads();

        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (!gamepad) continue;

            for (let button in this.bindingsGamepadDown[i]) {
                const action = this.bindingsGamepadDown[i][button];
                this.triggerOnKeyDown(gamepad.buttons[button].pressed, action);
            }

            for (let button in this.bindingsGamepadUp[i]) {
                const action = this.bindingsGamepadUp[i][button];
                this.triggerOnKeyUp(gamepad.buttons[button].pressed, action);
            }
        }
    }

    triggerOnKeyDown(pressed, action) {
        this.actions[action] = pressed;
        this.triggerListeners(action);
    }

    triggerOnKeyUp(pressed, action) {
        if (pressed) {
            this.pressed[action] = true;
        } else {
            this.actions[action] = this.pressed[action];
            this.pressed[action] = false;
            this.triggerListeners(action);
        }
    }

    processVirtualJoystick(directionX, directionY) {
        if (directionX !== 0) {
            if (directionX > 0) {
                this.actions['right'] = true;
                this.actions['left'] = false;
            } else {
                this.actions['left'] = true;
                this.actions['right'] = false;
            }
        } else {
            this.actions['right'] = false;
            this.actions['left'] = false;
        }

        if (directionY !== 0) {
            if (directionY > 0) {
                this.actions['up'] = true;
                this.actions['down'] = false;
            } else {
                this.actions['down'] = true;
                this.actions['up'] = false;
            }
        } else {
            this.actions['up'] = false;
            this.actions['down'] = false;
        }
    }

    showVirtualJoystick() {
        this.virtualJoystick.init();
        this.virtualJoystick.show();
    }
}

export const gInputEngine = new InputEngine();
