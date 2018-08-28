import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: '数据请求有误，请尝试重新刷新'
  });
  return Promise.reject(e)
};

// TODO 获取list的分类
export let getListClassfiy = (data = {}) => {
  return $axios.ajax({
    url: '/account-api/account/getEntryView',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取列表的字段
export let getView = (data = {}) => {
  return $axios.ajax({
    url: '/account-api/account/getView',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取列表数据
export let getViewList = (data = {}) => {
  return $axios.ajax({
    url: '/account-api/account/getView',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};


export default {
  getListClassfiy,
  getView,
  getViewList
}
