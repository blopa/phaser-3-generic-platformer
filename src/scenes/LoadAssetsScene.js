import { Scene } from 'phaser';
import stageSelector from '../../assets/images/stage_selector.png';
import { getGlobal } from '../utils/globals';

class LoadAssetsScene extends Scene {
    constructor() {
        super('LoadAssetsScene');
    }

    preload() {
        // load your assets
        this.load.image('stage_selector', stageSelector);

        // Tileset images
        const tilesetImages = getGlobal('GAME_TILESET_IMAGES');
        tilesetImages.forEach((fileName) => {
            const key = fileName.split('.')[0];
            this.load.image(key, `assets/tilesets/${fileName}`);
        });

        // Stages
        const stages = getGlobal('GAME_STAGES');
        stages.forEach((fileName) => {
            this.load.tilemapTiledJSON(fileName, `assets/stages/${fileName}.json`);
        });

        this.load.atlas('player', 'assets/atlases/player.png', 'assets/atlases/player.json');
    }

    create() {
        this.scene.start('MainMenuScene');
    }

    update() {
        // TODO
    }
}

export default LoadAssetsScene;
