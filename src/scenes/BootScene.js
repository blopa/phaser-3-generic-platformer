import { Scene } from 'phaser';

class BootScene extends Scene {
    constructor() {
        super('BootScene');
    }

    create() {
        this.scene.start('LoadAssetsScene');
    }
}

export default BootScene;
