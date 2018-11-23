import $axios from '../plugins/ajax';


export let getList = (id,data = {}) => {
  return $axios.ajax({
    url:`/H_roleplay-si/seconds/getReportInfoByListViewId/${id}`,
    data
  })
};

// TODO 获取销售订单列表
export let getSellOrderList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/seconds/getSellOrderList',
    data
  })
};
// TODO 获取弹出框的销售订单列表
export let getSalesOrderList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getSalesOutStock',
    data:{
      _dc: Date.now(),
      ...data
    }
  })
};
//获取弹出框的物料订单列表
export let getMaterOrderList = (data = {})=>{
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getInvRequirePlan',
    data:{
      _dc: Date.now(),
      ...data
    }
  })
}
// TODO 获取商机订单列表
export let getBusinessList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getFilterBusiness',
    data
  })
};
//获取内部加工领料订单
export let getNBJGLLOrderList = ( data = {})=>{
  return $axios.ajax({
    url:'/H_roleplay-si/ds/getProcessingPicking',
    data
  })
}
// 获取 仪表视图
export let getDashboard = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getSellOrderStatement',
    data
  })
}

// TODO 获取被授权团队列表
export let getAuthorizedList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getAllGroup',
    data: {
      _dc: Date.now(),
      page: 1,
      start: 0,
      limit: 10000,
    }
  })
};

// TODO 获取内部加工入库的仓库列表
export let getWarehouse = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getObjWarehouse',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};
export let getWareHouseType = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getWareHouseType',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
}
export let filterFields = (viewId = '') => {
  return $axios.ajax({
    url: `/H_roleplay-si/seconds/getInstanceDistinct/${viewId}`
  })
}
export default {
  getList,
  getSellOrderList,
  getBusinessList,
  getDashboard
}
