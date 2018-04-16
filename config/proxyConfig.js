module.exports = {
    proxy: {
          '/H_roleplay-si': {
            target: 'http://192.168.3.160',
            changeOrigin: true,
            pathRewrite: {
              '^/H_roleplay-si': '/H_roleplay-si'
            }
          },
    }
  }