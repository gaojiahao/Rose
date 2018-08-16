module.exports = {
    proxy: {
          '/H_roleplay-si': {
            target: 'http://192.168.3.172',
            changeOrigin: true,
            pathRewrite: {
              '^/H_roleplay-si': '/H_roleplay-si'
            }
          },
          '/account-api': {
            target: 'http://192.168.3.172',
            changeOrigin: true,
          },
          '/dist': {
            target: 'http://192.168.3.172',
            changeOrigin: true,
          }

    }
  }
