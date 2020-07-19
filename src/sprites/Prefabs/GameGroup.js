import { GameObjects } from 'phaser';

class GameGroup extends GameObjects.Group {
    constructor({ scene, children, name }) {
        super(scene, children, { name });
        this.groupVisible = true;
    }

    setGroupVisible = (visible = true) => {
        this.groupVisible = visible;
        this.setVisible(visible);
    }

    setEquivalentY = (y) => {
        let previousY = 0;
        let newY = y;
        this.getChildren().forEach((child) => {
            // if (!child.active || !child.visible) {
            //     continue;
            // }

            if (previousY) {
                newY += Math.abs(previousY - child.y);
            } else {
                previousY = child.y;
            }

            child.setY(newY);
        });
    }

    setEquivalentX = (x) => {
        let previousX = 0;
        let newX = x;
        this.getChildren().forEach((child) => {
            // if (!child.active || !child.visible) {
            //     continue;
            // }

            if (previousX) {
                newX += Math.abs(previousX - child.x);
            } else {
                previousX = child.x;
            }

            child.setX(newX);
        });
    }

    forEach = (callback) => this.getChildren().forEach(callback)
}

export default GameGroup;
