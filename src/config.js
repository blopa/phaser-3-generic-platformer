/* globals IS_DEV */
import Phaser from 'phaser';

export default {
    type: Phaser.AUTO,
    localStorageName: 'base-phaser-cordova-project',
    parent: 'content',
    width: 384,
    height: 216,
    scale: {
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    autoRound: false,
    pixelArt: true,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            enableBody: true,
            debug: false,
        },
    },
};
