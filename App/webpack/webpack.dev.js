const common = require('./webpack.config.js')
const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
    resolve: {
      extensions: ['*', '.js', '.jsx'],
      alias: {
        actions: path.resolve(__dirname, '../src/actions/'),
        reducers: path.resolve(__dirname, '../src/reducers/')
      }
    },
    devServer: {
        historyApiFallback: true,
        https: true,
        contentBase: path.join(__dirname, '..', 'public/'),
        publicPath: 'https://localhost:1951/dist/',
        port: 1951,
        hotOnly: true
    },
    devtool: 'source-map',
    plugins: [new webpack.HotModuleReplacementPlugin()]
})
