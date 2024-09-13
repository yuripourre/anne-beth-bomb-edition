class Level {
    name = null;

    blockFile = null;
    floorFile = null;
    wallFile = null;

    blockImg = null;
    floorImg = null;
    wallImg = null;

    constructor(name, blockFile, floorFile, wallFile) {
        this.name = name;

        this.blockFile = blockFile;
        this.floorFile = floorFile;
        this.wallFile = wallFile;
    }

}