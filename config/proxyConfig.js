// let target = 'http://cpacn2012.3322.org:1175/'   //172
// let target = 'http://192.168.3.172'
let target = 'http://192.168.3.175'
// let target = 'https://refordom.roletask.com'
// let target = 'http://192.168.3.177'
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
          }

    }
  }
