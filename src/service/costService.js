import $axios from '../plugins/ajax';

//获取费用
export let getCost = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getCostAll',
    data
  })
}

//获取项目费用名称列表
export let getProjectCostByGroupId = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getProjectCostByGroupId',
    data
  })
}

//获取一般费用名称列表
export let getCostByGroupId = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getCostByGroupId',
    data
  })
}

// 获取付款资金账户列表
export let getObjFunds = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getObjFunds',
    data
  })
}
// 获取【员工借款与备用金】往来用户的余额
export let getEmployeeBal = (data) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getEmployeeBal',
    data: {
      limit: 1,
      filter: data,
      refresh: true
    }
  })
}


// TODO 获取资金列表(付供应商欠款)
export let getEmployeeReserveFunds = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getEmployeeReserveFunds',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// TODO 获取采购信息(付供应商欠款)
export let getPaySupplierArrearsDataSet = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getPaySupplierArrearsDataSet',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

export default {

}
