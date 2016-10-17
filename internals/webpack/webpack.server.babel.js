const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const cssnext = require('postcss-cssnext');
const postcssFocus = require('postcss-focus');
const postcssReporter = require('postcss-reporter');
const postcssImport = require('postcss-partial-import');
const postcssNested = require('postcss-nested');
const postcssLost = require('lost');

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
  devtool: 'source-map',
  entry: {
    server: path.join(process.cwd(), 'server/src', 'server.js'),
  },
  output: {
    path: path.join(process.cwd(), 'server/lib'),
    filename: 'server.js',
    library: 'server',
    libraryTarget: 'commonjs2'
  },
  externals: {
    ...nodeModuleNames(),
  },
  plugins: [
    new webpack.IgnorePlugin(/\.(less|jpg|png|gif|mp4|webm|html|eot|svg|ttf|woff|woff2)$/),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      window: '({})',
      document: '({})'
    })
  ],
  postcss: () => ([
    postcssImport(),
    postcssNested(),
    postcssFocus(), // Add a :focus to every :hover
    cssnext({ // Allow future CSS features to be used, also auto-prefixes the CSS...
      browsers: ['last 2 versions', 'IE > 10'], // ...based on this browser list
    }),
    postcssLost(),
    postcssReporter({ // Posts messages from plugins to the terminal
      clearMessages: true,
    })
  ]),
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
      // query: { presets: ['react-hmre'] },
    }, {
      test: /\.css$/,
      exclude: /node_modules/,
      // loader: 'style-loader!css-loader?localIdentName=[local]--[hash:base64:5]&modules&importLoaders=1!postcss-loader',
      loader: 'css-loader?modules&importLoaders=1!postcss-loader'
      // loader: ExtractTextPlugin.extract({
      //   fallbackLoader: 'style-loader',
      // }),
    }, {
      // Do not transform vendor's CSS with CSS-modules
      // The point is that they remain in global scope.
      // Since we require these CSS files in our JS or CSS files,
      // they will be a part of our compilation either way.
      // So, no need for ExtractTextPlugin here.
      test: /\.css$/,
      include: /node_modules/,
      loaders: ['style-loader', 'css-loader'],
    }, {
      test: /\.json$/,
      loader: 'json',
    }],
  },
};
