const common = require('./webpack.config.js')
const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
    devServer: {
        historyApiFallback: true,
        https: true,
        contentBase: path.join(__dirname, '..', 'public/'),
        publicPath: 'https://localhost:1951/',
        port: 1951,
        hotOnly: true
    },
    devtool: 'source-map',
    plugins: [new webpack.HotModuleReplacementPlugin()]
})
