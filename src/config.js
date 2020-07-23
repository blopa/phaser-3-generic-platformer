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
        // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/arcade-world/#configuration
        default: 'arcade',
        arcade: {
            gravity: { y: 700 },
            debug: false,
        },
    },
};
