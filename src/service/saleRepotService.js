import $axios from '../plugins/ajax'

let saleReportService = {
  //项目产品类列表
  saleRepotList(data = {}) {
    return $axios.ajax({
      url: '/ds/extr/fb14652e-6706-40f9-af82-35ffcfd205a0',
      data: {
        page: 1,
        start: 0,
        limit: 10000,
        sort: JSON.stringify([{"property": "baseinfo.effectiveTime", "direction": "DESC"}]),
        ...data,
      }
    });
  },
  //提交产品合计
  subAmount(data) {
    return $axios.ajax({
      type: 'POST',
      url: '/ds/saveData',
      contentType: 'application/x-www-form-urlencoded',
      data,
    });
  },
  //判断提交时间是否超过20点
  getModelData() {
    return $axios.ajax({
      url: '/trans/getModelData?refresh=true&dsCode=getSubmitAllow',
    });
  },
  //拿到省长和常委
  getApprovalUserByAgent(data) {
    return $axios.ajax({
      url: '/ds/listUsers',
      data: data,
    })
  },
  // 获取连长、团长
  getSuperior(data) {
    return $axios.ajax({
      url: '/ds/getAutomaticReviewer',
      data: {
        userId: data,
      },
    })
  },
};
export default saleReportService;