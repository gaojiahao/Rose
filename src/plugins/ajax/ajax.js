import tokenService from '../../service/tokenService'
import errHandle from 'service/errHandle'
import axios from 'axios';
import Fly from 'flyio/dist/npm/fly'
const fly = new Fly();

// import qs from 'qs';
let qs = require('querystring');

// TODO reject处理
let rejectError = (reject, message) => {
  errHandle(message);
  return Promise.reject({ success: false, message });
};
fly.interceptors.request.use((request)=> {
  console.log(`发起请求：path:${request.url}，baseURL:${request.baseURL}`)
  let token = tokenService.checkLogin('token');
  // console.log(token)
  if (!token) {
    console.log("没有token，先请求token...");
    // 锁定当天实例，后续请求会在拦截器外排队
    fly.lock();
    return tokenService.login('token').then((d) => {
      request.headers.Authorization = d;
      // console.log("token请求成功，值为: " + d);
      // console.log(`继续完成请求：path:${request.url}，baseURL:${request.baseURL}`)
      return request;
    }).finally(()=>{
      fly.unlock(); // 解锁后，会继续发起请求队列中的任务
    })
  } else {
    // console.log('已有的token：' + token)
    request.headers.Authorization = token;
  }
})
fly.interceptors.response.use(
  response =>{
    return response
  },
  error => {
    let res = error.response;
    let data = (res && res.data) || {};
    let status = (res && res.status) || 0;
    let message = data.message || '请求异常';
    if (status === 401) {
      tokenService.login()
    }
    errHandle(message);
    // rejectError(reject, message);
  }
)
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
      let params = {
        method: opts.type || 'GET',
        url: opts.url,
        headers: {
          'Content-Type': opts.contentType || '*/*',
        },
        timeout: opts.time || 10 * 1000,
        responseType: opts.dataType || 'json'
      }
      if (opts.type && opts.type.toUpperCase() === 'POST') {
        params.data = qs.stringify(opts.data) || {}
      } else {
        // params.params = opts.data || {}
        if (typeof opts.data === 'object') {
          let query = [];
          for (let [key, value] of Object.entries(opts.data)) {
            query.push(`${key}=${value}`)
          }
          if (params.url.indexOf('?') === -1) {
            // url上没有?
            params.url = encodeURI(`${params.url}?${query.join('&')}`)
          } else {
            // url上有?，给其拼上&
            params.url = encodeURI(`${params.url}&${query.join('&')}`)
          }
        }
      }
      fly.request(params, params.data).then( res => {
        let data = res.data;
        let {success = true, message = '请求异常'} = data;
        if (success && Number(res.status) === 200) {
          resolve(data)
        } else {
          rejectError(reject, message);
        }
      })      
    })
  },
  // TODO post请求，使用Payload
  post(opts = {}) {
    return new Promise((resolve, reject) => {
      fly.post(opts.url, opts.data).then(res => {
        let data = res.data;
        let {success = true, message = '请求异常'} = data;
        if (success && Number(res.status) === 200) {
          resolve(data)
        } else {
          rejectError(reject, message);
        }
      })
    })
  },
  // TODO 上传图片，单个文件
  upload({file = {}, biReferenceId = ''}) {
    let param = new FormData();  // 创建form对象
    param.append('file', file);  // 通过append向form对象添加数据
    if (biReferenceId) {
      param.append('biReferenceId', biReferenceId); // 添加form表单中其他数据
    }
    // console.log(param.get('file')); // FormData私有类对象，访问不到，可以通过get判断值是否传进去
    return this.post({
      url: '/H_roleplay-si/ds/upload',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: param
    })
  }
};

export default Rxports;


































