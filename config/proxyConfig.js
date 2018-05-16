module.exports = {
    proxy: {
          '/H_roleplay-si': {
            target: 'https://rfd.roletask.com',
            changeOrigin: true,
            pathRewrite: {
              '^/H_roleplay-si': '/H_roleplay-si'
            }
          }
          
    }
  }
