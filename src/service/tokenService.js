import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";
import {querystring} from 'vux'

const TOKEN_KEY = 'ROSE_LOGIN_TOKEN';
const RFD_TOKEN_KEY = 'roleplay-token';

let tokenService = {
  /**
   * 清除toke
   */
  clean() {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(RFD_TOKEN_KEY);
  },
  /**
   * 获取token或者用户ID，默认获取token
   */
  getToken(key = 'token') {
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
      token: data.token,
      name: data.name,
      department: data.department,
      avatar: data.avatar,
      timestamp: +new Date()
    }));
    window.localStorage.setItem(RFD_TOKEN_KEY, JSON.stringify({
      key1: data.key1,
      active: data.active,
      entityId: data.entityId,
      token: data.token
    }));
  },
  // TODO 检查是否登录
  checkLogin(key = 'token') {
    let token = JSON.parse(window.localStorage.getItem(TOKEN_KEY)) || {};
    let isQYWX = navigator.userAgent.toLowerCase().match(/wxwork/) !== null; // 是否为企业微信
    if (token[key]) {
      let timestamp = token.timestamp;
      let timeCalc = new Date() - timestamp;
      if (isQYWX && (timeCalc > (2 * 3600 * 1000))) {
        return ''
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
    this.clean();
    let isQYWX = navigator.userAgent.toLowerCase().match(/wxwork/) !== null; // 是否为企业微信
    //本地测试模拟线上
    //return this.QYWXLogin(key);
    //实际开发
    if (isQYWX) {
      return this.QYWXLogin(key);
    } else {
      if (process.env.NODE_ENV === 'development') { // 不是开发环境则不调用登录接口
        return this.pcLogin(key);
      } else {
        window.location.replace('https://open.weixin.qq.com/connect/oauth2/authorize?appid=ww3c1aa17c16e380b7&redirect_uri=https%3a%2f%2frfd.roletask.com%2fRose_test&response_type=code&scope=SCOPE&agentid=1000033&state=1#wechat_redirect')
      }
    }
  },
  // TODO PC端登录，默认返回token
  pcLogin(key = 'token') {
    console.log('进入pc了')
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
          this.setToken({
            key1: data.key1 || '',
            active: data.active || '',
            token: data.token || '',
            entityId: data.entityId || '',
            name: data.name || '',
            department: data.department || '',
            avatar: data.avatar || ''
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
    console.log('进入企业微信了')
    return new Promise((resolve, reject) => {
      let query = querystring.parse(location.search.slice(1));
      let code = query.code || '';
      //let code = 'ARRpJRKgYHDVZitsyZrSD8yeLNSX7FqnxUsZwnizYjs'
      axios.get('/H_roleplay-si/wxLogin?code=' + code + '&state=1').then((res) => {
        console.log(res);
        let data = res.data;
        this.setToken({
          key1: data.key1 || '',
          active: data.active || '',
          token: data.token || '',
          entityId: data.entityId || '',
          name: data.name || '',
          department: data.department || '',
          avatar: data.avatar || ''
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
  }
}
export default tokenService;
