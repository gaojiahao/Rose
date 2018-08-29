import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};
export let getList = (id,data = {}) => {
  return $axios.ajax({
    url:`/H_roleplay-si/seconds/getReportInfoByListViewId/${id}`,
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取销售订单列表
export let getSellOrderList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/seconds/getSellOrderList',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};
// TODO 获取弹出框的销售订单列表
export let getSalesOrderList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getSalesOutStock',
    data:{
      _dc: Date.now(),
      ...data
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取商机订单列表
export let getBusinessList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getFilterBusiness',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

export default {
  getList,
  getSellOrderList,
  getBusinessList,
}
