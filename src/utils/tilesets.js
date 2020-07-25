/* globals IS_DEV */
import { GameObjects, Tilemaps } from 'phaser';
import { TILESET_HEIGHT, TILESET_WIDTH } from '../constants/constants';
import GameGroup from '../sprites/Prefabs/GameGroup';
import { isset, isBoolean, getDegreeFromRadians, rotateRectangleInsideTile } from './utils';

export const getTilesetCustomColliders = (scene, tilesetLayer) => {
    const customColliders = [];
    tilesetLayer.data.forEach((tiles) => {
        tiles.forEach((tile) => {
            const { index } = tile;
            // check if we have a tileset on that position
            // and if it has custom colliders
            if (index !== -1) {
                const { properties } = tile;
                const tilesetCustomColliders = tilesetLayer.tilemapLayer.tileset[0].getTileData(index);
                if (tilesetCustomColliders) {
                    const { objectgroup } = tilesetCustomColliders;
                    const { objects } = objectgroup;
                    objects.forEach((objectData) => {
                        let { height, width, x, y } = objectData;
                        console.log(JSON.stringify({ x, y }));
                        const {
                            collidesLeft,
                            collidesRight,
                            collidesUp,
                            collidesDown,
                        } = properties;

                        // if the custom collider is the same size as the tile
                        // then we enable the normal tile collider from Phaser
                        if (height === TILESET_HEIGHT && width === TILESET_WIDTH) {
                            tile.setCollision(collidesLeft, collidesRight, collidesUp, collidesDown);
                            return;
                        }

                        const { rotation, flipX, flipY } = tile;
                        if (flipX) {
                            x = TILESET_WIDTH - (x + width);
                        }
                        if (flipY) {
                            y = TILESET_HEIGHT - (y + height);
                        }

                        const degree = getDegreeFromRadians(rotation);
                        [x, y, width, height] = rotateRectangleInsideTile(x, y, width, height, degree);

                        const customCollider = new GameObjects.Rectangle(
                            scene,
                            (tile.x * TILESET_WIDTH) + x,
                            (tile.y * TILESET_HEIGHT) + y,
                            width,
                            height
                        ).setOrigin(0, 0);

                        if (IS_DEV) {
                            customCollider.setFillStyle(0x741B47);
                        }

                        scene.physics.add.existing(customCollider);
                        customCollider.body.setAllowGravity(false);
                        customCollider.body.setImmovable(true);
                        if (properties) {
                            customCollider.body.checkCollision = {
                                ...customCollider.body.checkCollision,
                                left: collidesLeft,
                                right: collidesRight,
                                up: collidesUp,
                                down: collidesDown,
                            };
                        }

                        customColliders.push(customCollider);
                    });
                } else if (properties) {
                    const {
                        collidesLeft,
                        collidesRight,
                        collidesUp,
                        collidesDown,
                    } = properties;

                    // if the custom collider is the same size as the tile
                    // then we enable the normal tile collider from Phaser
                    if (
                        isBoolean(collidesLeft)
                        && isBoolean(collidesRight)
                        && isBoolean(collidesUp)
                        && isBoolean(collidesDown)
                    ) {
                        tile.setCollision(collidesLeft, collidesRight, collidesUp, collidesDown);
                    }
                }
            }
        });
    });

    return new GameGroup({
        scene,
        children: customColliders,
        name: tilesetLayer.name,
    });
};

export const createMapWithDynamicLayers = (
    scene,
    tilesetKey,
    tilesetName,
    tilesetImageKey,
    layerNames = []
) => {
    const map = makeTilemap(scene, tilesetKey);
    const tileset = createMapTileset(map, tilesetName, tilesetImageKey);
    const layers = [];
    const dynamicLayers = [];
    if (isset(layerNames)) {
        layerNames.forEach((layerName) => {
            const dynamicLayer = createMapDynamicLayer(map, layerName, tileset);
            layers[layerName] = dynamicLayers[layerName].tilemap.layers
                .filter((layer) => layer.name === layerName);
            dynamicLayers[layerName] = dynamicLayer;
        });
    } else {
        map.layers.forEach((layer) => {
            layers[layer.name] = layer;
            dynamicLayers[layer.name] = createMapDynamicLayer(map, layer.name, tileset);
        });
    }

    return {
        map,
        layers,
        dynamicLayers,
    };
};

export const getMapObjectLayer = (map, layerName) => map.getObjectLayer(layerName);

// same as scene.make.tilemap({ key: 'key' })
const makeTilemap = (scene, tilesetKey) => Tilemaps.ParseToTilemap(scene, tilesetKey);

const createMapDynamicLayer = (map, layerName, tileset, x = 0, y = 0) =>
    map.createDynamicLayer(layerName, tileset, x, y);

const createMapTileset = (map, tilesetName, tilesetImageKey) => map.addTilesetImage(
    tilesetName,
    tilesetImageKey,
    TILESET_WIDTH,
    TILESET_HEIGHT,
    1,
    2
);
