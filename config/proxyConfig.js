module.exports = {
    proxy: {
          '/H_roleplay-si': {
            target: 'https://rfd.roletask.com',
            changeOrigin: true,
            pathRewrite: {
              '^/H_roleplay-si': '/H_roleplay-si'
            }
          },
          '/cgi-bin':{
            target: 'https://qyapi.weixin.qq.com',
            changeOrigin: true,
            pathRewrite: {
              '^/cgi-bin': '/cgi-bin'
            }
          }
          
    }
  }
