import webpack from 'webpack';
import path from 'path';

const webpackConfig = {
  name: 'enj',
  target: 'node',
  entry: './index.js',
  output: {
    filename: "enj.js",
    path: './dist',
    libraryTarget: "commonjs"
  },
  externals: [
    /^[a-z\-0-9]+$/,
    './config.json'
  ],
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel'
    }]
  },
  plugins: [
    new webpack.BannerPlugin('#!/usr/bin/env node', {raw: true, entryOnly: true})
  ]
};

export default webpackConfig;
