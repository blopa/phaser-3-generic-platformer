import { Scene } from 'phaser';
import { TILESET_HEIGHT, TILESET_WIDTH } from '../constants/constants';

class GameScene extends Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        // TODO
    }

    preload() {
        // TODO
    }

    create() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.player = this.physics.add.sprite(250, 250, 'player').setDepth(500);
        this.player.setBounce(0.2); // our player will bounce from items
        this.player.setCollideWorldBounds(true); // don't go out of the map
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNames('player', {
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
        this.player.anims.play('player_idle');

        // load the map
        const map = this.make.tilemap({ key: 'city_01' });

        // tiles for the ground layer
        const groundTiles = map.addTilesetImage(
            'city_tileset',
            'city_tileset',
            TILESET_WIDTH,
            TILESET_HEIGHT,
            1,
            2
        );
        console.log({ groundTiles });
        // create the ground layer
        const backgroundLayer1 = map.createDynamicLayer('background', groundTiles, 0, 0);
        const backgroundLayer2 = map.createDynamicLayer('background2', groundTiles, 0, 0);
        const detailsLayer = map.createDynamicLayer('details', groundTiles, 0, 0);
        const detailsLayer2 = map.createDynamicLayer('details2', groundTiles, 0, 0);

        const testsLayer = map.createDynamicLayer('tests', groundTiles, 0, 0);
        this.wallGroup = this.physics.add.group();
        this.physics.add.collider(testsLayer, this.player);
        testsLayer.tilemap.layer.data.forEach((tiles) => {
            tiles.forEach((tile) => {
                const { index } = tile;
                if (index !== -1 && testsLayer.tileset[0].tileData[index - 1]) {
                    const { objectgroup } = testsLayer.tileset[0].tileData[index - 1];
                    const { objects } = objectgroup;
                    objects.forEach((objectData) => {
                        const { height, width, x, y } = objectData;
                        const properties = testsLayer.tileset[0].tileProperties[index - 1];
                        const {
                            collidesLeft,
                            collidesRight,
                            collidesUp,
                            collidesDown,
                        } = properties;
                        if (height === TILESET_HEIGHT && width === TILESET_WIDTH) {
                            tile.setCollision(collidesLeft, collidesRight, collidesUp, collidesDown);
                            return;
                        }

                        const wall = this.add.rectangle(
                            (tile.x * TILESET_WIDTH) + x,
                            (tile.y * TILESET_HEIGHT) + y,
                            width,
                            height
                        )
                            .setOrigin(0, 0)
                            .setFillStyle(0x741B47);
                        this.physics.add.existing(wall);
                        this.wallGroup.add(wall);
                        wall.body.setAllowGravity(false);
                        wall.body.setImmovable(true);
                        this.physics.add.collider(this.player, wall);
                        if (properties) {
                            wall.body.checkCollision = {
                                ...wall.body.checkCollision,
                                left: collidesLeft,
                                right: collidesRight,
                                up: collidesUp,
                                down: collidesDown,
                            };
                        }
                    });
                }
            });
        });
        // the player will collide with this layer
        // detailsLayer.setCollisionByExclusion([-1]);
        // this.physics.add.collider(detailsLayer, this.player);

        // set the boundaries of our game world
        this.physics.world.bounds.width = detailsLayer.width;
        this.physics.world.bounds.height = detailsLayer.height;

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(this.player);

        // set background color, so the sky is not black
        this.cameras.main.setBackgroundColor('#ccccff');

        const dataLayer = map.getObjectLayer('data');
        dataLayer.objects.forEach((data) => {
            const { x, y, name, height, width } = data;
            if (name === 'hero') {
                this.player.setX(
                    Math.round(x)
                );
                this.player.setY(
                    Math.round(y) - height
                );
            }
        });
    }

    update(time, delta) {
        // this.movablechristmastree.update(time, delta);
        if (this.cursors.left.isDown) {
            this.player.body.setVelocityX(-200);
        } else if (this.cursors.right.isDown) {
            this.player.body.setVelocityX(200);
        }
        if ((this.cursors.space.isDown || this.cursors.up.isDown)) {
            console.log('jump');
            this.player.body.setVelocityY(-270);
        }
    }
}

export default GameScene;
