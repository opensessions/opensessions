const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const dotenv = require('dotenv');
dotenv.config({ silent: true });
dotenv.load();

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
    new webpack.IgnorePlugin(/\.(css|less|jpg|png|gif|mp4|webm|html|eot|svg|ttf|woff|woff2)$/),
    new webpack.DefinePlugin({
      'process.env': ['NODE_ENV', 'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'AUTH0_CLIENT_DOMAIN', 'DATABASE_USER', 'DATABASE_NAME', 'DATABASE_URL', 'GOOGLE_MAPS_API_KEY', 'GOOGLE_ANALYTICS_TRACKINGID', 'INTERCOM_APPID', 'AWS_S3_IMAGES_BASEURL', 'AWS_S3_IMAGES_ACCESSKEY', 'AWS_S3_IMAGES_SECRETKEY', 'FULLSTORY_ORG', 'INSPECTLET_WID'].reduce((obj, key) => {
        obj[key] = JSON.stringify(process.env[key]);
        return obj;
      }, {})
    })
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
