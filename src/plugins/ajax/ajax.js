import conf from './conf';
import tokenService from '../../service/tokenService'

import axios from 'axios';

import qs from 'qs';

let Rxports = {
  /**
   * @param {String} type      请求的类型，默认post
   * @param {String} url        请求地址
   * @param {String} time      超时时间
   * @param {Object} data      请求参数
   * @param {String} dataType    预期服务器返回的数据类型，xml html json ...
   * @param {String} contentType      自定义请求headers
   * @param {Function} success    请求成功后，这里会有两个参数,服务器返回数据，返回状态，[data, res]
   * @param {Function} error      发送请求前
   * @param return
   */
  ajax(opts = {}) {
    return new Promise((resolve, reject) => {
      tokenService.getToken().then(token => {
        if (!opts.url) {
          alert('请填写接口地址');
          return false;
        }
        let params = {
          method: opts.type || 'GET',
          url: opts.url,
          headers: {
            'Content-Type': opts.contentType || '*/*',
            Authorization: token
          },
          // `baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。
          // 它可以通过设置一个 `baseURL` 便于为 axios 实例的方法传递相对 URL
          // baseURL: conf.base_url,
          timeout: opts.time || 10 * 1000,
          responseType: opts.dataType || 'json'
        }
        if (opts.type && opts.type.toUpperCase() === 'POST') {
          params.data = qs.stringify(opts.data) || {}
        } else {
          params.params = opts.data || {}
        }
        axios(params).then(function (res) {
          let data = res.data
          if (Number(res.status) === 200) {
            resolve(data)
          }
        }).catch(function (error) {
          console.log(error);
          let res = error.response
          let data = (res && res.data) || {}
          let status = (res && res.status) || 0
          let message = data.message || '请求异常'
          if (status === 401) {
            tokenService.login()
          }
          reject({
            success: false,
            message: message
          })
        });
      })
    })
  }
};

export default Rxports;


































