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
        // pageSize: data.pageSize || 30,
        // startRow: ((data.page || 1) - 1) * 30,
        pageNo: data.pageNo || 1,
      }
    });
  }
}

export default reportService