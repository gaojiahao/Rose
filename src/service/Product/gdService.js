import $axios from 'plugins/ajax';

// 获取工序
export let getWorkOrderTask = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getWorkOrderTask',
    data
  })
}

// 获取设施
export let getObjFacility = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getObjFacility',
    data
  })
}
//获取工单验收工单列表
export let getWorkCheckList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getWorkCheck',
    data
  })
}

// TODO 获取工单补领料工单列表
export let getWorkGDBLLList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getWorkReplenishment',
    data: {
      _dc: Date.now(),
      refresh: true,
      ...data,
    }
  })
}

export default {
  getObjFacility,
  getWorkOrderTask,
  getWorkGDBLLList,
}
