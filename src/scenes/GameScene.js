import { Scene } from 'phaser';
import {createMapWithDynamicLayers, getMapObjectLayer, getTilesetCustomColliders} from '../utils/tilesets';

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
        const { map, layers } = createMapWithDynamicLayers(
            this,
            'city_01',
            'city_tileset',
            'city_tileset'
        );
        const testsLayer = layers.tests;
        const detailsLayer = layers.details;
        const mapCustomColliders = getTilesetCustomColliders(this, testsLayer);
        this.physics.add.collider(testsLayer, this.player);
        this.physics.add.collider(mapCustomColliders, this.player);

        // set the boundaries of our game world
        this.physics.world.bounds.width = detailsLayer.width;
        this.physics.world.bounds.height = detailsLayer.height;

        // set bounds so the camera won't go outside the game world
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // make the camera follow the player
        this.cameras.main.startFollow(this.player);

        // set background color, so the sky is not black
        this.cameras.main.setBackgroundColor('#ccccff');

        const dataLayer = getMapObjectLayer(map, 'data');
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
