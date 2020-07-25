import { GameObjects } from 'phaser';
import { BACKGROUND_DEPTH } from '../constants/constants';

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
        this.setDepth(BACKGROUND_DEPTH);
    }
}

export default Background;
