'use strict'
require('./check-versions')()

process.env.NODE_ENV = 'production'
process.env.isApk = true;

const ora = require('ora')
const rm = require('rimraf')
const path = require('path')
const chalk = require('chalk')
const webpack = require('webpack')
const config = require('../config')
const webpackConfig = require('./webpack.app.conf')

const spinner = ora('打包中...')
spinner.start()

rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
  if (err) throw err
  webpack(webpackConfig, function (err, stats) {
    spinner.stop()
    if (err) throw err
    process.stdout.write(stats.toString({
      colors: true,
      modules: false,
      children: false,
      chunks: false,
      chunkModules: false
    }) + '\n\n')

    if (stats.hasErrors()) {
      console.log(chalk.red('  打包失败.\n'))
      process.exit(1)
    }

    console.log(chalk.cyan('  打包成功！.\n'))
    console.log(chalk.yellow(
      '  打包内容只适用于生成<apk>.\n'
    ))
  })
})
