import $axios from '../plugins/ajax'

let reportService = {
  // 获取报告列表(旧)
  getReport(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData',
      data: Object.assign({
        refresh: true,
        dsCode: 'getStatementsList',
      }, data)
    });
  },
  // 获取合计(旧)
  getTotal(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData',
      data: Object.assign({
        refresh: true,
        dsCode: 'getAmountAndQty',
      }, data)
    });
  },
  // 获取列表,增加时间筛选
  getReportByDate(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData',
      data: Object.assign({
        refresh: true,
        dsCode: 'getStatementByTime',
      }, data)
    });
  },
  getTotalByDate(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData',
      data: Object.assign({
        refresh: true,
        dsCode: 'getQtyByTime',
      }, data)
    });
  },
  // 获取报数汇总
  getReportSummary(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData',
      data: Object.assign({
        refresh: true,
        dsCode: 'getPunchCard',
      }, data)
    });
  },
  // 获取未报数列表
  getUnreported(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData',
      data: Object.assign({
        refresh: true,
        dsCode: 'getNotpunchCardName',
      }, data)
    });
  }
}

export default reportService