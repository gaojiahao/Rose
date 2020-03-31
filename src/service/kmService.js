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
export let getOffBalance = (endDate) => {
  return $flyio.ajax({
    url: '/account-api/composite/getBalanceSheet',
    data: {
      end: endDate
    }
  })
};
// 获取利润表数据
export let getProfit = (endDate) => {
  return $flyio.ajax({
    url: '/account-api/composite/getProfitSheet',
    data: {
      end: endDate
    }
  })
};
// 获取企业货币
export let getLocalCurrency = () => {
  return $flyio.ajax({
    url: '/H_roleplay-si/foreignExchange/get'
  })
};
// 获取现金流量表数据
export let getCashFlowSheet = (endDate) => {
  return $flyio.ajax({
    url: '/account-api/composite/getCashFlowSheet',
    data: {
      end: endDate
    }
  })
};
//获取自动分录数据 view_id 区分会计类科目与非会计类科目
export let prolxyGetAutomaticEntry = (data = {}) => {
  return  $flyio.ajax({
      url: '/account-api/account/getView',
      //view_id: view_id,
      active_type: 'automatic',
      //trans_code: transCode,
      view_scope: 'modelAndData',
      op: 'queryAll',
      //view_type: view_type
      data
  })
};
export default {}
