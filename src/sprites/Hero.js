/* globals IS_DEV */
import { GameObjects, Input } from 'phaser';
import { isset } from '../utils/utils';

// Running
const RUNNING_RIGHT = 'RUNNING_RIGHT';
const RUNNING_LEFT = 'RUNNING_LEFT';
const RUNNING_RIGHT_START = 'RUNNING_RIGHT_START';
const RUNNING_LEFT_START = 'RUNNING_LEFT_START';

// Walking
const WALKING_RIGHT = 'WALKING_RIGHT';
const WALKING_LEFT = 'WALKING_LEFT';

// Jumping
const JUMPING_START = 'JUMPING_START';
const JUMPING = 'JUMPING';
const JUMPING_RIGHT = 'JUMPING_RIGHT';
const JUMPING_LEFT = 'JUMPING_LEFT';
const BOOSTING_JUMP = 'BOOSTING_JUMP';
const BOOSTING_JUMP_RIGHT = 'BOOSTING_JUMP_RIGHT';
const BOOSTING_JUMP_LEFT = 'BOOSTING_JUMP_LEFT';
const JUMPING_START_RIGHT = 'JUMPING_START_RIGHT';
const JUMPING_START_LEFT = 'JUMPING_START_LEFT';
const RUN_JUMPING_START = 'RUN_JUMPING_START';
const RUN_JUMPING = 'RUN_JUMPING';
const RUN_JUMPING_RIGHT = 'RUN_JUMPING_RIGHT';
const RUN_JUMPING_LEFT = 'RUN_JUMPING_LEFT';
const RUN_BOOSTING_JUMP = 'RUN_BOOSTING_JUMP';
const RUN_BOOSTING_JUMP_RIGHT = 'RUN_BOOSTING_JUMP_RIGHT';
const RUN_BOOSTING_JUMP_LEFT = 'RUN_BOOSTING_JUMP_LEFT';
const RUN_JUMPING_START_RIGHT = 'RUN_JUMPING_START_RIGHT';
const RUN_JUMPING_START_LEFT = 'RUN_JUMPING_START_LEFT';

// Falling
const FALLING = 'FALLING';
const FALLING_RIGHT = 'FALLING_RIGHT';
const FALLING_LEFT = 'FALLING_LEFT';

// Attacking
const ATTACKING_START = 'ATTACKING_START';

// Idle
const IDLE = 'IDLE';

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
        this.startRunDuration = 350;
        this.jumpTimer = 0;
        this.runTimer = 0;
        this.stopRunTimer = 0;
        this.delayStopRunning = false;
        this.pressedRunRight = false;
        this.pressedRunLeft = false;
        this.heroState = IDLE;

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

        this.createAnimations();
        this.setAnimation('idle');

        if (IS_DEV) {
            this.debugText = this.scene.add.text(0, 0, '');
            this.debugText.setDepth(700);
            this.debugText.setFontSize(12);
        }

        const {
            LEFT: left,
            RIGHT: right,
            UP: up,
            W: w,
            A: a,
            D: d,
            SPACE: space,
            F: f,
            SHIFT: shift,
            ENTER: enter,
        } = Input.Keyboard.KeyCodes;
        const {
            left: gamepadLeft,
            right: gamepadRight,
            up: gamepadUp,
            down: gamepadDown,
            A: gamepadA,
            B: gamepadB,
        } = Input.Gamepad.Gamepad;

        this.controlKeys = scene.input.keyboard.addKeys({
            left,
            right,
            up,
            w,
            a,
            d,
            space,
            f,
            shift,
            enter,
            gamepadLeft,
            gamepadRight,
            gamepadUp,
            gamepadDown,
            gamepadA,
            gamepadB,
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
                frameRate: (5 * 1000) / this.startRunDuration,
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
        if (IS_DEV && this.heroState !== heroState) {
            console.log(heroState);
            this.debugText.setText(heroState);
        }
        this.heroState = heroState;
    }

    isRightDown() {
        return this.controlKeys.right.isDown
            || this.controlKeys.d.isDown
            || this.controlKeys.gamepadRight.isDown;
    }

    isLeftDown() {
        return this.controlKeys.left.isDown
            || this.controlKeys.a.isDown
            || this.controlKeys.gamepadLeft.isDown;
    }

    isUpDown() {
        return this.controlKeys.up.isDown
            || this.controlKeys.w.isDown
            || this.controlKeys.gamepadUp.isDown;
    }

    isDownDown() {
        return this.controlKeys.down.isDown
            || this.controlKeys.s.isDown
            || this.controlKeys.gamepadDown.isDown;
    }

    isAButtonDown() {
        return this.controlKeys.space.isDown
            || this.controlKeys.gamepadA.isDown;
    }

    isBButtonDown() {
        return this.controlKeys.f.isDown
            || this.controlKeys.enter.isDown
            || this.controlKeys.gamepadB.isDown;
    }

    isRightJustDown() {
        return Input.Keyboard.JustDown(this.controlKeys.right)
            || Input.Keyboard.JustDown(this.controlKeys.d)
            || Input.Keyboard.JustDown(this.controlKeys.gamepadRight);
    }

    isLeftJustDown() {
        return Input.Keyboard.JustDown(this.controlKeys.left)
            || Input.Keyboard.JustDown(this.controlKeys.a)
            || Input.Keyboard.JustDown(this.controlKeys.gamepadLeft);
    }

    isUpJustDown() {
        return Input.Keyboard.JustDown(this.controlKeys.up)
            || Input.Keyboard.JustDown(this.controlKeys.w)
            || Input.Keyboard.JustDown(this.controlKeys.gamepadUp);
    }

    isAButtonJustDown() {
        return Input.Keyboard.JustDown(this.controlKeys.space)
            || Input.Keyboard.JustDown(this.controlKeys.gamepadA);
    }

    isBButtonJustDown() {
        return Input.Keyboard.JustDown(this.controlKeys.f)
            || Input.Keyboard.JustDown(this.controlKeys.enter)
            || Input.Keyboard.JustDown(this.controlKeys.gamepadB);
    }

    getHeroAcceleration() {
        const onGround = this.body.blocked.down || this.body.touching.down;
        return onGround ? 600 : 200;
    }

    isHeroJumping() {
        return [
            JUMPING_START,
            BOOSTING_JUMP,
            JUMPING,
            JUMPING_START_RIGHT,
            BOOSTING_JUMP_RIGHT,
            JUMPING_RIGHT,
            JUMPING_START_LEFT,
            BOOSTING_JUMP_LEFT,
            JUMPING_LEFT,
        ].includes(this.heroState);
    }

    isHeroFalling() {
        return [
            FALLING,
            FALLING_RIGHT,
            FALLING_LEFT,
        ].includes(this.heroState);
    }

    isHeroOnGround() {
        return this.body.blocked.down || this.body.touching.down;
    }

    isHeroRunning() {
        return [
            RUNNING_RIGHT,
            RUNNING_LEFT,
            RUNNING_RIGHT_START,
            RUNNING_LEFT_START,
        ].includes(this.heroState)
            || this.delayStopRunning;
    }

    update(time, delta) {
        if (IS_DEV) {
            this.debugText.setX(this.x);
            this.debugText.setY(this.y - 50);
            // console.log(this.delayStopRunning);
        }

        this.handleHeroState();
        this.handleHeroMovement();
        this.handleHeroAnimation();
    }

    handleHeroState() {
        const heroOnGround = this.isHeroOnGround();
        const isRightDown = this.isRightDown();
        const isLeftDown = this.isLeftDown();
        const isUpDown = this.isUpDown();
        const isAButtonDown = this.isAButtonDown();
        const pressedRight = this.isRightJustDown();
        const pressedLeft = this.isLeftJustDown();
        const isJumping = this.isHeroJumping();

        // Handle hero idle
        if (heroOnGround && !isRightDown && !isLeftDown && !this.delayStopRunning) {
            if (([
                RUNNING_RIGHT_START,
                RUNNING_LEFT_START,
                RUNNING_RIGHT,
                RUNNING_LEFT,
                WALKING_RIGHT,
                WALKING_LEFT,
            ].includes(this.heroState)
                || this.isHeroFalling()
            )) {
                this.setHeroState(IDLE);
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
                    this.setHeroState(RUNNING_RIGHT_START);
                    this.delayStopRunning = true;
                    this.scene.time.delayedCall(
                        this.startRunDuration,
                        () => {
                            this.setHeroState(RUNNING_RIGHT);
                        }
                    );
                } else if (this.pressedRunLeft && isLeftDown && pressedLeft) {
                    this.setHeroState(RUNNING_LEFT_START);
                    this.delayStopRunning = true;
                    this.scene.time.delayedCall(
                        this.startRunDuration,
                        () => {
                            this.setHeroState(RUNNING_LEFT);
                        }
                    );
                }
            } else {
                this.runTimer = 0;
                this.pressedRunRight = false;
                this.pressedRunLeft = false;
            }

            if (this.runTimer > 0) {
                this.runTimer += 1;
            }

            if (this.delayStopRunning) {
                if (!isRightDown && !isLeftDown) {
                    this.stopRunTimer += 1;
                    if (this.stopRunTimer > 6) {
                        this.delayStopRunning = false;
                        this.stopRunTimer = 0;
                    }
                } else if (!isLeftDown && isRightDown && this.heroState === RUNNING_LEFT) {
                    this.setHeroState(RUNNING_RIGHT);
                } else if (!isRightDown && isLeftDown && this.heroState === RUNNING_RIGHT) {
                    this.setHeroState(RUNNING_LEFT);
                }
            }
        }

        const isRunning = this.isHeroRunning();

        // Handle hero walking
        if (heroOnGround && !isJumping && !isRunning) {
            if (isRightDown) {
                this.setHeroState(WALKING_RIGHT);
            } else if (isLeftDown) {
                this.setHeroState(WALKING_LEFT);
            }
        }

        // Handle hero jumping
        if (heroOnGround && (this.isUpJustDown() || this.isAButtonJustDown())) {
            this.jumpTimer = 1;
            this.setHeroState(JUMPING_START);
        } else if (this.jumpTimer !== 0) {
            if (isUpDown || isAButtonDown) {
                this.jumpTimer += 1;
                if (this.jumpTimer > 8) {
                    // player has been holding jump for over 100 milliseconds, it's time to stop the hero
                    this.jumpTimer = 0;
                    this.setHeroState(JUMPING);
                } else if (this.jumpTimer > 7) {
                    this.setHeroState(BOOSTING_JUMP);
                }
            } else {
                this.jumpTimer = 0;
                this.setHeroState(JUMPING);
            }
        }

        // Check if it is jumping in a certain direction
        if (this.isHeroJumping()) {
            if (isRightDown) {
                // JUMPING_START_RIGHT, BOOSTING_JUMP_RIGHT, JUMPING_RIGHT
                let newHeroState = this.heroState;
                if ([JUMPING_START, BOOSTING_JUMP, JUMPING].includes(this.heroState)) {
                    newHeroState = `${this.heroState}_RIGHT`;
                } else if ([JUMPING_START_LEFT, BOOSTING_JUMP_LEFT, JUMPING_LEFT].includes(this.heroState)) {
                    const parts = this.heroState.split('_LEFT');
                    newHeroState = `${parts[0]}_RIGHT`;
                }
                this.setHeroState(newHeroState);
            } else if (isLeftDown) {
                // JUMPING_START_LEFT, BOOSTING_JUMP_LEFT, JUMPING_LEFT
                let newHeroState = this.heroState;
                if ([JUMPING_START, BOOSTING_JUMP, JUMPING].includes(this.heroState)) {
                    newHeroState = `${this.heroState}_LEFT`;
                } else if ([JUMPING_START_RIGHT, BOOSTING_JUMP_RIGHT, JUMPING_RIGHT].includes(this.heroState)) {
                    const parts = this.heroState.split('_RIGHT');
                    newHeroState = `${parts[0]}_LEFT`;
                }
                this.setHeroState(newHeroState);
            }
        }

        // Handle hero falling
        if (this.body.velocity.y > 0) {
            this.setHeroState(FALLING);
        }

        // Check if it is falling in a certain direction
        if (this.isHeroFalling()) {
            if (isRightDown) {
                // FALLING, FALLING_RIGHT
                let newHeroState = this.heroState;
                if (this.heroState === FALLING) {
                    newHeroState = `${this.heroState}_RIGHT`;
                } else if (this.heroState === FALLING_LEFT) {
                    newHeroState = FALLING_RIGHT;
                }
                this.setHeroState(newHeroState);
            } else if (isLeftDown) {
                // FALLING, FALLING_LEFT
                let newHeroState = this.heroState;
                if (this.heroState === FALLING) {
                    newHeroState = `${this.heroState}_LEFT`;
                } else if (this.heroState === FALLING_RIGHT) {
                    newHeroState = FALLING_LEFT;
                }
                this.setHeroState(newHeroState);
            }
        }

        // handle hero attacking
        if (heroOnGround && this.isBButtonJustDown()) {
            this.setHeroState(ATTACKING_START);
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
        if (heroState === WALKING_RIGHT) {
            this.body.setAccelerationX(acceleration);
        } else if (heroState === WALKING_LEFT) {
            this.body.setAccelerationX(-acceleration);
        }

        // Handle running movement
        if (heroState === RUNNING_RIGHT_START) {
            this.body.setAccelerationX(acceleration);
        } else if (heroState === RUNNING_LEFT_START) {
            this.body.setAccelerationX(-acceleration);
        }

        if (heroState === RUNNING_RIGHT) {
            this.body.setAccelerationX(acceleration);
        } else if (heroState === RUNNING_LEFT) {
            this.body.setAccelerationX(-acceleration);
        }

        // Handle jumping movement
        if ([
            JUMPING_START,
            BOOSTING_JUMP,
            JUMPING_START_RIGHT,
            BOOSTING_JUMP_RIGHT,
            JUMPING_START_LEFT,
            BOOSTING_JUMP_LEFT,
        ].includes(heroState)) {
            this.body.setVelocityY(-200);
        }

        if ([
            JUMPING_RIGHT,
            JUMPING_START_RIGHT,
            BOOSTING_JUMP_RIGHT,
        ].includes(heroState)) {
            this.body.setAccelerationX(acceleration);
        }

        if ([
            JUMPING_LEFT,
            JUMPING_START_LEFT,
            BOOSTING_JUMP_LEFT,
        ].includes(heroState)) {
            this.body.setAccelerationX(-acceleration);
        }

        // Handle idle movement
        if (heroState === IDLE) {
            this.body.setAccelerationX(0);
        }
    }

    handleHeroAnimation() {
        const { heroState } = this;

        // Handle walking animation
        if (heroState === WALKING_RIGHT) {
            this.setAnimation('walk');
            this.setFlipX(false);
            this.body.setOffset(8, 4); // TODO
        } else if (heroState === WALKING_LEFT) {
            this.setAnimation('walk');
            this.setFlipX(true);
            this.body.setOffset(6, 4); // TODO
        }

        // Handle running animation
        if (heroState === RUNNING_RIGHT_START) {
            this.setAnimation('start_run');
            this.setFlipX(false);
            this.body.setOffset(8, 4); // TODO
        } else if (heroState === RUNNING_LEFT_START) {
            this.setAnimation('start_run');
            this.setFlipX(true);
            this.body.setOffset(6, 4); // TODO
        }

        if (heroState === RUNNING_RIGHT) {
            this.setAnimation('run');
            this.setFlipX(false);
            this.body.setOffset(8, 4); // TODO
        } else if (heroState === RUNNING_LEFT) {
            this.setAnimation('run');
            this.setFlipX(true);
            this.body.setOffset(6, 4); // TODO
        }

        // Handle jumping animation
        if ([
            JUMPING_START,
            BOOSTING_JUMP,
            JUMPING,
            JUMPING_START_RIGHT,
            BOOSTING_JUMP_RIGHT,
            JUMPING_RIGHT,
            JUMPING_START_LEFT,
            BOOSTING_JUMP_LEFT,
            JUMPING_LEFT,
        ].includes(heroState)) {
            this.setAnimation('jump');
        }

        // Handle falling animation
        if (this.isHeroFalling()) {
            this.setFrame('player_jump_05');
        }

        // Handle idle animation
        if (heroState === IDLE) {
            this.setAnimation('idle');
        }
    }
}

export default Hero;
