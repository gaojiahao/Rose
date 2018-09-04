let target = 'http://192.168.3.172'   //172
// let target = 'http://192.168.3.173'   //173

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
