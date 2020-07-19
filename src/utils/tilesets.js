/* globals IS_DEV */
import { Geom } from 'phaser';
import { TILESET_HEIGHT, TILESET_WIDTH } from '../constants/constants';
import GameGroup from "../sprites/Prefabs/GameGroup";

export const getTilesetCustomColliders = (tilesetLayer, scene) => {
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

                    const customCollider = new Geom.Rectangle(
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
