let target = 'http://cpacn2012.3322.org:5858/'   //172
// let target = 'http://cpacn2012.3322.org:5959/'   //173

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
