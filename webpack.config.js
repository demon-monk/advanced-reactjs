const path = require('path');

module.exports = {
  entry: ['babel-polyfill', path.join(__dirname, 'lib', 'components', 'Index.js')],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        use: 'babel-loader',
        exclude: /node_modules/,
        test: /\.js$/
      }
    ]
  }
};
