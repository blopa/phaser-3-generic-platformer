import { Input, Scene } from 'phaser';
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

        this.hero = new Hero({
            scene: this,
        });
        this.hero.body.setCollideWorldBounds(true); // don't go out of the map

        // load the map
        this.mapData = createMapWithDynamicLayers(
            this,
            'dungeon_01',
            'dungeon_tileset',
            'dungeon_tileset'
        );
        const { map, dynamicLayers } = this.mapData;

        const mapGroundColliders = getTilesetCustomColliders(this, dynamicLayers.ground.layer);
        const mapElementsColliders = getTilesetCustomColliders(this, dynamicLayers.elements.layer);
        this.physics.add.collider(dynamicLayers.ground, this.hero);
        this.physics.add.collider(dynamicLayers.elements, this.hero);
        this.physics.add.collider(mapGroundColliders, this.hero);
        this.elementsCollider = this.physics.add.collider(mapElementsColliders, this.hero);

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
        // make the camera follow the hero
        this.cameras.main.startFollow(this.hero);

        // set background color, so the sky is not black
        this.cameras.main.setBackgroundColor('#ccccff');

        const dataLayer = getMapObjectLayer(map, 'data');
        dataLayer.objects.forEach((data) => {
            const { x, y, name, height, width } = data;
            if (name === 'hero') {
                this.hero.setX(
                    Math.round(x)
                );
                this.hero.setY(
                    Math.round(y) - height
                );
            }
        });
    }

    update(time, delta) {
        this.hero.update(time, delta);
        const { dynamicLayers } = this.mapData;
        Object.values(dynamicLayers).forEach((dynamicLayer) => {
            dynamicLayer.layer.properties.forEach((property) => {
                const { name, value } = property;
                if (value !== 1) {
                    if (name === 'parallaxSpeedX') {
                        dynamicLayer.setX(
                            this.cameras.main.scrollX * value
                        );
                    } else if (name === 'parallaxSpeedY') {
                        dynamicLayer.setY(
                            this.cameras.main.scrollY * value
                        );
                    }
                }
            });
        });
        // TODO
        if (this.hero.isHeroOnGround()) {
            if (Input.Keyboard.JustDown(this.hero.controlKeys.down)) {
                console.log('go down');
                this.elementsCollider.active = false;
                this.time.delayedCall(
                    200,
                    () => {
                        console.log('all normal');
                        this.elementsCollider.active = true;
                    }
                );
            }
        }
    }
}

export default GameScene;
