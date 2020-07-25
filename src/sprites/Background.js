import { GameObjects } from 'phaser';

class Background extends GameObjects.Image {
    constructor({
        scene,
        x = 0,
        y = 0,
        asset,
        frame,
    }) {
        super(scene, x, y, asset, frame);
        this.setOrigin(0, 0);
        this.setDepth(0);
    }
}

export default Background;
