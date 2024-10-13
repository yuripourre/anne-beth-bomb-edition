import {gGameEngine} from "../../app.js";
import { BomberGame } from "../BomberGame.js";
import {BaseMenu} from "./BaseMenu.js";

export class PartyMenu extends BaseMenu {
    static PARTY_SINGLE = 'single';
    static PARTY_MULTI = 'multi'

    mode = PartyMenu.PARTY_SINGLE;
    modeIndex = 0;
    modes = [PartyMenu.PARTY_SINGLE, PartyMenu.PARTY_MULTI];

    singleBgFillCommand = null;
    multiBgFillCommand = null;

    nextPressed = false;
    prevPressed = false;

    constructor() {
        super();
        gGameEngine.botsCount = 4;
        gGameEngine.playersCount = 0;

        this.showLoader();
        this.visible = true;
    }

    nextOption() {
        this.modeIndex++;
        this.modeIndex %= this.modes.length;
        this.mode = this.modes[this.modeIndex];
        this.updateModes();
    }

    prevOption() {
        this.modeIndex += this.modes.length + 1;
        this.modeIndex %= this.modes.length;
        this.mode = this.modes[this.modeIndex];
        this.updateModes();
    }

    setMode(mode) {
        if (mode === PartyMenu.PARTY_SINGLE) {
            if (gGameEngine.gameMode === BomberGame.MODE_BATTLE) {
                gGameEngine.botsCount = 3;
            }
            gGameEngine.playersCount = 1;
        } else {
            if (gGameEngine.gameMode === BomberGame.MODE_BATTLE) {
                gGameEngine.botsCount = 2;
            }
            gGameEngine.playersCount = 2;
        }

        this.hide();
        gGameEngine.playing = true;
        gGameEngine.restart();
    }

    draw(text) {
        var that = this;

        var bgImage = new createjs.Bitmap("static/img/ui/menu.jpg");
        gGameEngine.stage.addChild(bgImage);
        this.views.push(bgImage);

        // semi-transparent black background
        var bgGraphics = new createjs.Graphics().beginFill(PartyMenu.DISABLED_COLOR).drawRect(0, 0, gGameEngine.size.w, gGameEngine.size.h);
        var bg = new createjs.Shape(bgGraphics);
        gGameEngine.stage.addChild(bg);
        this.views.push(bg);

        const title = {text: 'Anne Beth', color: '#ffffff'};
        const subtext = {text: 'Bomb Edition', color: '#ff4444'};

        if (text) {
            title.text = text[0].text;
            title.color = text[0].color;

            subtext.text = text[1].text;
            subtext.color = text[1].color;
        }

        var title1 = new createjs.Text(title.text, "bold 40px Helvetica", title.color);
        var title2 = new createjs.Text(subtext.text, "bold 22px Helvetica", subtext.color);

        var titleWidth = title1.getMeasuredWidth();
        var subTitleWidth = title2.getMeasuredWidth();

        var offset = 90;

        title1.x = gGameEngine.size.w / 2 - titleWidth / 2;
        title1.y = gGameEngine.size.h / 2 - title1.getMeasuredHeight() / 2 - offset;
        gGameEngine.stage.addChild(title1);
        this.views.push(title1);

        title2.x = gGameEngine.size.w / 2 - subTitleWidth / 2;
        title2.y = gGameEngine.size.h / 2 - title2.getMeasuredHeight() / 2 - (offset - 30);
        gGameEngine.stage.addChild(title2);
        this.views.push(title2);

        // modes buttons
        var modeSize = 110;
        var modesDistance = 20;
        var modesY = title1.y + title1.getMeasuredHeight() + 40;

        // singleplayer button
        var singleX = gGameEngine.size.w / 2 - modeSize - modesDistance;
        var singleBgGraphics = new createjs.Graphics();
        this.singleBgFillCommand = singleBgGraphics.beginFill(PartyMenu.DISABLED_COLOR).command;
        singleBgGraphics.drawRect(singleX, modesY, modeSize, modeSize);

        var singleBg = new createjs.Shape(singleBgGraphics);
        gGameEngine.stage.addChild(singleBg);
        this.views.push(singleBg);
        this.setHandCursor(singleBg);
        singleBg.addEventListener('click', function() {
            that.setMode(PartyMenu.PARTY_SINGLE);
        });
        singleBg.addEventListener('mouseover', function() {
            that.mode = PartyMenu.PARTY_SINGLE;
            that.updateModes();
        });

        var singleTitle1 = new createjs.Text("single", "16px Helvetica", "#ff4444");
        var singleTitle2 = new createjs.Text("player", "16px Helvetica", "#ffffff");
        var singleTitleWidth = singleTitle1.getMeasuredWidth() + singleTitle2.getMeasuredWidth();
        var modeTitlesY = modesY + modeSize - singleTitle1.getMeasuredHeight() - 20;

        singleTitle1.x = singleX + (modeSize - singleTitleWidth) / 2;
        singleTitle1.y = modeTitlesY;

        singleTitle2.x = singleTitle1.x + singleTitle1.getMeasuredWidth();
        singleTitle2.y = singleTitle1.y;

        var multiTitle1Border = this.createBorder(singleTitle1);
        gGameEngine.stage.addChild(multiTitle1Border);
        this.views.push(multiTitle1Border);

        var multiTitle2Border = this.createBorder(singleTitle2);
        gGameEngine.stage.addChild(multiTitle2Border);
        this.views.push(multiTitle2Border);

        gGameEngine.stage.addChild(singleTitle1);
        this.views.push(singleTitle1);

        gGameEngine.stage.addChild(singleTitle2);
        this.views.push(singleTitle2);

        var iconsY = modesY + 23;
        var singleIcon = new createjs.Bitmap("static/img/chars/witch.png");
        singleIcon.sourceRect = new createjs.Rectangle(0, 0, 32, 32);
        singleIcon.x = singleX + (modeSize - 32) / 2;
        singleIcon.y = iconsY;
        gGameEngine.stage.addChild(singleIcon);
        this.views.push(singleIcon);

        // multiplayer button
        var multiX = gGameEngine.size.w / 2 + modesDistance;
        var multiBgGraphics = new createjs.Graphics();
        this.multiBgFillCommand = multiBgGraphics.beginFill(PartyMenu.DISABLED_COLOR).command;
        multiBgGraphics.drawRect(multiX, modesY, modeSize, modeSize);

        var multiBg = new createjs.Shape(multiBgGraphics);
        gGameEngine.stage.addChild(multiBg);
        this.views.push(multiBg);
        this.setHandCursor(multiBg);
        multiBg.addEventListener('click', function() {
            that.setMode(PartyMenu.PARTY_MULTI);
        });

        multiBg.addEventListener('mouseover', function() {
            that.mode = PartyMenu.PARTY_MULTI;
            that.updateModes();
        });

        var multiTitle1 = new createjs.Text("multi", "16px Helvetica", "#99cc00");
        var multiTitle2 = new createjs.Text("player", "16px Helvetica", "#ffffff");
        var multiTitleWidth = multiTitle1.getMeasuredWidth() + multiTitle2.getMeasuredWidth();

        multiTitle1.x = multiX + (modeSize - multiTitleWidth) / 2;
        multiTitle1.y = modeTitlesY;

        multiTitle2.x = multiTitle1.x + multiTitle1.getMeasuredWidth();
        multiTitle2.y = modeTitlesY;

        var multiTitle1Border = this.createBorder(multiTitle1);
        gGameEngine.stage.addChild(multiTitle1Border);
        this.views.push(multiTitle1Border);

        var multiTitle2Border = this.createBorder(multiTitle2);
        gGameEngine.stage.addChild(multiTitle2Border);
        this.views.push(multiTitle2Border);

        gGameEngine.stage.addChild(multiTitle1);
        this.views.push(multiTitle1);

        gGameEngine.stage.addChild(multiTitle2);
        this.views.push(multiTitle2);

        var multiIconPrincess = new createjs.Bitmap("static/img/chars/princess.png");
        multiIconPrincess.sourceRect = new createjs.Rectangle(0, 0, 32, 32);
        multiIconPrincess.x = multiX + (modeSize - 32) / 2 + 32 / 2 - 8;
        multiIconPrincess.y = iconsY - 4;
        gGameEngine.stage.addChild(multiIconPrincess);
        this.views.push(multiIconPrincess);

        var multiIconWitch = new createjs.Bitmap("static/img/chars/witch.png");
        multiIconWitch.sourceRect = new createjs.Rectangle(0, 0, 32, 32);
        multiIconWitch.x = multiX + (modeSize - 32) / 2 - 32 / 2 + 8;
        multiIconWitch.y = iconsY;
        gGameEngine.stage.addChild(multiIconWitch);
        this.views.push(multiIconWitch);

        this.updateModes();
    }

    updateModes() {
        // Change background color
        if (this.mode === PartyMenu.PARTY_SINGLE) {
            this.singleBgFillCommand.style = BaseMenu.HIGHLIGHT_COLOR;
            this.multiBgFillCommand.style = BaseMenu.DISABLED_COLOR;
        } else {
            this.singleBgFillCommand.style = BaseMenu.DISABLED_COLOR;
            this.multiBgFillCommand.style = BaseMenu.HIGHLIGHT_COLOR;
        }
    }

}
