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
  // TODO 获取队长
  getCaptain(data = {}) {
    return $axios.ajax({
      url: '/ds/getRoleUser2Oneself',
      data: {
        roleId: '86'
      }
    })
  },
  //提交产品合计
  subAmount(data) {
    return $axios.ajax({
      url: '/ds/saveData?isMobile=true&conn=20000&list=trans_form_data&transCode=XHXSDD',
      data: data,
    });
  }
}

export default optionService