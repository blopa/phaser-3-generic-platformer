/* globals IS_DEV */
/* globals STAGES */
import { Scene } from 'phaser';
import christmasTree from '../../assets/images/christmas_tree.png';
import background from '../../assets/images/background.jpg';

class SplashScene extends Scene {
    constructor() {
        super('SplashScene');
    }

    preload() {
        // load your assets
        this.load.image('christmas_tree', christmasTree);
        this.load.image('background', background);

        if (IS_DEV) {
            this.load.image('tilesetImage', 'assets/tilesets/debug_tileset.png');
        } else {
            this.load.image('tilesetImage', 'assets/tilesets/tileset.png');
        }

        // Stages
        STAGES.forEach((fileName) => {
            const key = fileName.split('.')[0];
            this.load.tilemapTiledJSON(key, `assets/stages/${fileName}.json`);
        });

        // this.load.atlas('player', 'assets/images/player.png', 'assets/atlas/player.json');
        this.load.atlas('player', 'assets/atlases/player.png', 'assets/atlases/player.json');
    }

    create() {
        this.scene.start('GameScene');
    }

    update() {
        // TODO
    }
}

export default SplashScene;
