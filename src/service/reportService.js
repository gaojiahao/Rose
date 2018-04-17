import $axios from '../plugins/ajax'

let reportService = {
  getReport(data = {}) {
    console.log(data)
    return $axios.ajax({
      url: '/trans/getModelData',
      data: {
        refresh: true,
        dsCode: 'getStatementsList',
        sybName: data.sybName || '', // 区域
        bankName: data.bankName || '', // 银行
        bmName: data.bmName || '', // 部门
        objName: data.objName || '', // 项目
      }
    });
  }
}

export default reportService