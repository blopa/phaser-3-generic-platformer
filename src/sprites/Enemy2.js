import { GameObjects } from 'phaser';
import { isset } from '../utils/utils';

class Enemy2 extends GameObjects.Sprite {
    constructor({
        scene,
        x = 0,
        y = 0,
        enablePhysics = true,
        addToScene = true,
        asset = 'enemy2',
        frame,
    }) {
        super(scene, x, y, asset, frame);
        this.setDepth(500);
        this.setOrigin(0, 1);

        if (addToScene) {
            scene.add.existing(this);
        }

        if (enablePhysics) {
            scene.physics.add.existing(this);
        }

        this.createAnimations();
        this.setAnimation('walk');
    }

    update(time, delta) {
        // TODO
    }

    createAnimations = () => {
        const assetKey = this.texture.key;
        if (!this.scene.anims.exists(`${assetKey}_walk`)) {
            this.scene.anims.create({
                key: `${assetKey}_walk`,
                frames: this.scene.anims.generateFrameNames(assetKey, {
                    frames: [
                        'enemy2_idle_01',
                        'enemy2_idle_02',
                        'enemy2_idle_03',
                        'enemy2_idle_04',
                        'enemy2_idle_05',
                        'enemy2_idle_06',
                    ],
                }),
                frameRate: 12,
                // yoyo: true,
                repeat: -1,
            });
        }
    };

    setAnimation = (animationName) => {
        if (!isset(this.anims) || this.currentAnimationName === animationName) {
            return;
        }

        const assetKey = this.texture.key;
        const animationKey = `${assetKey}_${animationName}`;
        this.currentAnimationName = animationName;
        this.currentAnimationKey = animationKey;
        this.anims.play(animationKey);
    };

    // addSoundEffects = () => {
    //     this.heroWalking = this.scene.sound.add(
    //         'hero_walking_sfx',
    //         {
    //             loop: true,
    //             volume: 0.6,
    //         }
    //     );
    // }
}

export default Enemy2;
