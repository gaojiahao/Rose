'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')
const vueLoaderConfig = require('./vue-loader.conf')
const vuxLoader = require('vux-loader')
const HappyPack = require('happypack') //多进程工具

const HappyPackThreadPool = HappyPack.ThreadPool({size:5})

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

let webpackConfig = {
  context: path.resolve(__dirname, '../'),
  entry: {
    app: './src/main.js'
  },
  output: {
    path: config.build.assetsRoot,
    filename: '[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      '@': resolve('src'),
      'scss': resolve('src/scss'),
      'mixins': resolve('src/mixins'),
      'assets': resolve('src/assets'),
      'service': resolve('src/service'),
      'plugins': resolve('src/plugins'),
      'msgPage': resolve('src/views/msg/pages'),
      'homePage': resolve('src/views/home/pages'),
      'components': resolve('src/components'),
      'directive': resolve('src/directive'),
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      //vue 里用了之后不编译模板,搞得我好气,我猜是因为vux里有什么bug。
      // {
      //   test: /\.vue$/,
      //   use: ['happypack/loader?id=vue'] 
      // },
      {
        test: /\.js$/,
        loader: 'happypack/loader?id=babel',
        include: [resolve('src')],
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        exclude: [resolve('src/iconfont')],
        options: {
          limit: 10000,
         // name:'[path]/../img/[name].[hash:7].[ext]'
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp3)(\?.*)?$/,
        loader: 'url-loader',
        options: {
         name: utils.assetsPath('assets/[name].[hash:7].[ext]')
        }
     }
    ]
  },//module end
  plugins: [
    // new HappyPack({
    //   id:'vue',
    //   loaders:[
    //     {
    //       loader:'vue-loader',
    //       options: vueLoaderConfig
    //     }
    //   ],
    //   threadPool:HappyPackThreadPool
    // }),
    new HappyPack({
      id: 'babel',
      loaders: ['babel-loader?cacheDirectory'],
      threadPool: HappyPackThreadPool
    })
  ]
}

/**
 * merge第二个参数是vuxConfig
 */
module.exports = vuxLoader.merge(webpackConfig, {
  plugins: [
    'vux-ui',
    'progress-bar',
    {
      name: 'duplicate-style',
      options: {
        cssProcessorOptions : {
          safe: true,
          zindex: false,
          autoprefixer: {
            add: true,
            browsers: [
              'iOS >= 7',
              'Android >= 4.1'
            ]
          }
        }
      }
    }
  ]
})
