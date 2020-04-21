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

};
export default incomeService;