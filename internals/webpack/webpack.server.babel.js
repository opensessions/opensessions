const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

/* eslint-disable */
const nodeModuleNames = () => (
  fs.readdirSync(path.join(process.cwd(), 'node_modules'))
    .filter((i) => i !== '.bin')
    .reduce((memo, item) => {
      memo[item] = `commonjs ${item}`;
      return memo;
    }, {})
);

/* eslint-enable */
module.exports = {
  target: 'node',
  cache: false,
  context: __dirname,
  debug: true,
  devtool: 'sourcemap',
  entry: {
    server: path.join(process.cwd(), 'server', 'index.js'),
  },
  output: {
    path: path.join(process.cwd(), 'lib'),
    filename: 'server.js',
  },
  externals: {
    ...nodeModuleNames(),
  },
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less|jpg|png|gif|mp4|webm|html|eot|svg|ttf|woff|woff2)$/)
    /* new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      }
    }) */
  ],
  node: {
    __dirname: true,
    __filename: true,
    process: true,
  },
  resolve: {
    modulesDirectories: ['app', 'node_modules'],
    extensions: [
      '',
      '.js',
      '.jsx',
      '.react.js',
    ],
    packageMains: [
      'jsnext:main',
      'main',
    ],
  },
  module: {
    loaders: [{
      test: /\.js$/, // Transform all .js files required somewhere with Babel
      loader: 'babel',
      exclude: /node_modules/,
      query: { presets: ['react-hmre'] },
    }, {
      test: /\.json$/,
      loader: 'json',
    }],
  },
};
