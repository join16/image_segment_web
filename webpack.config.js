'use strict';

const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const path = require('path');

const target = 'main';
const useRuntime = true;

const SRC_BASE_PATH = path.join(__dirname, 'src');
const entry = [];

if (useRuntime) entry.push('babel-regenerator-runtime');
entry.push(path.join(SRC_BASE_PATH, `${target}.js`));

module.exports = {
  entry,
  output: {
    path: path.resolve('dist'),
    filename: `main.bundle.js`
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        query: {
          presets: ['latest']
        }
      }
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  },
  devServer: {
    port: 8080,
    contentBase: SRC_BASE_PATH,
    hot: true
  },
  mode: 'development',
  plugins: [
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: true
      }
    }),
    new CopyWebpackPlugin([{
      from: 'index.html'
    }, {
      from: 'main.css'
    }], {
      context: SRC_BASE_PATH
    })
  ]
};