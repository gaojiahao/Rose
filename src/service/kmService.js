import $flyio from 'plugins/ajax';

// 获取list的分类
export let getListClassfiy = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ps/account/getEntryView',
    data
  })
};

// 获取列表的字段
export let getView = (data = {}) => {
  return $flyio.ajax({
    url: '/account-api/account/getView',
    data
  })
};

// 获取列表数据
export let getViewList = (data = {}) => {
  return $flyio.ajax({
    url: '/account-api/account/getView',
    data
  })
};

// 获取资产负债表数据
export let getOffBalance = () => {
  return $flyio.ajax({
    url: '/account-api/account/getOffBalanceForMobile',
  })
};
// 获取利润表数据
export let getProfit = () => {
  return $flyio.ajax({
    url: '/account-api/account/getProfitForMobile',
  })
};

export default {}
