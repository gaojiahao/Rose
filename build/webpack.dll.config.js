'use strict'
const path = require('path')
const webpack = require('webpack')
const pkg = require('../package')
const vuxLoader = require('vux-loader')
const vueLoaderConfig = require('./vue-loader.conf')
const vendorPackages = Object.keys(pkg.dependencies);

let DllWebpack = {
  entry: {
    vendor: vendorPackages.filter((item) => {
      return item != ('babel-runtime') && item != ('vux') 
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
