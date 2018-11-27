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
export default {
  
}
