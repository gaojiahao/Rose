// let target = 'https://www.gofuit.com';
// let target = 'http://192.168.3.207';
let target = 'http://cpacn2012.3322.org:4456';
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