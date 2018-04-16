import axios from 'axios';
import $axios from '../plugins/ajax'

const tokenKey = 'ROSE_LOGIN_TOKEN';

let tokenService = {
  /**
   * 清除toke
   */
  clean: function () {
    window.localStorage.removeItem(tokenKey);
  },
  /**
   * 获取token
   */
  getToken: function () {
    return window.localStorage.getItem(tokenKey) || '';
  },
  /**
   * 设置企业微信token
   */
  setWeixinToken: (token) => {
    window.localStorage.setItem('weixin_token', token);
  },
  /**
   * 设置token
   */
  setToken: function (token) {
    window.localStorage.setItem(tokenKey, token);
  },
  // TODO 开发时用于获取账号的token
  pcLogin() {
    $axios.ajax({
      url: '/login',
      type: 'POST',
      contentType: 'application/json',
      data: {
        loginModel: 1,
        password: 'rfd120',
        userCode: 'rfd120'
      }
    }).then((res) => {
      let data = res.data
      this.clean()
      this.setToken(data.token)
    })
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