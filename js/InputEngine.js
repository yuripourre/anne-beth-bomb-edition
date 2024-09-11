InputEngine = Class.extend({
    bindings: {},
    actions: {},
    listeners: [],
    gamepads: [], // To track multiple gamepads
    joystickPolling: null,

    init: function() {},

    setup: function() {
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
    },

    onKeyDown: function(event) {
        var action = this.bindings[event.keyCode];
        if (action) {
            this.actions[action] = true;
            event.preventDefault();
        }
        return false;
    },

    onKeyUp: function(event) {
        var action = this.bindings[event.keyCode];
        if (action) {
            this.actions[action] = false;
            this.triggerListeners(action);
            event.preventDefault();
        }
        return false;
    },

    bind: function(key, action) {
        this.bindings[key] = action;
    },

    addListener: function(action, listener) {
        this.listeners[action] = this.listeners[action] || [];
        this.listeners[action].push(listener);
    },

    triggerListeners: function(action) {
        var listeners = this.listeners[action];
        if (listeners) {
            for (var i = 0; i < listeners.length; i++) {
                listeners[i]();
            }
        }
    },

    removeAllListeners: function() {
        this.listeners = [];
    },

    startPollingJoystick: function() {
        this.joystickPolling = setInterval(this.pollGamepads.bind(this), 1000 / 60); // Poll 60 times per second
    },

    stopPollingJoystick: function() {
        clearInterval(this.joystickPolling);
        this.joystickPolling = null;
    },

    pollGamepads: function() {
        const gamepads = navigator.getGamepads();

        for (let i = 0; i < gamepads.length; i++) {
            const gamepad = gamepads[i];
            if (!gamepad) continue;

            if (i === 0) {
                // Handling the first gamepad
                const threshold = 0.2;
                const leftX = gamepad.axes[0];
                const leftY = gamepad.axes[1];
                this.actions['up'] = leftY < -threshold;
                this.actions['down'] = leftY > threshold;
                this.actions['left'] = leftX < -threshold;
                this.actions['right'] = leftX > threshold;
                this.actions['bomb'] = gamepad.buttons[0].pressed; // Button 0
            } else if (i === 1) {
                // Handling the second gamepad
                const threshold = 0.2;
                const leftX2 = gamepad.axes[0];
                const leftY2 = gamepad.axes[1];
                this.actions['up2'] = leftY2 < -threshold;
                this.actions['down2'] = leftY2 > threshold;
                this.actions['left2'] = leftX2 < -threshold;
                this.actions['right2'] = leftX2 > threshold;
                this.actions['bomb2'] = gamepad.buttons[0].pressed; // Button 0
            }

            // Trigger listeners for joystick actions
            for (let action in this.actions) {
                if (this.actions[action]) {
                    this.triggerListeners(action);
                }
            }
        }
    }
});

gInputEngine = new InputEngine();
