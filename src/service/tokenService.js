import { querystring } from 'vux'
import { corpid, secret, agentid, redirect_uri } from '@/plugins/ajax/conf'
import Fly from 'flyio/dist/npm/fly'

const fly = new Fly();
const ROSE_TOKEN_KEY = 'ROSE_LOGIN_TOKEN';
const PC_RFD_TOKEN_KEY = 'roleplay-token';

let tokenService = {
  // 清除token
  clean() {
    window.sessionStorage.removeItem(ROSE_TOKEN_KEY);
    window.localStorage.removeItem(PC_RFD_TOKEN_KEY);
  },
  // 设置token
  setToken(data) {
    window.sessionStorage.setItem(ROSE_TOKEN_KEY, JSON.stringify({
      entityId: data.entityId,
      token: data.token,
      name: data.name,
      department: data.department,
      avatar: data.avatar,
      position: data.position,
      timestamp: +new Date()
    }));
    window.localStorage.setItem(PC_RFD_TOKEN_KEY, JSON.stringify({
      key1: data.key1,
      active: data.active,
      entityId: data.entityId,
      token: data.token
    }));
  },
  // 检查是否登录
  checkLogin() {
    let token = JSON.parse(window.sessionStorage.getItem(ROSE_TOKEN_KEY)) || {};
    let isQYWX = navigator.userAgent.toLowerCase().match(/wxwork/) !== null; // 是否为企业微信
    if (token['token']) {
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
    return token['token']
  },
  // 登录
  login() {
    // 清楚token缓存
    this.clean();
    // 获取当前域名
    let nowUrl = location.origin;
    // 是否为企业微信客户端
    let isQYWX = navigator.userAgent.toLowerCase().match(/wxwork/) !== null;

    // 根据环境不同 调用不同的登录接口
    if (nowUrl.includes('192.168.3.') || nowUrl.includes('localhost')) {
      console.log('当前为测试环境');
      return this.pcLogin();
    } else {
      if (isQYWX) {
        return this.QYWXLogin();
      } else {
        window.location.replace(`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpid}&redirect_uri=${redirect_uri}&response_type=code&scope=SCOPE&agentid=${agentid}&state=1#wechat_redirect`)
      }
    }
  },
  // PC端登录，默认返回token
  pcLogin(key = 'token') {
    console.log('进入pc了')
    return new Promise((resolve, reject) => {
<<<<<<< HEAD
        let params = {
          method: 'post',
          baseURL: '/H_roleplay-si',
          url: '/login',
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            password: '123456',
            userCode: 'rfd113'
          }
        };
        fly.request(params, params.data).then( res => {
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
=======
      let params = {
        method: 'post',
        baseURL: '/H_roleplay-si',
        url: '/login',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {
          password: '123456',
          userCode: '15399909500'
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
>>>>>>> 490c1f6e760f4c2d2f61746810e8c87b57c4f079
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
  }
}
export default tokenService;
