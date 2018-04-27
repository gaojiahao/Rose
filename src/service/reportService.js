import $axios from '../plugins/ajax'

let reportService = {
  // TODO 获取报告列表
  getReport(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData',
      data: {
        refresh: true,
        dsCode: 'getStatementsList',
        shengName: data.shengName || '', // 区域
        bankName: data.bankName || '', // 银行
        sybName: data.bmName || '', // 部门
        objName: data.objName || '', // 项目
        // pageSize: data.pageSize || 30,
        // startRow: ((data.page || 1) - 1) * 30,
        pageNo: data.pageNo || 1,
      }
    });
  },
  // TODO 获取合计
  getTotal(data = {}){
    return $axios.ajax({
      url: '/trans/getModelData',
      data: {
        refresh: true,
        dsCode: 'getAmountAndQty',
        shengName: data.shengName || '', // 区域
        bankName: data.bankName || '', // 银行
        sybName: data.bmName || '', // 部门
        objName: data.objName || '', // 项目
      }
    });
  },
}

export default reportService