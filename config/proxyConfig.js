/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-12-09 16:39:19
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2020-01-09 11:18:33
 */
// let target = 'http://cpacn2012.3322.org:1175/'   //172
let target = 'http://192.168.3.172'
// let target = 'http://192.168.3.179'
// let target = 'https://refordom.roletask.com'
// let target = 'http://192.168.3.251'
// let target = 'http://192.168.3.85'
// let target = 'http://cpacn2012.3322.org:5959/'   //173
// let target = 'https://7senses.roletask.com'

module.exports = {
    proxy: {
          '/H_roleplay-si': {
            target,
            changeOrigin: true,
            pathRewrite: {
              '^/H_roleplay-si': '/H_roleplay-si'
            }
          },
          '/account-api': {
            target,
            changeOrigin: true,
          },
          '/dist': {
            target,
            changeOrigin: true,
          },
          '/content': {
            target,
            changeOrigin: true,
          }

    }
  }
