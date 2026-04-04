const common = require('./webpack.config.js')
const { merge } = require('webpack-merge')
const CompressionPlugin = require('compression-webpack-plugin')

module.exports = merge(common, {
    mode: 'production',
    plugins: [
      new CompressionPlugin({
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.7
      }),
      new CompressionPlugin({
        algorithm: 'brotliCompress',
        compressionOptions: {
          level: 11,
        },
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.7
      })
    ]
})