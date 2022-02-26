const common = require('./webpack.config.js')
const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
    devServer: {
        historyApiFallback: {
          index: 'public/index.html'
        },
        host: '0.0.0.0',
        contentBase: path.join(__dirname, '..'),
        publicPath: 'http://0.0.0.0:1958/public',
        port: 1958,
        hotOnly: true
    },
    devtool: 'source-map',
    plugins: [new webpack.HotModuleReplacementPlugin()]
})
