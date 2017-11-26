const path = require('path');
const webpack = require('webpack');
module.exports = {
  resolve: {
    modules: [
      path.resolve('./lib'),
      path.resolve('./node_modules')
    ]
  },
  entry: {
    vendor: [
      'babel-polyfill',
      'react',
      'react-dom',
      'prop-types',
      'axios',
      'lodash.debounce',
      'lodash.pickby',
    ],
    app: ['./lib/renderers/dom.js']
  },
  // entry: ['babel-polyfill', path.join(__dirname, 'lib', 'renderers', 'dom.js')],
  output: {
    path: path.join(__dirname, 'public'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        exclude: /node_modules/,
        test: /\.js$/
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
    })
  ]
};
