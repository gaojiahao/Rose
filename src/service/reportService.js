import $axios from '../plugins/ajax'

let reportService = {
  getReport(data = {}) {
    return $axios.ajax({
      url: '/trans/getModelData?refresh=true&dsCode=getStatementsList',
    });
  }
}

export default reportService