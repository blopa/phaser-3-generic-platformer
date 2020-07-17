/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { promises: fs } = require('fs');
const WebpackFreeTexPacker = require('webpack-free-tex-packer');
const packageJson = require('./package.json');

// PATHS
const MAIN_DIR = path.resolve(__dirname, '');
const IMAGE_DIR = path.resolve(__dirname, 'assets/images');
const BUILD_PATH = path.resolve(__dirname, 'dist/build');
const DIST_PATH = path.resolve(__dirname, 'dist');
const STAGES_PATH = path.resolve(__dirname, 'assets/stages');
const SPRITES_PATH = path.resolve(__dirname, 'assets/atlas_sprites');

module.exports = async (env = {}) => {
    const stageFiles = await fs.readdir(STAGES_PATH);
    const spritesFolders = await fs.readdir(SPRITES_PATH);

    const texPackerPlugin = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const spritesFolder of spritesFolders) {
        // eslint-disable-next-line no-await-in-loop
        const spritesFiles = await fs.readdir(path.resolve(__dirname, `assets/atlas_sprites/${spritesFolder}`));
        texPackerPlugin.push(
            new WebpackFreeTexPacker(
                spritesFiles.map((spritesFile) =>
                    path.resolve(__dirname, `assets/atlas_sprites/${spritesFolder}/${spritesFile}`)),
                // path.resolve(__dirname, `assets/atlas_sprites/${spritesFolder}`),
                '../assets/atlases',
                {
                    textureName: spritesFolder,
                    fixedSize: false,
                    padding: 0,
                    allowRotation: false,
                    detectIdentical: true,
                    allowTrim: true,
                    exporter: 'Phaser3',
                    removeFileExtension: true,
                    prependFolderName: true,
                }
            )
        );
    }

    const STAGES = JSON.stringify(
        stageFiles
            .filter((stage) => stage.split('.')[1] === 'json' && !stage.includes('tileset'))
            .map((stage) => stage.split('.')[0])
    );

    return {
        entry: {
            main: path.resolve(__dirname, 'src/main.js'),
            vendor: Object.keys(
                packageJson.dependencies
            ),
        },
        mode: 'development',
        output: {
            pathinfo: true,
            path: BUILD_PATH,
            publicPath: './build/',
            filename: '[name].bundle.js',
            chunkFilename: '[name].bundle.js',
        },
        watch: true,
        plugins: [
            ...texPackerPlugin,
            new Dotenv({
                path: './local.env', // load this now instead of the ones in '.env'
            }),
            new webpack.DefinePlugin({
                CANVAS_RENDERER: JSON.stringify(true),
                WEBGL_RENDERER: JSON.stringify(true),
                IS_DEV: JSON.stringify(true),
                VERSION: JSON.stringify(packageJson.version),
                STAGES,
            }),
            new HtmlWebpackPlugin({
                hash: true,
                title: 'base-phaser-cordova-project',
                favicon: `${IMAGE_DIR}/favicon.ico`,
                template: `${MAIN_DIR}/index.html`,
                filename: `${DIST_PATH}/index.html`,
                publicPath: './build',
            }),
            new BrowserSyncPlugin({
                host: process.env.IP || 'localhost',
                port: process.env.PORT || 3000,
                server: {
                    baseDir: ['./dist'],
                },
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
                    test: /\.(png|jpg|svg|gif|webp)$/,
                    use: ['file-loader'],
                },
            ],
        },
        optimization: {
            splitChunks: {
                name: 'vendor',
                chunks: 'all',
            },
        },
    };
};
