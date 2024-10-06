import { gGameEngine } from "../app.js";
import { Tile } from "./Tile.js";
import { PowerUp } from "./PowerUp.js";
import { Stairs } from "./Stairs.js";
import { AlignedBot } from "./ai/AlignedBot.js";
import { RandomBot } from "./ai/RandomBot.js";

export class StoryLevelGenerator {

    static generateLevel(theme) {
        console.log("Generating level");
        StoryLevelGenerator.drawTiles();
        StoryLevelGenerator.spawnStairs();
        StoryLevelGenerator.spawnMonsters();
        StoryLevelGenerator.drawPowerUps();
    }
    
    static drawTiles() {
        for (let i = 0; i < gGameEngine.tilesY; i++) {
            for (let j = 0; j < gGameEngine.tilesX; j++) {
                if ((i === 0 || j === 0 || i === gGameEngine.tilesY - 1 || j === gGameEngine.tilesX - 1)
                    || (j % 2 === 0 && i % 2 === 0)) {
                    // Wall tiles
                    const tile = new Tile(Tile.TILE_WALL, { x: j, y: i });
                    gGameEngine.stage.addChild(tile.bmp);
                    gGameEngine.tiles.push(tile);
                } else {
                    // Grass tiles
                    const tile = new Tile(Tile.TILE_FLOOR, { x: j, y: i });
                    gGameEngine.stage.addChild(tile.bmp);

                    // Wood tiles
                    if (!(i <= 2 && j <= 2)
                        && !(i >= gGameEngine.tilesY - 3 && j >= gGameEngine.tilesX - 3)
                        && !(i <= 2 && j >= gGameEngine.tilesX - 3)
                        && !(i >= gGameEngine.tilesY - 3 && j <= 2)) {

                        // Randomize wood placement
                        if (Math.random() > 0.3) {
                            var wood = new Tile(Tile.TILE_BLOCK, { x: j, y: i });
                            gGameEngine.stage.addChild(wood.bmp);
                            gGameEngine.tiles.push(wood);
                        }
                    }
                }
            }
        }
    }

    static drawPowerUps() {
        // Cache woods tiles
        const woods = [];
        for (let i = 0; i < gGameEngine.tiles.length; i++) {
            const tile = gGameEngine.tiles[i];
            if (tile.material === Tile.TILE_BLOCK) {
                woods.push(tile);
            }
        }

        // Sort tiles randomly
        woods.sort(function () {
            return 0.5 - Math.random();
        });

        // Distribute power ups to quarters of map precisely fairly
        for (let j = 0; j < 4; j++) {
            const powerUpsCount = Math.round(woods.length * gGameEngine.powerUpsPercent * 0.01 / 4);
            let placedCount = 0;
            for (let i = 0; i < woods.length; i++) {
                if (placedCount > powerUpsCount) {
                    break;
                }

                var tile = woods[i];
                if ((j === 0 && tile.position.x < gGameEngine.tilesX / 2 && tile.position.y < gGameEngine.tilesY / 2)
                    || (j === 1 && tile.position.x < gGameEngine.tilesX / 2 && tile.position.y > gGameEngine.tilesY / 2)
                    || (j === 2 && tile.position.x > gGameEngine.tilesX / 2 && tile.position.y < gGameEngine.tilesX / 2)
                    || (j === 3 && tile.position.x > gGameEngine.tilesX / 2 && tile.position.y > gGameEngine.tilesX / 2)) {

                    var typePosition = placedCount % 3;
                    var powerUp = new PowerUp(tile.position, typePosition);
                    gGameEngine.powerUps.push(powerUp);

                    placedCount++;

                    tile.powerUp = powerUp;
                }
            }
        }
        // Move all tiles to front
        for (let i = gGameEngine.tilesX; i < gGameEngine.tiles.length; i++) {
            const tile = gGameEngine.tiles[i];
            gGameEngine.moveToFront(tile.bmp);
        }

        // Move stairs to front
        gGameEngine.moveToFront(gGameEngine.stairs.bmp);

        // Move bots to front
        for (let i = 0; i < gGameEngine.bots.length; i++) {
            const bot = gGameEngine.bots[i];
            gGameEngine.moveToFront(bot.bmp);
        }

        // Move players to front
        for (let i = 0; i < gGameEngine.players.length; i++) {
            const player = gGameEngine.players[i];
            gGameEngine.moveToFront(player.bmp);
        }
    }

    static spawnMonsters() {
        // This should change based on level
        gGameEngine.bots = [];

        const skullImg = gGameEngine.imgs['charSkullImg'];
        const darkMageImg = gGameEngine.imgs['charDarkMageImg'];
        const pumpkinImg = gGameEngine.imgs['charPumpkinImg'];

        if (gGameEngine.currentLevel == 1) {
            // Create goblin
            StoryLevelGenerator.spawnGoblin({ x: 3 + Math.floor(Math.random() * 3), y: 1 + Math.floor(Math.random() * 3) });
            //StoryLevelGenerator.spawnGoblin({ x: gGameEngine.tilesX - 6 - Math.floor(Math.random() * 3), y: gGameEngine.tilesY - 2 - Math.floor(Math.random() * 3) });
            
        } else {
            if (gGameEngine.botsCount >= 1) {
                const bot2 = new AlignedBot({ x: 1, y: gGameEngine.tilesY - 2 }, null, null, pumpkinImg);
                bot2.velocity = 1;
                gGameEngine.bots.push(bot2);
            }
    
            if (gGameEngine.botsCount >= 2) {
                const bot3 = new RandomBot({ x: gGameEngine.tilesX - 2, y: 1 }, null, null, skullImg);
                bot3.velocity = 1;
                gGameEngine.bots.push(bot3);
            }
        }
    }

    static spawnGoblin(position) {
        const goblinImg = gGameEngine.imgs['charGoblinImg'];

        if (position.x % 2 == 0 && position.y % 2 == 0) {
            position.x += 1;
        }

        const enemy = new AlignedBot(position, null, null, goblinImg);
        enemy.velocity = 1;
        gGameEngine.bots.push(enemy);

        // Remove block tile if exists
        for (let i = 0; i < gGameEngine.tiles.length; i++) {
            const tile = gGameEngine.tiles[i];
            if (tile.position.x == position.x && tile.position.y == position.y && tile.material == Tile.TILE_BLOCK) {
                gGameEngine.stage.removeChild(tile.bmp);
                gGameEngine.tiles.splice(i, 1);
                break;
            }
        }
    }

    static spawnStairs() {

        const position = { x: gGameEngine.tilesX - 6 - Math.floor(Math.random() * 3),
                     y: gGameEngine.tilesY - 2 - Math.floor(Math.random() * 3) };
                
        //gGameEngine.stairs = new Stairs(position);
        gGameEngine.stairs.create();
        gGameEngine.stairs.move(position);

        // Remove block tile if exists
        for (let i = 0; i < gGameEngine.tiles.length; i++) {
            const tile = gGameEngine.tiles[i];
            if (tile.position.x == position.x && tile.position.y == position.y && tile.material == Tile.TILE_BLOCK) {
                gGameEngine.stage.removeChild(tile.bmp);
                gGameEngine.tiles.splice(i, 1);
                break;
            }
        }

    }
}