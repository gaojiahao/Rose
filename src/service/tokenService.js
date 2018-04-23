import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";
import {querystring} from 'vux'

const TOKEN_KEY = 'ROSE_LOGIN_TOKEN';

let tokenService = {
  /**
   * 清除toke
   */
  clean() {
    window.localStorage.removeItem(TOKEN_KEY);
  },
  /**
   * 获取token或者用户ID，默认获取token
   */
  getToken(key = 'key') {
    let token = this.checkLogin(key)
    if (token) {
      return new Promise((resolve, reject) => {
        resolve(token)
      })
    } else {
      return this.login()
    }
  },
  /**
   * 设置token
   */
  setToken(data) {
    window.localStorage.setItem(TOKEN_KEY, JSON.stringify({
      entityId: data.entityId,
      key: data.token,
      timestamp: +new Date()
    }));
  },
  // TODO 检查是否登录
  checkLogin(key = 'key') {
    let token = JSON.parse(window.localStorage.getItem(TOKEN_KEY)) || {}
    if (token[key]) {
      let timestamp = token.timestamp
      if (new Date() - timestamp > (12 * 3600 * 1000)) { // 设置12小时过期时间
        return ''
      }
    } else {
      return ''
    }
    return token[key]
  },
  // TODO 开发时用于获取账号的token
  login() {
    let isQYWX = navigator.userAgent.toLowerCase().match(/wxwork/) !== null; // 是否为企业微信
    if (isQYWX) {
      return this.pcLogin()
    } else {
      return this.pcLogin()
    }
  },
  // TODO PC端登录
  pcLogin() {
    return new Promise((resolve, reject) => {
        let params = {
          method: 'post',
          baseURL: '/H_roleplay-si',
          url: '/login',
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            loginModel: 1,
            password: '123456',
            userCode: 'rfd120'
          }
        }

        axios(params).then((res) => {
          let data = res.data
          this.clean()
          this.setToken({
            token: data.token,
            entityId: data.entityId
          })
          resolve(data.token)
        }).catch(function (error) {
          let data = error.response && error.response.data
          reject(error.response.data)
        });
      }
    )
  },
  // TODO 企业微信登录
  QYWXLogin() {
    return new Promise((resolve, reject) => {
      let query = querystring.parse(location.search.slice(1))
      let code = query.code || ''
      axios.get('/H_roleplay-si/wxLogin?code=' + code + '&&state=1').then((res) => {
        let data = res.data;
        this.clean();
        this.setToken({
          token: data.token,
          entityId: data.entityId
        });
      })
    })
  },
  /**
   * token 初始化
   */
  init: function (qwUserCode) {
    axios.get('/H_roleplay-si/wxLogin?code=' + qwUserCode + '&&state=1').then((response) => {
      const result = response.data;
      this.clean();
      this.setToken({
        token: result.token,
        entityId: result.entityId
      });
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