const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals');

const production = process.env.NODE_ENV === 'production';

module.exports = {
  target: 'node',
  node: {
    __filename: true,
    __dirname: true,
  },
  externals: [nodeExternals()],
  entry: [
    'babel-polyfill',
    path.join(__dirname, './src/index.js'),
  ],
  output: {
    path: path.join(__dirname, './build/'),
    filename: 'index.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: { compact: production },
          },
        ],
      },
    ],
  },
  devtool: production ? false : 'cheap-module-eval-source-map',
  watch: !production,
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      output: { comments: false },
      compress: { warnings: false },
    }),
    new webpack.NamedModulesPlugin(),
  ],
  resolve: {
    extensions: ['.js'],
    modules: ['node_modules'],
  },
};
