import { GameObjects, Input } from 'phaser';
import { isset } from '../utils/utils';

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

        // Properties
        this.enablePhysics = enablePhysics;
        this.attackDuration = 300;
        this.jumpTimer = 0;
        this.runTimer = 0;
        this.stopRunTimer = 0;
        this.isAttacking = false;
        this.isRunning = false;
        this.pressedRunRight = false;
        this.pressedRunLeft = false;
        this.heroState = 'IDLE';

        if (addToScene) {
            scene.add.existing(this);
        }

        if (enablePhysics) {
            scene.physics.add.existing(this);
            this.body.setDrag(1000, 0);
            this.body.setMaxVelocity(150, 400);
            this.body.setSize(18, 28);
            this.body.setOffset(8, 4);
            this.body.setBounce(0, 0);
        }

        // this.attackFrameRate = 12;
        // this.attackDuration = 1000 / (this.attackFrameRate / 4);
        // d = 1000 / (f / 4)
        // d * (f / 4) = 1000
        // f / 4 = 1000 / d
        // (f * d) / (4 * d) = 4000 / (4 * d)
        // f * d = 4 * 1000
        // f = (4 * 1000) / d
        this.createAnimations();
        this.setAnimation('idle');

        const { LEFT, RIGHT, UP, W, A, D, SPACE } = Input.Keyboard.KeyCodes;
        this.controlKeys = scene.input.keyboard.addKeys({
            left: LEFT,
            right: RIGHT,
            up: UP,
            w: W,
            a: A,
            d: D,
            space: SPACE,
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
                frameRate: 18,
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
                        'player_attack_04',
                    ],
                }),
                // frameRate: this.attackFrameRate,
                frameRate: (5 * 1000) / this.attackDuration,
                // yoyo: true,
                repeat: 0,
            });
        }

        if (!this.scene.anims.exists(`${assetKey}_start_run`)) {
            this.scene.anims.create({
                key: `${assetKey}_start_run`,
                frames: this.scene.anims.generateFrameNames(assetKey, {
                    frames: [
                        'player_start_run_01',
                        'player_start_run_02',
                        'player_start_run_03',
                        'player_start_run_04',
                        'player_start_run_05',
                        'player_start_run_06',
                    ],
                }),
                frameRate: 12,
                repeat: 0,
            });
        }

        if (!this.scene.anims.exists(`${assetKey}_run`)) {
            this.scene.anims.create({
                key: `${assetKey}_run`,
                frames: this.scene.anims.generateFrameNames(assetKey, {
                    frames: [
                        'player_run_01',
                        'player_run_02',
                        'player_run_03',
                    ],
                }),
                frameRate: 6,
                repeat: -1,
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

    setHeroState(heroState) {
        console.log(heroState);
        this.heroState = heroState;
    }

    update(time, delta) {
        // console.log(this.heroState);
        // console.log(this.runTimer);
        // this.handleControls();
        this.handleHeroState();
        this.handleHeroMovement();
        this.handleHeroAnimation();
    }

    handleHeroState() {
        const heroOnGround = this.body.blocked.down || this.body.touching.down;
        const isRightDown = this.controlKeys.right.isDown || this.controlKeys.d.isDown;
        const isLeftDown = this.controlKeys.left.isDown || this.controlKeys.a.isDown;
        const isUpDown = this.controlKeys.up.isDown || this.controlKeys.w.isDown;
        const pressedRight = Input.Keyboard.JustDown(this.controlKeys.right);
        const pressedLeft = Input.Keyboard.JustDown(this.controlKeys.left);
        const isJumping = [
            'JUMPING_START',
            'BOOSTING_JUMP',
            'JUMPING',
            'JUMPING_START_RIGHT',
            'BOOSTING_JUMP_RIGHT',
            'JUMPING_RIGHT',
            'JUMPING_START_LEFT',
            'BOOSTING_JUMP_LEFT',
            'JUMPING_LEFT',
        ].includes(this.heroState);

        // Handle hero idle
        if (heroOnGround && !isRightDown && !isLeftDown) {
            if ([
                'RUNNING_RIGHT',
                'RUNNING_LEFT',
                'WALKING_RIGHT',
                'WALKING_LEFT',
                'FALLING',
            ].includes(this.heroState)) {
                this.setHeroState('IDLE');
                return;
            }
        }

        // Handle hero running
        if (!isJumping) {
            if (this.runTimer <= 0) {
                if (pressedRight || pressedLeft) {
                    this.pressedRunRight = pressedRight;
                    this.pressedRunLeft = pressedLeft;
                    this.runTimer = 1;
                }
            } else if (this.runTimer <= 10) {
                if (this.pressedRunRight && isRightDown && pressedRight) {
                    this.setHeroState('RUNNING_RIGHT');
                } else if (this.pressedRunLeft && isLeftDown && pressedLeft) {
                    this.setHeroState('RUNNING_LEFT');
                }
            } else {
                this.runTimer = 0;
                this.pressedRunRight = false;
                this.pressedRunLeft = false;
            }

            if (this.runTimer > 0) {
                this.runTimer += 1;
            }
        }

        const isRunning = ['RUNNING_RIGHT', 'RUNNING_LEFT'].includes(this.heroState);
        if (isRunning) {
            if (isRightDown) {
                this.setHeroState('RUNNING_RIGHT');
            } else if (isLeftDown) {
                this.setHeroState('RUNNING_LEFT');
            }
        }

        // Handle hero walking
        if (!isJumping && !isRunning) {
            if (isRightDown) {
                this.setHeroState('WALKING_RIGHT');
            } else if (isLeftDown) {
                this.setHeroState('WALKING_LEFT');
            }
        }

        // Handle hero jumping
        if (
            heroOnGround
            && (Input.Keyboard.JustDown(this.controlKeys.up) || Input.Keyboard.JustDown(this.controlKeys.w))
        ) {
            this.jumpTimer = 1;
            this.setHeroState('JUMPING_START');
        } else if (this.jumpTimer !== 0) {
            if (isUpDown) {
                this.jumpTimer += 1;
                if (this.jumpTimer > 8) {
                    // player has been holding jump for over 100 milliseconds, it's time to stop the hero
                    this.jumpTimer = 0;
                    this.setHeroState('JUMPING');
                } else if (this.jumpTimer > 7) {
                    this.setHeroState('BOOSTING_JUMP');
                }
            } else {
                this.jumpTimer = 0;
                this.setHeroState('JUMPING');
            }
        }

        if (['JUMPING_START', 'BOOSTING_JUMP', 'JUMPING'].includes(this.heroState)) {
            if (isRightDown) {
                this.setHeroState(`${this.heroState}_RIGHT`);
            } else if (isLeftDown) {
                this.setHeroState(`${this.heroState}_LEFT`);
            }
        }

        // Handle hero falling
        if (this.body.velocity.y > 0) {
            this.setHeroState('FALLING');
        }

        // handle hero attacking
        if (heroOnGround && Input.Keyboard.JustDown(this.controlKeys.space)) {
            this.setHeroState('ATTACKING_START');
        }
    }

    handleHeroMovement() {
        const { heroState } = this;
        const acceleration = this.getHeroAcceleration();
        const heroOnGround = this.body.blocked.down || this.body.touching.down;

        if (heroOnGround) {
            this.body.setVelocityY(0);
        }

        // Handle walking movement
        if (heroState === 'WALKING_RIGHT') {
            this.body.setAccelerationX(acceleration);
        } else if (heroState === 'WALKING_LEFT') {
            this.body.setAccelerationX(-acceleration);
        }

        // Handle running movement
        if (heroState === 'RUNNING_RIGHT') {
            this.body.setAccelerationX(acceleration);
        } else if (heroState === 'RUNNING_LEFT') {
            this.body.setAccelerationX(-acceleration);
        }

        // Handle jumping movement
        if ([
            'JUMPING_START',
            'BOOSTING_JUMP',
            'JUMPING_START_RIGHT',
            'BOOSTING_JUMP_RIGHT',
            'JUMPING_START_LEFT',
            'BOOSTING_JUMP_LEFT',
        ].includes(heroState)) {
            this.body.setVelocityY(-200);
        }

        if ([
            'JUMPING_RIGHT',
            'JUMPING_START_RIGHT',
            'BOOSTING_JUMP_RIGHT',
        ].includes(heroState)) {
            this.body.setAccelerationX(acceleration);
        }

        if ([
            'JUMPING_LEFT',
            'JUMPING_START_LEFT',
            'BOOSTING_JUMP_LEFT',
        ].includes(heroState)) {
            this.body.setAccelerationX(-acceleration);
        }

        // Handle idle movement
        if (heroState === 'IDLE') {
            this.body.setAccelerationX(0);
        }
    }

    handleHeroAnimation() {
        const { heroState } = this;

        // Handle walking animation
        if (heroState === 'WALKING_RIGHT') {
            this.setAnimation('walk');
            this.setFlipX(false);
            this.body.setOffset(8, 4); // TODO
        } else if (heroState === 'WALKING_LEFT') {
            this.setAnimation('walk');
            this.setFlipX(true);
            this.body.setOffset(6, 4); // TODO
        }

        // Handle running animation
        if (heroState === 'RUNNING_RIGHT') {
            this.setAnimation('run');
            this.setFlipX(false);
            this.body.setOffset(8, 4); // TODO
        } else if (heroState === 'RUNNING_LEFT') {
            this.setAnimation('run');
            this.setFlipX(true);
            this.body.setOffset(6, 4); // TODO
        }

        // Handle jumping animation
        if ([
            'JUMPING_START',
            'BOOSTING_JUMP',
            'JUMPING',
            'JUMPING_START_RIGHT',
            'BOOSTING_JUMP_RIGHT',
            'JUMPING_RIGHT',
            'JUMPING_START_LEFT',
            'BOOSTING_JUMP_LEFT',
            'JUMPING_LEFT',
        ].includes(heroState)) {
            this.setAnimation('jump');
        }

        // Handle falling animation
        if (heroState === 'FALLING') {
            this.setFrame('player_jump_05');
        }

        // Handle idle animation
        if (heroState === 'IDLE') {
            this.setAnimation('idle');
        }
    }

    getHeroAcceleration() {
        const onGround = this.body.blocked.down || this.body.touching.down;
        return onGround ? 600 : 200;
    }

    handleControls() {
        if (!this.enablePhysics) {
            return;
        }

        if (this.isAttacking) {
            // consumes any attack button to ignore it
            Input.Keyboard.JustDown(this.controlKeys.space);
            return;
        }

        if (this.runTimer > 0) {
            this.runTimer += 1;
        }

        if (this.runTimer <= 0) {
            const pressedRunRight = Input.Keyboard.JustUp(this.controlKeys.right);
            const pressedRunLeft = Input.Keyboard.JustUp(this.controlKeys.left);
            if (pressedRunRight || pressedRunLeft) {
                this.pressedRunRight = pressedRunRight;
                this.pressedRunLeft = pressedRunLeft;
                this.runTimer = 1;
            }
        } else if (this.runTimer <= 10) {
            if (this.pressedRunRight && this.controlKeys.right.isDown) {
                this.setAnimation('run');
                this.isRunning = true;
            } else if (this.pressedRunLeft && this.controlKeys.left.isDown) {
                this.setAnimation('run');
                this.isRunning = true;
            }
        } else {
            this.runTimer = 0;
            this.pressedRunRight = false;
            this.pressedRunLeft = false;
        }

        const onGround = this.body.blocked.down || this.body.touching.down;
        const acceleration = onGround ? 600 : 200;

        // Apply horizontal acceleration when left/a or right/d are applied
        if (this.controlKeys.left.isDown || this.controlKeys.a.isDown) {
            this.body.setAccelerationX(-acceleration);
            // No need to have a separate set of graphics for running to the left & to the right. Instead
            // we can just mirror the this.body.
            this.setFlipX(true);
            this.body.setOffset(6, 4);
        } else if (this.controlKeys.right.isDown || this.controlKeys.d.isDown) {
            this.body.setAccelerationX(acceleration);
            this.setFlipX(false);
            this.body.setOffset(8, 4);
        } else {
            this.body.setAccelerationX(0);
        }

        if (this.isRunning) {
            if (
                !(this.controlKeys.right.isDown)
                && !(this.controlKeys.left.isDown)
            ) {
                this.stopRunTimer += 1;
                if (this.stopRunTimer > 6) {
                    this.isRunning = false;
                    this.stopRunTimer = 0;
                }
            }

            return;
        }

        // Only allow the player to jump if they are on the ground
        let willJump = false;
        if (
            // The order here matter because we check if the button was pressed, and that consumes the button
            // this will avoid jumping right after hitting the ground
            (Input.Keyboard.JustDown(this.controlKeys.up) || Input.Keyboard.JustDown(this.controlKeys.w))
            && onGround
        ) {
            // player is on the ground, so he is allowed to start a jump
            this.jumpTimer = 1;
            this.body.setVelocityY(-200);
            this.setAnimation('jump');
            this.body.setOffset(8, 2);
            willJump = true;
        } else if (
            this.jumpTimer !== 0
            && (
                this.controlKeys.up.isDown
                || this.controlKeys.w.isDown
            )) {
            // player is no longer on the ground, but is still holding the jump key
            this.jumpTimer += 1;
            if (this.jumpTimer > 8) {
                // player has been holding jump for over 100 millliseconds, it's time to stop him
                this.jumpTimer = 0;
            } else if (this.jumpTimer > 7) {
                // player is allowed to jump higher, not yet 600 milliseconds of jumping
                this.body.setVelocityY(-200);
            }
        } else if (this.jumpTimer !== 0) {
            // reset this.jumpTimer since the player is no longer holding the jump key
            this.jumpTimer = 0;
        }

        // Update the animation/texture based on the state of the player
        if (!willJump && onGround) {
            this.body.setVelocityY(0);
            this.body.setOffset(8, 4);
            if (this.body.velocity.x !== 0) {
                this.setAnimation('walk');
            } else {
                this.setAnimation('idle');
            }
        }

        // set player falling animation
        if (this.body.velocity.y > 0) {
            this.setFrame('player_jump_05');
        }

        // handle player attacking
        if (onGround && Input.Keyboard.JustDown(this.controlKeys.space)) {
            this.setAnimation('attack');
            this.body.setVelocityX(0);
            this.isAttacking = true;
            this.scene.time.delayedCall(
                this.attackDuration,
                () => {
                    this.isAttacking = false;
                }
            );
        }
    }
}

export default Hero;
