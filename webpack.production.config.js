/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { promises: fs } = require('fs');
const WebpackFreeTexPacker = require('webpack-free-tex-packer');
const sizeOf = require('image-size');
const { extrudeTilesetToImage } = require('tile-extruder');
const packageJson = require('./package.json');

const tileWidth = 16;
const tileHeight = 16;
const spritePadding = 1;

// PATHS
const MAIN_DIR = path.resolve(__dirname, '');
const IMAGE_DIR = path.resolve(__dirname, 'assets/images');
let BUILD_PATH = path.resolve(__dirname, 'dist/build');
let DIST_PATH = path.resolve(__dirname, 'dist');
const STAGES_PATH = path.resolve(__dirname, 'assets/stages');
const TILESETS_PATH = path.resolve(__dirname, 'assets/tilesets');
const SPRITES_PATH = path.resolve(__dirname, 'assets/atlas_sprites');
const supportedImageTypes = ['png', 'jpg', 'svg', 'gif', 'webp'];
const supportedAudioTypes = ['m4a', 'mp3', 'ogg', 'opus', 'wav', 'webm'];

module.exports = async (env = {}) => {
    const isMobileBuild = env === 'mobile';
    if (isMobileBuild) {
        BUILD_PATH = path.resolve(__dirname, 'mobile/www/build');
        DIST_PATH = path.resolve(__dirname, 'mobile/www');
    }

    const stageFiles = await fs.readdir(STAGES_PATH);
    const tilesetFiles = await fs.readdir(TILESETS_PATH);
    const tilesetImageFiles = tilesetFiles
        .filter((tilesetFile) => supportedImageTypes.includes(tilesetFile.split('.')[1]));
    const spritesFolders = await fs.readdir(SPRITES_PATH);

    const texPackerPlugin = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const spritesFolder of spritesFolders) {
        // eslint-disable-next-line no-await-in-loop
        const spritesFiles = await fs.readdir(path.resolve(__dirname, `${SPRITES_PATH}/${spritesFolder}`));

        let spriteMaxHeight = 0;
        spritesFiles.forEach((spritesFile) => {
            const { height } = sizeOf(
                path.resolve(__dirname, `${SPRITES_PATH}/${spritesFolder}/${spritesFile}`)
            );

            if (height > spriteMaxHeight) {
                spriteMaxHeight = height;
            }
        });

        texPackerPlugin.push(
            new WebpackFreeTexPacker(
                // spritesFiles.map((spritesFile) =>
                //     path.resolve(__dirname, `${SPRITES_PATH}/${spritesFolder}/${spritesFile}`)),
                path.resolve(__dirname, `${SPRITES_PATH}/${spritesFolder}`),
                path.normalize('../assets/atlases'),
                {
                    height: spriteMaxHeight + (spritePadding * 2),
                    textureName: spritesFolder,
                    fixedSize: false,
                    padding: spritePadding,
                    allowRotation: false,
                    detectIdentical: true,
                    allowTrim: true,
                    exporter: 'Phaser3',
                    removeFileExtension: true,
                    prependFolderName: false,
                }
            )
        );
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const tilesetFile of tilesetImageFiles) {
        // eslint-disable-next-line no-await-in-loop
        await extrudeTilesetToImage(
            tileWidth,
            tileHeight,
            `${TILESETS_PATH}/${tilesetFile}`,
            `${DIST_PATH}/assets/tilesets/${tilesetFile}`,
            {
                margin: 0,
                spacing: 0,
            }
        );
    }

    const GAME_STAGES = JSON.stringify(
        stageFiles
            .filter((stage) => stage.split('.')[1] === 'json')
            .map((stage) => stage.split('.')[0])
    );

    // TODO we need to do this because for some reason
    // this plugin does not work with mode production
    // eslint-disable-next-line no-param-reassign
    texPackerPlugin.forEach((texPacker) => {
        // eslint-disable-next-line no-param-reassign
        texPacker.apply = function apply(compiler) {
            if (compiler.hooks && compiler.hooks.emit) {
                compiler.hooks.emit.tapAsync('WebpackFreeTexPacker', (compilation, callback) => {
                    // eslint-disable-next-line no-param-reassign
                    compilation.options.mode = 'development';
                    this.emitHookHandler(compilation, callback);
                });
                compiler.hooks.done.tap('DonePlugin', (stats) => {
                    setTimeout(() => {
                        process.exit(0);
                    });
                });
            }
        }.bind(texPacker);
    });

    return {
        entry: {
            main: path.resolve(__dirname, 'src/main.js'),
            vendor: Object.keys(
                packageJson.dependencies
            ),
        },
        mode: 'production',
        output: {
            pathinfo: true,
            path: BUILD_PATH,
            publicPath: './build/',
            filename: '[name].bundle.js',
            chunkFilename: '[name].bundle.js',
        },
        plugins: [
            ...texPackerPlugin,
            new Dotenv({
                path: './.env', // load this now instead of the ones in '.env'
            }),
            new webpack.DefinePlugin({
                IS_DEV: JSON.stringify(true),
                GAME_VERSION: JSON.stringify(packageJson.version),
                GAME_TILESET_IMAGES: JSON.stringify(tilesetImageFiles),
                GAME_TILESET_WIDTH: JSON.stringify(tileWidth),
                GAME_TILESET_HEIGHT: JSON.stringify(tileHeight),
                GAME_STAGES,
                IS_MOBILE_BUILD: JSON.stringify(isMobileBuild),
            }),
            new HtmlWebpackPlugin({
                hash: true,
                minify: {
                    collapseWhitespace: true,
                    preserveLineBreaks: false,
                },
                title: 'base-phaser-cordova-project',
                favicon: `${IMAGE_DIR}/favicon.ico`,
                template: `${MAIN_DIR}/index.html`,
                filename: `${DIST_PATH}/index.html`,
                publicPath: './build',
            }),
            new CopyWebpackPlugin({
                patterns: [{
                    from: 'assets/stages',
                    to: '../assets/stages',
                }],
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    use: ['babel-loader'],
                    include: path.join(__dirname, 'src'),
                },
                {
                    test: new RegExp(`.(${supportedImageTypes.join('|')})`),
                    use: ['file-loader'],
                },
                {
                    test: new RegExp(`.(${supportedAudioTypes.join('|')})`),
                    use: ['file-loader'],
                },
            ],
        },
        optimization: {
            noEmitOnErrors: false,
            splitChunks: {
                name: 'vendor',
                chunks: 'all',
            },
        },
    };
};
