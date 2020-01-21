const common = require('./webpack.config.js')
const merge = require('webpack-merge')
const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
    resolve: {
      extensions: ['*', '.js', '.jsx'],
      alias: {
        actions: path.resolve(__dirname, '../src/redux/actions/'),
        models: path.resolve(__dirname, '../src/models/'),
        reducers: path.resolve(__dirname, '../src/redux/reducers/'),
        selectors: path.resolve(__dirname, '../src/redux/selectors/'),
        store: path.resolve(__dirname, '../src/redux/store/Store.js'),
        utils: path.resolve(__dirname, '../src/utils/'),
        screens: path.resolve(__dirname, '../src/screens/')
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
