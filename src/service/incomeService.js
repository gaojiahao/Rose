import $axios from '../plugins/ajax'

let incomeService = {
    //项目产品信息
    getIncomeInfo(data = {}) {
      return $axios.ajax({
        url: '/ds/getXmcpjlInfo',
        data: {
        }
      });
    },

    //获取产品列表
    getXmcpjlInv(data) {
      return $axios.ajax({
        url: '/ds/getXmcpjlInv',
        data: {
          REFERENCE_ID: data,
        }
      });
    },
    //判断是否有填写过收入模拟
    getIsHasSrmnInfo(data) {
      return $axios.ajax({
        url: '/ds/getIsHasSrmnInfo',
        data: {
          LIST_ID: data.listId,
          CREATOR: data.userId,
        }
      });
    },
    //获取formdata
    getJsonDataByReferenceId(referenceId) {
      return $axios.ajax({
        url: '/ds/getJsonDataByReferenceId',
        data: {
          _dc: Date.now(),
          referenceId: referenceId,
        }
      });
    },
    //提交数据
    saveData(data) {
      return $axios.ajax({
        type: 'POST',
        url: '/ds/saveData',
        contentType: 'application/x-www-form-urlencoded',
        data:data
      });
    },
};
export default incomeService;