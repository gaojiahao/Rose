import $flyio from '../plugins/ajax';
import errHandle from './errHandle'

// 获取list的分类
export let getListClassfiy = (data = {}) => {
  return $flyio.ajax({
    // url: '/account-api/account/getEntryView',
    url: '/H_roleplay-si/ps/account/getEntryView',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// 获取列表的字段
export let getView = (data = {}) => {
  return $flyio.ajax({
    url: '/account-api/account/getView',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// 获取列表数据
export let getViewList = (data = {}) => {
  return $flyio.ajax({
    url: '/account-api/account/getView',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// 获取资产负债表数据
export let getOffBalance = () => {
  return $flyio.ajax({
    url: '/account-api/account/getOffBalanceForMobile',
  }).catch(e => {
    return errHandle(e);
  });
};
// 获取利润表数据
export let getProfit = () => {
  return $flyio.ajax({
    url: '/account-api/account/getProfitForMobile',
  }).catch(e => {
    return errHandle(e);
  });
};

export default {}
