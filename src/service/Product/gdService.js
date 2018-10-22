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

export default {
  getObjFacility,
  getWorkOrderTask
}