import {gGameEngine} from "../../app.js";
import {gInputEngine} from "../../InputEngine.js";

export class BaseMenu {
    static HIGHLIGHT_COLOR = "rgba(255, 255, 255, 0.3)";
    static DISABLED_COLOR = "rgba(0, 0, 0, 0.5)";

    visible = false;

    constructor() {
        this.views = [];
    }

    show(text) {
        this.visible = true;

        this.draw(text);
    }

    hide() {
        this.visible = false;

        for (let i = 0; i < this.views.length; i++) {
            gGameEngine.stage.removeChild(this.views[i]);
        }

        this.views = [];
    }

    draw(text) {}

    update() {
        if (this.visible) {
            for (let i = 0; i < this.views.length; i++) {
                gGameEngine.moveToFront(this.views[i]);
            }

            if (gInputEngine.actions['confirm']) {
                this.setMode(this.mode);
                this.nextPressed = true;
            }
            // Throttling
            if (this.nextPressed) {
                if (!gInputEngine.actions['right']) {
                    // Release the button
                    this.nextPressed = false;
                }
            } else if (gInputEngine.actions['right']) {
                this.nextPressed = true;
                this.nextOption();
            }

            if (this.prevPressed) {
                if (!gInputEngine.actions['left']) {
                    // Release the button
                    this.prevPressed = false;
                }
            } else if (gInputEngine.actions['left']) {
                this.prevPressed = true;
                this.prevOption();
            }
        }
    }

    setHandCursor(btn) {
        btn.addEventListener('mouseover', function() {
            document.body.style.cursor = 'pointer';
        });
        btn.addEventListener('mouseout', function() {
            document.body.style.cursor = 'auto';
        });
    }

    showLoader() {
        var bgGraphics = new createjs.Graphics().beginFill("#000000").drawRect(0, 0, gGameEngine.size.w, gGameEngine.size.h);
        var bg = new createjs.Shape(bgGraphics);
        gGameEngine.stage.addChild(bg);

        var loadingText = new createjs.Text("Loading...", "20px Helvetica", "#FFFFFF");
        loadingText.x = gGameEngine.size.w / 2 - loadingText.getMeasuredWidth() / 2;
        loadingText.y = gGameEngine.size.h / 2 - loadingText.getMeasuredHeight() / 2;
        gGameEngine.stage.addChild(loadingText);
        gGameEngine.stage.update();
    }

    createBorder(textElement) {
        const shadowColor = "#000000";
        var border = new createjs.Text(textElement.text, textElement.font, shadowColor);
        border.outline = 2;
        border.x = textElement.x;
        border.y = textElement.y;

        return border;
    }
}