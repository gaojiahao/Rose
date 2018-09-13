import $axios from '../plugins/ajax';
import errHandle from './errHandle'

// TODO 获取list的分类
export let getListClassfiy = (data = {}) => {
  return $axios.ajax({
    url: '/account-api/account/getEntryView',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 获取列表的字段
export let getView = (data = {}) => {
  return $axios.ajax({
    url: '/account-api/account/getView',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 获取列表数据
export let getViewList = (data = {}) => {
  return $axios.ajax({
    url: '/account-api/account/getView',
    data
  }).catch(e => {
    return errHandle(e);
  });
};


export default {
  getListClassfiy,
  getView,
  getViewList
}
