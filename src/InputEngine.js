export class InputEngine {
    bindings = {};
    pressed = {};
    actions = {};
    listeners = [];
    gamepads = []; // To track multiple gamepads
    joystickPolling = null;

    constructor() {}

    setup() {
        // Keyboard bindings
        this.bind(38, 'up');
        this.bind(37, 'left');
        this.bind(40, 'down');
        this.bind(39, 'right');
        this.bind(32, 'bomb');
        this.bind(18, 'bomb');

        this.bind(87, 'up2');
        this.bind(65, 'left2');
        this.bind(83, 'down2');
        this.bind(68, 'right2');
        this.bind(16, 'bomb2');

        this.bind(13, 'restart');
        this.bind(27, 'escape');
        this.bind(77, 'mute');

        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        // Joystick support for two gamepads
        window.addEventListener("gamepadconnected", (event) => {
            this.gamepads[event.gamepad.index] = event.gamepad;
            console.log("Gamepad connected at index: " + event.gamepad.index);
            if (!this.joystickPolling) this.startPollingJoystick();
        });

        window.addEventListener("gamepaddisconnected", (event) => {
            console.log("Gamepad disconnected from index: " + event.gamepad.index);
            delete this.gamepads[event.gamepad.index];
            if (this.gamepads.length === 0) this.stopPollingJoystick();
        });
    }

    onKeyDown(event) {
        var action = this.bindings[event.keyCode];
        if (action) {
            this.actions[action] = true;
            event.preventDefault();
        }
        return false;
    }

    onKeyUp(event) {
        var action = this.bindings[event.keyCode];
        if (action) {
            this.actions[action] = false;
            this.triggerListeners(action);
            event.preventDefault();
        }
        return false;
    }

    bind(key, action) {
        this.bindings[key] = action;
    }

    addListener(action, listener) {
        this.listeners[action] = this.listeners[action] || [];
        this.listeners[action].push(listener);
    }

    triggerListeners(action) {
        var listeners = this.listeners[action];
        if (listeners) {
            for (var i = 0; i < listeners.length; i++) {
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

            if (i === 0) {
                // Handling the first gamepad
                this.triggerOnKeyDown('up', gamepad.buttons[12].pressed);
                this.triggerOnKeyDown('down', gamepad.buttons[13].pressed);
                this.triggerOnKeyDown('left', gamepad.buttons[14].pressed);
                this.triggerOnKeyDown('right', gamepad.buttons[15].pressed);
                this.triggerOnKeyUp('bomb', gamepad.buttons[1].pressed);
            } else if (i === 1) {
                // Handling the second gamepad
                this.triggerOnKeyDown('up2', gamepad.buttons[12].pressed);
                this.triggerOnKeyDown('down2', gamepad.buttons[13].pressed);
                this.triggerOnKeyDown('left2', gamepad.buttons[14].pressed);
                this.triggerOnKeyDown('right2', gamepad.buttons[15].pressed);
                this.triggerOnKeyUp('bomb2', gamepad.buttons[1].pressed);
            }

            // Trigger listeners for joystick actions
            for (let action in this.actions) {
                if (this.actions[action]) {
                    this.triggerListeners(action);
                }
            }
        }
    }

    triggerOnKeyDown(command, pressed) {
        this.actions[command] = pressed;
    }

    triggerOnKeyUp(command, pressed) {
        if (pressed) {
            this.pressed[command] = true;
        } else {
            this.actions[command] = this.pressed[command];
            this.pressed[command] = false;
        }
    }
}

export const gInputEngine = new InputEngine();
