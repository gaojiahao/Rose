import $axios from '../plugins/ajax'

let incomeService = {
    //项目产品类列表
    getIncomeInfo(data = {}) {
      return $axios.ajax({
        url: '/ds/getXmcpjlInfo',
        data: {
        }
      });
    },

    //获取我的收入模拟
    getXmcpjlInv(data) {
      return $axios.ajax({
        url: '/ds/getXmcpjlInv',
        data: {
          REFERENCE_ID: data,
        }
      });
    },



};
export default incomeService;