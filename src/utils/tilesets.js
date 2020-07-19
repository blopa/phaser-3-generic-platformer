/* globals IS_DEV */
import { GameObjects, Tilemaps } from 'phaser';
import { TILESET_HEIGHT, TILESET_WIDTH } from '../constants/constants';
import GameGroup from '../sprites/Prefabs/GameGroup';
import { isset } from './utils';

export const getTilesetCustomColliders = (scene, tilesetLayer) => {
    const customColliders = [];
    tilesetLayer.tilemap.layer.data.forEach((tiles) => {
        tiles.forEach((tile) => {
            const { index } = tile;
            const tilesetCustomColliders = tilesetLayer.tileset[0].tileData[index - 1];
            // check if we have a tileset on that position
            // and if it has custom colliders
            if (index !== -1 && tilesetCustomColliders) {
                const { objectgroup } = tilesetCustomColliders;
                const { objects } = objectgroup;
                objects.forEach((objectData) => {
                    const { height, width, x, y } = objectData;
                    const properties = tilesetLayer.tileset[0].tileProperties[index - 1];
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
            }
        });
    });

    return new GameGroup({
        scene,
        children: customColliders,
        name: tilesetLayer.tileset[0].name,
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
    if (isset(layerNames)) {
        layerNames.forEach((layerName) => {
            layers[layerName] = createMapDynamicLayer(map, layerName, tileset);
        });
    } else {
        map.layers.forEach((layer) => {
            layers[layer.name] = createMapDynamicLayer(map, layer.name, tileset);
        });
    }

    return {
        map,
        layers,
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
