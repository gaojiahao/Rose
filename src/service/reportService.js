import $axios from '../plugins/ajax'

let reportService = {
  getReport(data = {}) {
    let sdCode = data.objName ? 'getAllList' : 'getAaList'
    return $axios.ajax({
      url: '/trans/getModelData',
      data: {
        refresh: true,
        dsCode: sdCode,
        sybName: data.sybName || '', // 区域
        bankName: data.bankName || '', // 银行
        bmName: data.bmName || '', // 部门
        objName: data.objName || '', // 项目
      }
    });
  }
}

export default reportService