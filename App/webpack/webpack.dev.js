const common = require('./webpack.config.js')
const { merge } = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
    devServer: {
        historyApiFallback: {
          index: 'public/index.html'
        },
        host: '0.0.0.0',
        static: {
          directory: path.join(__dirname, '..')
        },
        port: 1958,
        hot: true
    },
    devtool: 'source-map',
    plugins: [new webpack.HotModuleReplacementPlugin()]
})
