const common = require('./webpack.config.js')
const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
    devServer: {
        historyApiFallback: true,
        // https: true,
        contentBase: path.join(__dirname, '..', 'public/'),
        publicPath: 'http://localhost:1958/',
        port: 1958,
        hotOnly: true
    },
    devtool: 'source-map',
    plugins: [new webpack.HotModuleReplacementPlugin()]
})
