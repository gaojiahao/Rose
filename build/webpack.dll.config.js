'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const pkg = require('../package')
const vuxLoader = require('vux-loader')
const vueLoaderConfig = require('./vue-loader.conf')
const vendorPackages = Object.keys(pkg.dependencies);
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
let DllWebpack = {
  entry: {
    vendor: vendorPackages.filter((item) => {
      return !item.includes('babel-runtime') && !item.includes('vux') 
    })
  },
  output: {
    path: path.join(__dirname, '../static/js'),
    filename: '[name].dll.js',
    library: '[name]_library'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
      }
    ]
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.join(__dirname, '.', '[name]-manifest.json'),
      name: '[name]_library',
      context: __dirname
    }),
    new webpack.optimize.UglifyJsPlugin({
      sourceMap: true,
      minimize: true,
      cache: true,
      parallel: true,
      compress: {
        warnings: false
      }
    })
  ]  
}

module.exports = vuxLoader.merge(DllWebpack, {
  plugins: [
    'progress-bar'
  ]
})
