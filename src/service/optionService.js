import $axios from '../plugins/ajax'

let optionService = {
  // TODO 获取地区列表
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
      url: '/ds/getBankForWarehouse',
    });
  },
  // TODO 获取部门列表
  getDept() {
    return $axios.ajax({
      url: '/ds/getAPartGroup',
    });
  },
  // TODO 获取队长列表
  getCaptain(data = {}) {
    return $axios.ajax({
      url: '/ds/getRoleUser2Oneself',
      data: {
        roleId: '86',
        filter: JSON.stringify([{
          operator: 'like',
          value: data.value || '',
          property: 'nickname'
        }])
      }
    })
  }
}

export default optionService