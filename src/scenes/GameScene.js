import { Scene } from 'phaser';
import { createMapWithDynamicLayers, getMapObjectLayer, getTilesetCustomColliders } from '../utils/tilesets';
import Hero from '../sprites/Hero';
import Background from '../sprites/Background';
import { HERO_DEPTH } from '../constants/constants';

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
        this.background = new Background({
            scene: this,
            asset: 'day_background',
        });
        this.add.existing(this.background);

        this.player = new Hero({
            scene: this,
        });
        this.player.body.setBounce(0.2); // our player will bounce from items
        this.player.body.setCollideWorldBounds(true); // don't go out of the map

        // load the map
        this.mapData = createMapWithDynamicLayers(
            this,
            'city_01',
            'city_tileset',
            'city_tileset'
        );
        const { map, layers, dynamicLayers } = this.mapData;

        const mapGroundColliders = getTilesetCustomColliders(this, layers.ground);
        const mapElementsColliders = getTilesetCustomColliders(this, layers.elements);
        this.physics.add.collider(dynamicLayers.ground, this.player);
        this.physics.add.collider(dynamicLayers.elements, this.player);
        this.physics.add.collider(mapGroundColliders, this.player);
        this.physics.add.collider(mapElementsColliders, this.player);

        // Set depths
        dynamicLayers.background?.setDepth(HERO_DEPTH - 3);
        dynamicLayers.ground?.setDepth(HERO_DEPTH - 2);
        dynamicLayers.elements?.setDepth(HERO_DEPTH - 1);
        dynamicLayers.foreground?.setDepth(HERO_DEPTH + 1);
        dynamicLayers.foreground_2?.setDepth(HERO_DEPTH + 2);

        // set the boundaries of our game world
        this.physics.world.bounds.width = dynamicLayers.background.width;
        this.physics.world.bounds.height = dynamicLayers.background.height;
        this.background.setScale(
            this.physics.world.bounds.width
        );

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
        this.player.update(time, delta);
        // TODO
        const { dynamicLayers } = this.mapData;
        dynamicLayers.background.setX(
            this.cameras.main.scrollX * 0.3
        );
        dynamicLayers.foreground.setX(
            this.cameras.main.scrollX * -0.1
        );
        dynamicLayers.foreground_2.setX(
            this.cameras.main.scrollX * -0.3
        );
    }
}

export default GameScene;
