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
      url: '/ds/getSysDictByFathervalue&type?id=358&summary=%5B%5D&page=1&start=0&limit=50&filter=%5B%7B%22property%22%3A%22fvalue%22%2C%22operator%22%3A%22eq%22%2C%22value%22%3A%22BankHeadOffice%22%7D%2C%7B%22property%22%3A%22ftype%22%2C%22operator%22%3A%22eq%22%2C%22value%22%3A%22Bank%20Head%20Office%22%7D%5D',
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