const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        'main': './src/index.js',
    },
    devtool: false, // Don't use 'eval', causes performance issue with fractal functions
    output: {
        filename: '[name].[contenthash].js',
        path: path.resolve(__dirname, './dist'),
        publicPath: '',
    },
    // mode: 'production',  // mode is defined by --node-env flag in webpack command
    module: {
        rules: [
            {
                test: /\.css$/,
                use: getCssLoaders(),
            },
            {
                test: /\.scss$/,
                use: getSassLoaders(),
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader : 'babel-loader', // @babel/core
                    options: {
                        presets: [ '@babel/env' ], // @babel/preset-env
                        plugins: [ '@babel/plugin-proposal-class-properties' ],
                    }
                }
            },
        ]
    },
    plugins: getPlugins(),
}

/**
 * isProductionEnv
 * @returns {boolean}
 */
function isProductionEnv()
{
    return 'production' === process.env.NODE_ENV;
}

/**
 * getSassLoaders
 * @returns {string[]}
 */
function getSassLoaders()
{
    const loaders = getCssLoaders();

    loaders.push('sass-loader');

    return loaders;
}

/**
 * getCssLoaders
 * @returns {string[]}
 */
function getCssLoaders()
{
    return [
        isProductionEnv() ? MiniCssExtractPlugin.loader : 'style-loader',
        'css-loader',
    ]
}

/**
 * getPlugins
 * @returns {object[]}
 */
function getPlugins()
{
    const plugins = [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: 'Fractal',
            template: 'src/index.html',
        }),
    ];

    if (isProductionEnv()) {

        plugins.push(new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
        }))
    }

    return plugins;
}
