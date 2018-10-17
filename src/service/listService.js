import $axios from '../plugins/ajax'

export let getSalesList = (data = {}) => {
  return $axios.ajax({
    url: '/ds/getPersonalPerformanceSummary',
    data: {
      id: 388,
      _dc: Date.now(),
      summary: JSON.stringify([]),
      ...data
    }
  })
};

export default {

}