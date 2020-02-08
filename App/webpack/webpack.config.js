const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env'] }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx'],
    alias: {
      public: path.resolve(__dirname, '../public/'),
      actions: path.resolve(__dirname, '../src/redux/actions/'),
      components: path.resolve(__dirname, '../src/components/'),
      models: path.resolve(__dirname, '../src/models/'),
      reducers: path.resolve(__dirname, '../src/redux/reducers/'),
      selectors: path.resolve(__dirname, '../src/redux/selectors/'),
      store: path.resolve(__dirname, '../src/redux/store/Store.js'),
      utils: path.resolve(__dirname, '../src/utils/'),
      screens: path.resolve(__dirname, '../src/screens/')
    }
  },
  output: {
    path: path.resolve(__dirname, '..', 'public'),
    publicPath: '/',
    filename: 'bundle.js'
  }
}
