import { Scene } from 'phaser';

class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        this.scene.start('SplashScene');
    }
}

export default BootScene;
