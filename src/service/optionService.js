import $axios from '../plugins/ajax'

let optionService = {
  getOption(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData?refresh=1&dsCode=getSOList',
      data: data,
    });
  },
  saveOption(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData?refresh=1&dsCode=getSOList',
      data: data,
    });
  },
  getRegion() {
    return $axios.ajax({
      url: '/base/dict/getListByValue',
      data: {
        value: 'ACCOUNTPROVINCE'
      }
    });
  },
  // TODO 获取银行列表
  getBank() {
    return $axios.ajax({
      url: '/ds/getGroupBU',
    });
  },
  // TODO 获取部门
  getDept() {
    return $axios.ajax({
      url: '/ds/getAPartGroup',
    });
  },
}

export default optionService