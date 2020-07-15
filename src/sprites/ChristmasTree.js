import { GameObjects } from 'phaser';

class ChristmasTree extends GameObjects.Sprite {
    constructor({ scene, x, y, asset, frame }) {
        super(scene, x, y, asset, frame);
        this.setDepth(1);
    }
}

export default ChristmasTree;
