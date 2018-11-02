import axios from 'axios';
import $axios from 'plugins/ajax'
import conf from "plugins/ajax/conf";
import {querystring} from 'vux'
import {corpid, corpsecret, agentid, redirect_uri} from '@/plugins/ajax/conf'

const TOKEN_KEY = 'ROSE_LOGIN_TOKEN';

let tokenService = {
  /**
   * 清除toke
   */
  clean() {
    window.sessionStorage.removeItem(TOKEN_KEY);
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
    window.sessionStorage.setItem(TOKEN_KEY, JSON.stringify({
      entityId: data.entityId,
      key: data.token,
      name: data.name,
      avatar: data.avatar,
      timestamp: +new Date()
    }));
  },
  // TODO 检查是否登录
  checkLogin(key = 'key') {
    let token = JSON.parse(window.sessionStorage.getItem(TOKEN_KEY)) || {};
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
    // if (isQYWX) {
    //   return this.QYWXLogin(key);
    // } else {
      if (process.env.NODE_ENV === 'development') { // 不是开发环境则不调用登录接口
        return this.pcLogin(key);
      } else {
        window.location.replace(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpid}&redirect_uri=${redirect_uri}&response_type=code&scope=SCOPE&agentid=${agentid}&state=1#wechat_redirect`)
      }
    // }
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
            entityId: data.entityId || '',
            avatar: data.avatar || '',
            name: data.name
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
      axios.get(`/H_roleplay-si/wxLogin?code=${code}&state=1&corpsecret=${corpsecret}`).then((res) => {
        let data = res.data;
        this.clean();
        this.setToken({
          token: data.token || '',
          entityId: data.entityId || '',
          avatar: data.avatar || '',
          name: data.name,
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
    return new Promise((resolve, reject) => {
      const USER_INFO = 'RFD_CURRENT_USER_INFO';
      let currentUser = sessionStorage.getItem(USER_INFO);
      // 处理当前用户数据，默认取第一个
      let handleCurrentUser = (data = {}) => {
        data.completeData = {...data};
        for (let [key, value] of Object.entries(data)) {
          if (key !== 'completeData') {
            data[key] = value && value.split(',')[0];
          }
        }
        return data
      };
      if (currentUser) {
        resolve(handleCurrentUser(JSON.parse(currentUser)));
        return
      }
      $axios.ajax({
        url: '/trans/getModelData?refresh=true&dsCode=getUserDetails',
      }).then((data = {}) => {
        sessionStorage.setItem(USER_INFO, JSON.stringify(data));
        resolve(handleCurrentUser(data));
      })
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