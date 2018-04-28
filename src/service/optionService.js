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
      url: '/base/dict/getChildren?query=&parentId=8fa32982-53a3-49db-832f-3759a38015de&page=1&start=0&limit=25',
    });
  },
  // TODO 获取部门列表
  getDept() {
    return $axios.ajax({
      url: '/ds/getUserGroupByParentId?parentId=990606',
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