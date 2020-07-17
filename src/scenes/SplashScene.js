/* globals IS_DEV */
/* globals MAPS */
import { Scene } from 'phaser';

class SplashScene extends Scene {
    constructor() {
        super('SplashScene');
    }

    preload() {
        // load your assets
        this.load.image('christmas_tree', 'assets/images/christmas_tree.png');
        this.load.image('background', 'assets/images/background.jpg');

        if (IS_DEV) {
            this.load.image('tilesetImage', 'assets/maps/tileset.png');
        } else {
            this.load.image('tilesetImage', 'assets/images/stage_tileset.png');
        }

        // Maps
        MAPS.forEach((fileName) => {
            const key = fileName.split('.')[0];
            this.load.tilemapTiledJSON(key, `assets/maps/${fileName}.json`);
        });

        // this.load.atlas('player', 'assets/images/player.png', 'assets/atlas/player.json');
        this.load.atlas('player', 'build/test1/atlas.png', 'build/test1/atlas.json');
    }

    create() {
        this.scene.start('GameScene');
    }

    update() {
        // TODO
    }
}

export default SplashScene;
