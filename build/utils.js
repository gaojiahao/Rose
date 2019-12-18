'use strict'
const path = require('path')
const config = require('../config')
//const MiniCssExtractPlugin = require('mini-css-extract-plugin');//当前webpack版本不兼容
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const pkg = require('../package.json')

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  var postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }
  var vueStyleLoader = {
    loader:'vue-style-loader',
    options:{
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        publicPath: '../../',// /static/css/ 回到www目录，然后再进入static
        fallback: 'vue-style-loader'
      })
    } else {
      return [vueStyleLoader].concat(loaders)
    }
  }
  //sass全局引用
  function resolveResource(name) {
    return path.resolve(__dirname, '../src/scss/' + name);
  }
  function generateSassResourceLoader() {
    var loaders = [
      cssLoader,
      'sass-loader',
      {
        loader: 'sass-resources-loader',
        options: {
          // 多个文件时用数组的形式传入，单个文件时可以直接使用 path.resolve(__dirname, '../static/style/common.scss'
          resources: [resolveResource('base.scss')],
          publicPath:'./'  
        }
      }
      ];
      if (options.extract) {
        return ExtractTextPlugin.extract({
          use: loaders,
          publicPath:'../../', //css文件中要在static前面添加的路径，这个配置会覆盖前面output的publicPath.
          fallback: 'vue-style-loader'
        })
        // loaders.unshift({
        //   loader: MiniCssExtractPlugin.loader,
        //   options: {
        //     // you can specify a publicPath here
        //     // by default it uses publicPath in webpackOptions.output
        //     publicPath: '../../',
        //     hmr: process.env.NODE_ENV === 'development',
        //   },
        // });
      } else {
        return [vueStyleLoader].concat(loaders)
      }
    }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    // sass: generateLoaders('sass', { indentedSyntax: true }),
    // scss: generateLoaders('sass'),
    sass: generateSassResourceLoader(),
    scss: generateSassResourceLoader(),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)
  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

exports.createNotifierCallback = function () {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') {
      return
    }
    const error = errors[0]

    const filename = error.file && error.file.split('!').pop()
    notifier.notify({
      title: pkg.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}
