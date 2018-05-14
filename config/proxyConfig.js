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
          },
          '/weather_mini':{
            target: 'http://wthrcdn.etouch.cn',
            changeOrigin: true,
            pathRewrite: {
              '^/weather_mini': '/weather_mini'
            }

          }
          
    }
  }
