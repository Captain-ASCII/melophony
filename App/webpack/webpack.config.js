const path = require('path')

module.exports = {
  entry: './src/index.tsx',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader'
          }
        ]
      },
      {
        enforce: 'pre',
        test: '/.js$/',
        loader: 'source-map-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css'],
    alias: {
      '@public': path.resolve(__dirname, '../public/'),
      '@components': path.resolve(__dirname, '../src/components/'),
      '@models': path.resolve(__dirname, '../src/models/'),
      '@index': path.resolve(__dirname, '../src/index.tsx'),
      '@utils': path.resolve(__dirname, '../src/utils/'),
      '@screens': path.resolve(__dirname, '../src/screens/'),
      '@providers': path.resolve(__dirname, '../src/providers/'),

      '@actions': path.resolve(__dirname, '../src/redux/actions/'),
      '@reducers': path.resolve(__dirname, '../src/redux/reducers/'),
      '@selectors': path.resolve(__dirname, '../src/redux/selectors/'),
      '@store': path.resolve(__dirname, '../src/redux/store/Store.ts'),
    }
  },
  output: {
    path: path.resolve(__dirname, '..', 'public'),
    publicPath: '/',
    filename: 'bundle.js',
    library: {
      name: 'Melophony',
      type: 'var'
    }
  }
}
