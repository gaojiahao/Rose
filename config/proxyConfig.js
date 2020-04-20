let target = 'http://160.roletask.com';
// let target = 'http://cpacn2012.3322.org:4456';
module.exports = {
    proxy: {
          '/H_roleplay-si': {
            target,
            changeOrigin: true,
            pathRewrite: {
              '^/H_roleplay-si': '/H_roleplay-si'
            }
          },
    }
  }