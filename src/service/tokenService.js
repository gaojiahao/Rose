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
    let token = this.checkLogin(key);
    if (token) {
      return new Promise((resolve, reject) => {
        resolve(token)
      })
    } else {
      return this.login(key)
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
    let token = JSON.parse(window.localStorage.getItem(TOKEN_KEY)) || {};
    let isQYWX = navigator.userAgent.toLowerCase().match(/wxwork/) !== null; // 是否为企业微信
    if (token[key]) {
      let timestamp = token.timestamp;
      let timeCalc = new Date() - timestamp;
      if (isQYWX && (timeCalc > (2 * 3600 * 1000))) {
        return
      }
      if (timeCalc > (12 * 3600 * 1000)) { // 设置12小时过期时间
        return ''
      }
    } else {
      return ''
    }
    return token[key]
  },
  // TODO 开发时用于获取账号的登录信息
  login(key) {
    let isQYWX = navigator.userAgent.toLowerCase().match(/wxwork/) !== null; // 是否为企业微信
    if (isQYWX) {
      return this.QYWXLogin(key)
    } else {
      return this.pcLogin(key)
    }
  },
  // TODO PC端登录，默认返回token
  pcLogin(key = 'token') {
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
            password: 'stark',
            userCode: 'rfd9527'
          }
        };

        axios(params).then((res) => {
          let data = res.data;
          this.clean();
          this.setToken({
            token: data.token || '',
            entityId: data.entityId || ''
          });
          resolve(data[key])
        }).catch(function (error) {
          let res = error.response;
          let data = (res && res.data) || {};
          let message = data.message || '请求异常';
          reject({
            success: false,
            message: message
          })
        });
      }
    )
  },
  // TODO 企业微信登录，默认返回token
  QYWXLogin(key = 'token') {
    return new Promise((resolve, reject) => {
      let query = querystring.parse(location.search.slice(1));
      let code = query.code || '';
      // code = 'vcg0t6Z14rLpxNJ9j-9ze4vV4fiMILTa-U9zguO2IMo'
      axios.get('/H_roleplay-si/wxLogin?code=' + code + '&state=1').then((res) => {
        let data = res.data;
        this.clean();
        this.setToken({
          token: data.token || '',
          entityId: data.entityId || ''
        });
        resolve(data[key])
      }).catch(function (error) {
        let res = error.response;
        let data = (res && res.data) || {};
        let message = data.message || '请求异常';
        reject({
          success: false,
          message: message
        })
      });
    })
  },
  // TODO 获取用户信息
  getUser() {
    return $axios.ajax({
      url: '/trans/getModelData?refresh=true&shengName=&bankName=&sybName=&dsCode=getUserDetails'
    });
  },
  // TODO 判断是否为总裁
  isPresident() {
    return $axios.ajax({
      url: '/trans/getModelData?refresh=true&dsCode=getPresident'
    });
  }
}
export default tokenService;