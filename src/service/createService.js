import $axios from '../plugins/ajax'

let createService = {
  // TODO 获取配置
  getConfig(data = {}) {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/list/getFormViewById',
      data
    });
  },
  // TODO 获取remote数据
  getRemoteData(url, data) {
    return $axios.ajax({
      url: url,
      data: Object.assign({
        page: 1,
        start: 0,
        limit: 10000,
      }, data)
    });
  },
  // TODO 获取节点数据
  getProcess(data = {}) {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/list/getProcessByListId',
      data
    });
  },
  // TODO 提交数据(有节点的)
  saveAndStartWf(data = {}) {
    return $axios.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: '/H_roleplay-si/ds/saveAndStartWf',
      data: Object.assign({
        conn: 20000,
        list: 'trans_form_data',
        transCode: ''
      }, data)
    });
  },
  // TODO 提交数据
  saveData(data = {}) {
    return $axios.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: '/H_roleplay-si/ds/saveData',
      data: Object.assign({
        conn: 20000,
        list: 'trans_form_data',
        transCode: ''
      }, data)
    });
  },
  // TODO 获取当前用户
  getUser(){
    return $axios.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    });
  },
  // TODO 获取当前用户的信息
  getCurrentUser(name){
    return $axios.ajax({
      url: '/H_roleplay-si/ds/listUsers',
      data: {
        limit: 1,
        filter: JSON.stringify([{
          operator: 'eq',
          value: name,
          property: 'nickname'
        }])
      }
    });
  }
};

export default createService
