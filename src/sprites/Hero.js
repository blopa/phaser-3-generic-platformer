import { GameObjects, Input } from 'phaser';
import { handleSpriteMovement, isset } from '../utils/utils';

class Hero extends GameObjects.Sprite {
    constructor({
        scene,
        x = 0,
        y = 0,
        enablePhysics = true,
        addToScene = true,
        asset = 'player',
        frame,
    }) {
        super(scene, x, y, asset, frame);
        this.setDepth(500);
        this.setOrigin(0, 1);
        this.enablePhysics = enablePhysics;

        Object.assign(this, {
            handleSpriteMovement,
        });

        if (addToScene) {
            scene.add.existing(this);
        }

        if (enablePhysics) {
            scene.physics.add.existing(this);
            this.body.setDrag(1000, 0);
            this.body.setMaxVelocity(150, 400);
        }

        this.createAnimations();
        this.setAnimation('idle');

        const { LEFT, RIGHT, UP, W, A, D } = Input.Keyboard.KeyCodes;
        this.controlKeys = scene.input.keyboard.addKeys({
            left: LEFT,
            right: RIGHT,
            up: UP,
            w: W,
            a: A,
            d: D,
        });
    }

    createAnimations = () => {
        const assetKey = this.texture.key;
        if (!this.scene.anims.exists(`${assetKey}_idle`)) {
            this.scene.anims.create({
                key: `${assetKey}_idle`,
                frames: this.scene.anims.generateFrameNames(assetKey, {
                    frames: [
                        'player_idle_01',
                        'player_idle_02',
                        'player_idle_03',
                        'player_idle_04',
                        'player_idle_05',
                        'player_idle_06',
                    ],
                }),
                frameRate: 12,
                // yoyo: true,
                repeat: -1,
            });
        }

        if (!this.scene.anims.exists(`${assetKey}_walk`)) {
            this.scene.anims.create({
                key: `${assetKey}_walk`,
                frames: this.scene.anims.generateFrameNames(assetKey, {
                    frames: [
                        'player_walk_01',
                        'player_walk_02',
                        'player_walk_03',
                        'player_walk_04',
                        'player_walk_05',
                        'player_walk_06',
                        'player_walk_07',
                        'player_walk_08',
                        'player_walk_09',
                        'player_walk_10',
                        'player_walk_11',
                        'player_walk_12',
                        'player_walk_13',
                        'player_walk_14',
                    ],
                }),
                frameRate: 28,
                // yoyo: true,
                repeat: -1,
            });
        }

        if (!this.scene.anims.exists(`${assetKey}_jump`)) {
            this.scene.anims.create({
                key: `${assetKey}_jump`,
                frames: this.scene.anims.generateFrameNames(assetKey, {
                    frames: [
                        'player_jump_01',
                        'player_jump_02',
                        'player_jump_03',
                        'player_jump_04',
                        'player_jump_05',
                        'player_jump_06',
                    ],
                }),
                frameRate: 12,
                // yoyo: true,
                repeat: 0,
            });
        }

        if (!this.scene.anims.exists(`${assetKey}_attack`)) {
            this.scene.anims.create({
                key: `${assetKey}_attack`,
                frames: this.scene.anims.generateFrameNames(assetKey, {
                    frames: [
                        'player_attack_01',
                        'player_attack_02',
                        'player_attack_03',
                        'player_attack_04',
                    ],
                }),
                frameRate: 12,
                // yoyo: true,
                repeat: 0,
            });
        }
    };

    setAnimation = (animationName, ignoreIfPlaying = true) => {
        if (!isset(this.anims) || this.currentAnimationName === animationName) {
            return;
        }

        const assetKey = this.texture.key;
        const animationKey = `${assetKey}_${animationName}`;
        this.currentAnimationName = animationName;
        this.currentAnimationKey = animationKey;
        this.anims.play(animationKey, ignoreIfPlaying);
    };

    update(time, delta) {
        if (!this.enablePhysics) {
            return;
        }

        const onGround = this.body.blocked.down || this.body.touching.down;
        const acceleration = onGround ? 600 : 200;

        // Apply horizontal acceleration when left/a or right/d are applied
        if (this.controlKeys.left.isDown || this.controlKeys.a.isDown) {
            this.body.setAccelerationX(-acceleration);
            // No need to have a separate set of graphics for running to the left & to the right. Instead
            // we can just mirror the this.body.
            this.setFlipX(true);
        } else if (this.controlKeys.right.isDown || this.controlKeys.d.isDown) {
            this.body.setAccelerationX(acceleration);
            this.setFlipX(false);
        } else {
            this.body.setAccelerationX(0);
        }

        // Only allow the player to jump if they are on the ground
        let willJump = false;
        if (
            onGround
            && (
                Input.Keyboard.JustDown(this.controlKeys.up)
                || Input.Keyboard.JustDown(this.controlKeys.w)
            )) {
            this.body.setVelocityY(-200);
            this.setAnimation('jump');
            willJump = true;
        }

        // Update the animation/texture based on the state of the player
        if (!willJump && onGround) {
            if (this.body.velocity.x !== 0) {
                this.setAnimation('walk');
            } else {
                this.setAnimation('idle');
            }
        }
    }
}

export default Hero;
