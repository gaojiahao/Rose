// let target = 'http://192.168.3.172/'
let target = 'https://refordom.roletask.com/'
// let target = 'http://cpacn2012.3322.org:1175/'   //175

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
