import $axios from '../plugins/ajax'

let optionService = {
  // 获取地区列表
  getRegion() {
    return $axios.ajax({
      url: '/ds/extr/296f34b2-21fc-44c1-b967-9758d5121736?_dc=1541405696462&page=1&start=0&limit=10000&sort=%5B%7B%22property%22%3A%22trans_detail_uncalc.var1%22%2C%22direction%22%3A%22DESC%22%7D%5D'
    });
  },
  // 获取银行列表
  getBank() {
    return $axios.ajax({
      url: '/base/dict/getChildren?query=&parentId=8fa32982-53a3-49db-832f-3759a38015de&page=1&start=0&limit=25',
    });
  },
  // 获取部门列表
  getDept() {
    return $axios.ajax({
      url: '/ds/getUserGroupByParentId?parentId=990606',
    });
  },
  // 获取队长列表
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
  },
  // 获取级联区域
  getCascadeRegion(data = {}) {
    return $axios.ajax({
      url: '/base/dict/getChildren',
      data: {
        parentId: '00077c75-a1a2-4706-be3f-0bf4ad30bf05',
        ...data,
      }
    })
  },
}

export default optionService