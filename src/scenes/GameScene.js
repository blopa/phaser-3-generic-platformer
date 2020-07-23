import { Scene } from 'phaser';
import { createMapWithDynamicLayers, getMapObjectLayer, getTilesetCustomColliders } from '../utils/tilesets';
import Hero from '../sprites/Hero';

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
        this.player = new Hero({
            scene: this,
        });
        this.player.body.setBounce(0.2); // our player will bounce from items
        this.player.body.setCollideWorldBounds(true); // don't go out of the map

        // load the map
        const { map, layers, dynamicLayers } = createMapWithDynamicLayers(
            this,
            'city_03',
            'city_tileset',
            'city_tileset'
        );

        const detailsLayer = dynamicLayers.details;
        const mapCustomColliders = getTilesetCustomColliders(this, layers.details);
        this.physics.add.collider(detailsLayer, this.player);
        this.physics.add.collider(mapCustomColliders, this.player);
        // this.physics.world.addCollider(this.player, mapCustomColliders);

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
        this.player.update(time, delta);
    }
}

export default GameScene;
