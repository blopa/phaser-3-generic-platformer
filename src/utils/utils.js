import { TILESET_HEIGHT, TILESET_WIDTH } from '../constants/constants';

export const isObjectEmpty = (obj) =>
    obj !== null
    && typeof obj === 'object'
    // https://stackoverflow.com/a/32108184/4307769
    && Object.keys(obj).length === 0
    && obj.constructor === Object;

export const isset = (...args) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const arg of args) {
        if (
            isObjectEmpty(arg)
            || arg === undefined
            || arg === null
            || (Array.isArray(arg) && !arg.length)
        ) {
            return false;
        }
    }

    return true;
};

export const getDegreeFromRadians = (radians) => (radians * (180 / Math.PI));

export const getRadiansFromDegree = (degree) => (degree * (Math.PI / 180));

export const isBoolean = (val) => typeof val === 'boolean';

export const rotateRectangleInsideTile = (x, y, width, height, degree) => {
    switch (degree) {
        case 90: {
            return [
                TILESET_HEIGHT - (y + height),
                x,
                height,
                width,
            ];
        }

        case 180: {
            return [
                TILESET_WIDTH - (x + width),
                TILESET_HEIGHT - (y + height),
                width,
                height,
            ];
        }

        case 270: {
            return [
                y,
                TILESET_WIDTH - (x + width),
                height,
                width,
            ];
        }

        default: {
            return [x, y, width, height];
        }
    }
};

/**
 * @this Phaser.GameObject.Sprite
 */
function onDragEvent(pointer, x, y) {
    this.setX(x);
    this.setY(y);
}

/**
 * @this Phaser.GameObject.Sprite
 */
function onDragStartEvent() {
    this.setScale(this.scale + 1);
}

/**
 * @this Phaser.GameObject.Sprite
 */
function onDragEndEvent() {
    this.setScale(this.scale - 1);
}

/**
 * @this Phaser.GameObject.Sprite
 */
export function setSpriteDraggable() {
    this.setInteractive();

    this.scene.input.dragDistanceThreshold = 5;
    this.scene.input.setDraggable(this);
    this.on('dragstart', this::onDragStartEvent);
    this.on('drag', this::onDragEvent);
    this.on('dragend', this::onDragEndEvent);
}

/**
 * @this Phaser.GameObject.Sprite
 */
export function handleSpriteMovement() {
    const cursors = this.scene.input.keyboard.createCursorKeys();
    const velocity = 3;

    if (cursors.left.isDown) {
        this.setX(this.x - velocity);
    } else if (cursors.right.isDown) {
        this.setX(this.x + velocity);
    } else if (cursors.up.isDown) {
        this.setY(this.y - velocity);
    } else if (cursors.down.isDown) {
        this.setY(this.y + velocity);
    }
}
