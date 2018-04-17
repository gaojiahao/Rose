import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";

const TOKEN_KEY = 'ROSE_LOGIN_TOKEN';

let tokenService = {
  /**
   * 清除toke
   */
  clean() {
    window.localStorage.removeItem(TOKEN_KEY);
  },
  /**
   * 获取token
   */
  getToken() {
    return this.pcLogin()
  },
  /**
   * 设置企业微信token
   */
  setWeixinToken(token) {
    window.localStorage.setItem('weixin_token', token);
  },
  /**
   * 设置token
   */
  setToken(token) {
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify({
      key: token,
      timestamp: +new Date()
    }));
  },
  // TODO 检查是否登录
  checkLogin() {
    let token = JSON.parse(window.localStorage.getItem(TOKEN_KEY)) || {}
    if (token.key) {
      let timestamp = token.timestamp
      if (new Date() - timestamp > (12 * 3600 * 1000)) { // 设置12小时过期时间
        return ''
      }
    } else {
      return ''
    }
    return token.key
  },
  // TODO 开发时用于获取账号的token
  pcLogin() {
    return new Promise((resolve, reject) => {
        let token = this.checkLogin()
        if (token) {
          resolve(token)
        } else {
          let params = {
            method: 'post',
            baseURL: '/H_roleplay-si',
            url: '/login',
            headers: {
              'Content-Type': 'application/json',
            },
            data: {
              loginModel: 1,
              password: 'rfd120',
              userCode: 'rfd120'
            }
          }

          axios(params).then((res) => {
            let data = res.data
            this.clean()
            this.setToken(data.token)
            resolve(data.token)
          }).catch(function (error) {
            let data = error.response && error.response.data
            reject(error.response.data)
          });
        }
      }
    )
  },
  /**
   * token 初始化
   */
  init: function (qwUserCode) {
    axios.get('/H_roleplay-si/wxLogin?code=' + qwUserCode + '&&state=1').then((response) => {
      const result = response.data;
      this.clean();
      this.setToken(result.token);
    })

    // axios.get('https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ww082959ae67224850&corpsecret=Cd4Vgugvfpi21NEweNXXL0WZO-CjM1Kx5dNMWqnAeMA')
    //   .then((response) => {
    //     const result = response.data;
    //     this.clean();
    //     this.setToken(result.token);
    //   })
  }
}
export default tokenService;