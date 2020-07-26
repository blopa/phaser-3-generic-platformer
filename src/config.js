/* globals IS_DEV, IS_MOBILE_BUILD */
import Phaser from 'phaser';

export default {
    type: Phaser.AUTO,
    orientation: Phaser.Scale.LANDSCAPE,
    localStorageName: 'phaser-3-generic-platformer',
    parent: 'content',
    width: 384,
    height: 216,
    scale: {
        mode: IS_MOBILE_BUILD ? Phaser.Scale.RESIZE : Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    autoRound: false,
    pixelArt: true,
    physics: {
        // https://rexrainbow.github.io/phaser3-rex-notes/docs/site/arcade-world/#configuration
        default: 'arcade',
        arcade: {
            gravity: { y: 700 },
            debug: IS_DEV,
        },
    },
};
