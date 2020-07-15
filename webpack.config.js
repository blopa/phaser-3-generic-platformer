/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const webpack = require('webpack');
const Dotenv = require('dotenv-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BrowserSyncPlugin = require('browser-sync-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { promises: fs } = require('fs');
const packageJson = require('./package.json');

// PATHS
const MAIN_DIR = path.resolve(__dirname, '');
const IMAGE_DIR = path.resolve(__dirname, 'assets/images');
const BUILD_PATH = path.resolve(__dirname, 'dist/build');
const DIST_PATH = path.resolve(__dirname, 'dist');
const STAGES_PATH = path.resolve(__dirname, 'assets/stages');
const MAPS_PATH = path.resolve(__dirname, 'assets/maps');

module.exports = async (env = {}) => {
    const stageFiles = await fs.readdir(STAGES_PATH);
    const mapFiles = await fs.readdir(MAPS_PATH);
    const STAGES = JSON.stringify(
        stageFiles
            .map((stage) => stage.split('.')[0])
    );
    const MAPS = JSON.stringify(
        mapFiles
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
            new Dotenv({
                path: './local.env', // load this now instead of the ones in '.env'
            }),
            new webpack.DefinePlugin({
                CANVAS_RENDERER: JSON.stringify(true),
                WEBGL_RENDERER: JSON.stringify(true),
                IS_DEV: JSON.stringify(true),
                VERSION: JSON.stringify(packageJson.version),
                STAGES,
                MAPS,
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
                    from: 'assets',
                    to: '../assets',
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
