import $flyio from 'plugins/ajax';

// 获取工序
export let getWorkOrderTask = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getWorkOrderTask',
    data
  })
}

// 获取设施
export let getObjFacility = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getObjFacility',
    data
  })
}
//获取工单验收工单列表
export let getWorkCheckList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getWorkCheck',
    data
  })
}

// 获取工单补领料工单列表
export let getWorkGDBLLList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getWorkReplenishment',
    data: {
      _dc: Date.now(),
      refresh: true,
      ...data,
    }
  })
}

// 获取工单任务启动工序列表
export let getWorkStartList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getWorkOrderStart',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};

// 获取工单任务启动物料Bom
export let getBomWorkStart = (code) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getBomWorkOrderStart',
    data: {
      _dc: Date.now(),
      filter: JSON.stringify([{operator: 'in', property: 'parentInvCode', value: code}])
    }
  })
};

// 获取工单验收物料Bom
export let getBomWorkCheck = ({transCode = '', inventoryCode = ''}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getBomWorkOrderCheck',
    data: {
      _dc: Date.now(),
      filter: JSON.stringify([
        {operator: 'in', property: 'startCode', value: transCode},
        {operator: 'in', property: 'parentInvCode', value: inventoryCode},
      ]),
    }
  })
};
// 获取工单可派工列表
export let getTaskWorkList = (data = {})=>{
  return $flyio.ajax({
    url: '/account-api/account/getView',
    data: {
      // calc_rel_code: 7051
      // view_id: view_94
      ...data,
      user_code: 1,
      view_scope: 'data',
      page: 1,
      start: 0,
      limit: 100
    }
  })
}
export default {
  getObjFacility,
  getWorkOrderTask,
  getWorkGDBLLList,
  getWorkStartList,
  getBomWorkStart,
}
