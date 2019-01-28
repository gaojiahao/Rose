import $flyio from '../plugins/ajax';


export let getList = (id,data = {}) => {
  return $flyio.ajax({
    url:`/H_roleplay-si/seconds/getReportInfoByListViewId/${id}`,
    data
  })
};
// TODO 获取销售订单列表
export let getSellOrderList = (listId, data = {}) => {
  return $flyio.ajax({
    url: `/H_roleplay-si/seconds/mergeDetailItemList/${listId}`,
    data
  })
};
// TODO 获取弹出框的销售订单列表
export let getSalesOrderList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSalesOutStock',
    data:{
      _dc: Date.now(),
      ...data
    }
  })
};
//获取弹出框的物料订单列表
export let getMaterOrderList = (data = {})=>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getInvRequirePlan',
    data:{
      _dc: Date.now(),
      ...data
    }
  })
}
// TODO 获取商机订单列表
export let getBusinessList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getFilterBusiness',
    data
  })
};
//获取内部加工领料订单
export let getNBJGLLOrderList = ( data = {})=>{
  return $flyio.ajax({
    url:'/H_roleplay-si/ds/getProcessingPicking',
    data
  })
}
// 获取 仪表视图
export let getDashboard = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSellOrderStatement',
    data
  })
}

// TODO 获取被授权团队列表
export let getAuthorizedList = (data = {}) => {
  return $flyio.ajax({
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
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getObjWarehouse',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};
// TODO获取销售的出库的库位
export let getObjWarehouseRel = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getObjWarehouseRel',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

export let getWareHouseType = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getWareHouseType',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
}
// 获取请假列表数据
export let getLeaveDetailItem = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/mobile/getLeaveDetailItem',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
}

export let filterFields = (listId = '') => {
  return $flyio.ajax({
    url: `/H_roleplay-si/seconds/getInstanceDistinct/${listId}`
  })
}
export default {
  getList,
  getSellOrderList,
  getBusinessList,
  getDashboard
}
