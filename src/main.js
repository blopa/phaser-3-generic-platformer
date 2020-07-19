/* globals IS_DEV */
import { Game as PhaserGame } from 'phaser';

import BootScene from './scenes/BootScene';
import LoadAssetsScene from './scenes/LoadAssetsScene';
import GameScene from './scenes/GameScene';
import MainMenuScene from './scenes/MainMenuScene';

import config from './config';

const gameConfig = Object.assign(config, {
    scene: [
        BootScene,
        LoadAssetsScene,
        GameScene,
        MainMenuScene,
    ],
});

class Game extends PhaserGame {
    constructor() {
        super(gameConfig);
    }
}

const phaserGame = new Game();

if (IS_DEV) {
    window.PHASER_GAME = phaserGame;
}
