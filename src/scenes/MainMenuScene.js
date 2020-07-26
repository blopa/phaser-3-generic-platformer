import { Scene } from 'phaser';

class MainMenuScene extends Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        this.scene.start('GameScene');
    }
}

export default MainMenuScene;
