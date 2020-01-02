import { querystring } from 'vux'
import { corpid, secret, agentid, redirect_uri } from '@/plugins/ajax/conf'
import {isPC,isQYWX,} from '@/plugins/platform/index'
import Fly from 'flyio/dist/npm/fly'
import * as dd from 'dingtalk-jsapi'
import router from '../router';

const fly = new Fly();
const storage = window[isPC||window.isApp ? 'localStorage' : 'sessionStorage'];
const ROSE_TOKEN_KEY = 'ROSE_LOGIN_TOKEN';

let tokenService = {
  // 清除token
  clean() {
    storage.removeItem(ROSE_TOKEN_KEY);
  },
  // 设置token
  setToken(data) {
    storage.setItem(ROSE_TOKEN_KEY, JSON.stringify({
      entityId: data.entityId,
      token: data.token,
      name: data.name,
      department: data.department,
      avatar: data.avatar,
      position: data.position,
      key1: data.key1,
      active: data.active,
      timestamp: +new Date()
    }));
  },
  // 获取token
  getToken(all) {
    let token = JSON.parse(storage.getItem(ROSE_TOKEN_KEY)) || {};
    if(all)return token;
    let isQYWX = navigator.userAgent.toLowerCase().match(/wxwork/) !== null; // 是否为企业微信
    if (token['token']) {
      let timestamp = token.timestamp;
      let timeCalc = new Date() - timestamp;
      if (isQYWX && (timeCalc > (2 * 3600 * 1000))) {
        return ''
      } else if (timeCalc > (12 * 3600 * 1000)) { // 设置12小时过期时间
        return ''
      }
      return token['token'];
    } else {
      return ''
    }
  },
  getEnterpriseInfo(){
    fly.get(`/H_roleplay-si/na/enterpriseInfo`).then((res) => {
      let data = {};
      res.data.map(p=>{
        data[p.PROPERTY] = data.value;
      });
      return data;
    });      
  },
  // 登录
  login() {
    // 清楚token缓存
    this.clean();
    let query = querystring.parse(location.search.slice(1)),
        isDebug = query.debug == 'true',
        enterpriseInfo;
    let code = query.code;

    let isQYWX = navigator.userAgent.toLowerCase().match(/wxwork/) !== null;
    enterpriseInfo = this.getEnterpriseInfo();
    //return this.pcLogin('rfd113', 'rfd123456','token');
    // 根据环境不同 调用不同的登录接口
    if (isDebug){
      return this.toLoginPage();
    }else if (isQYWX) {
      if(code != null){
        return this.QYWXLogin();
      } else {
        var redUrl = redirect_uri;
        if(window.sessionStorage.getItem('shareUrl')){
          //不能用encodeURI它不解析&符号
          redUrl = encodeURIComponent(window.sessionStorage.getItem('shareUrl'));
        }
        window.location.replace(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpid}&redirect_uri=${redUrl}&response_type=code&scope=SCOPE&agentid=${agentid}&state=1#wechat_redirect`)
      }
    } else if (dd.ios || dd.android) {
      return this.DDLogin(enterpriseInfo.ddCorpid);
    } else {
      return this.toLoginPage();
    }    
  },
  // PC端登录，默认返回token
  pcLogin(userCode, password, key = 'token') {
    //console.log('进入pc了')
    return new Promise((resolve, reject) => {
      let params = {
        method: 'post',
        baseURL: window.baseURL || '',
        url: '/H_roleplay-si/login',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          password: password,
          userCode: userCode
        }
      };
      fly.request(params, params.data).then(res => {
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
  // 企业微信登录，默认返回token
  QYWXLogin(key = 'token') {
    console.log('进入企业微信了')
    return new Promise((resolve, reject) => {
      let query = querystring.parse(location.search.slice(1));
      let code = query.code || '';
      fly.get(`/H_roleplay-si/wxLogin?code=${code}&state=1&corpsecret=${secret}`).then((res) => {
        let data = res.data;
        this.setToken({
          key1: data.key1 || '',
          active: data.active || '',
          token: data.token || '',
          entityId: data.entityId || '',
          name: data.name || '',
          department: data.department || '',
          avatar: data.avatar || '',
          position: data.position || ''
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
  toLoginPage(){
    if(router.history.current.path != '/login'){
      router.push('/login');
    }
    return new Promise((resolve, reject)=>{
      resolve();
    })
  },
  DDLogin(ddCorpid) {
    var me = this;
    return new Promise((resolve, reject) => {
      dd.ready(function () {
        dd.runtime.permission.requestAuthCode({
          corpId: ddCorpid, // 企业id
          onSuccess: function (info) {
            let code = info.code;
            fly.get(`/H_roleplay-si/ddLogin?code=${code}`).then((res) => {
              let data = res.data;
              me.setToken({
                entityId: data.entityId,
                token: data.token,
                name: data.name,
                department: data.department,
                avatar: data.avatar,
                position: data.position,
                key1: data.key1,
                active: data.active
              });
              resolve(data['token'])
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
        });
      });
    })
  }
}
export default tokenService;