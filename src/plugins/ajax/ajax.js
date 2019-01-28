// 请求插件引入
const fly = new Fly();
import Fly from 'flyio/dist/npm/fly'
// 请求地址引入
import tokenService from '../../service/tokenService'
// 弹窗插件引入
import { AlertModule } from 'vux'
import errHandle from 'service/errHandle'


// import qs from 'qs';
let qs = require('querystring');

// reject处理
let rejectError = (reject, message) => {
  errHandle(message);
  return Promise.reject({ success: false, message });
};

// fly请求 设置拦截器
fly.interceptors.request.use((request) => {
  // 检验 token是否存在
  let token = tokenService.checkLogin();
  // token 存在则赋值在header当中
  if(token) {
    request.headers.Authorization = token;
  }
  else {
    // token 不存在，锁住请求，优先请求token，后序请求进入队列
    fly.lock();
    return tokenService.login().then((token) => {
      request.headers.Authorization = token;
      // 请求token成功之后，即将进入第一个请求
      return request;
    }).finally(() => {
      // 解锁队列，后序请求恢复正常
      fly.unlock()
    }).catch( err => {
      // 请求拦截 报错标识
      console.log('req-err:', err);
      rejectError('reject', err.message)
    })
  }
})

// fly请求 响应拦截器
fly.interceptors.response.use(
  function (response) {
    let { success = true, message = '请求异常' } = response.data;
    if(success){
      return response;
    }else {
      rejectError('reject', message)
    }
  },
  function (error) {
    // 响应拦截 报错标识
    if(error.status === 401) {
      this.lock();
      return tokenService.login()
      .then((token) => {
        console.log('token已更新')
        AlertModule.show({
          title: '温馨提示',
          content: '您的登录状态似乎有点问题，不用担心，页面刷新之后就好',
          onHide() {
            location.reload();
          }
        })
      })
    }
    else if(error.status === 1) {
      if(error.message.includes('timeout')) {
        rejectError('reject', '抱歉，网络无法联系，请稍后再试')
      }
    }
    rejectError('reject', error.response.data.message) 
  }
)

// 请求选项列表
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
  
  // 标准请求 （支持GET、POST）
  ajax(opts = {}) {
    
    return new Promise((resolve, reject) => {
      let params = {
        method: opts.type || opts.method || 'GET',
        url: opts.url,
        headers: {
          'Content-Type': opts.contentType || '*/*',
        },
        timeout: opts.time || 30 * 1000,
        responseType: opts.dataType || 'json'
      }
      if (params.method.toUpperCase() === 'POST') {
        params.data = qs.stringify(opts.data || opts.body) || {}
        if(opts.contentType === 'application/json'){
          params.data = opts.data
        }
      } else {
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
      fly.request(params, params.data)
        .then( res => resolve(res.data))
        .catch( err => {
          console.log('err:', err);
        })
    })
  },
  
  // post请求，使用Payload
  post(opts = {}) {
    return new Promise((resolve, reject) => {
      fly.post(opts.url, opts.data).then(res => resolve(res.data));
    })
  },

  // 上传图片，单个文件
  upload({file = {}, biReferenceId = ''}) {
    let param = new FormData();  // 创建form对象
    param.append('file', file);  // 通过append向form对象添加数据
    if (biReferenceId) {
      param.append('biReferenceId', biReferenceId); // 添加form表单中其他数据
    }
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


































