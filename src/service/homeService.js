import $axios from '../plugins/ajax'

export let getProductCount = () => {
  return $axios.ajax({
    url: '/ds/getProjectProductCoverNum',
    data: {
      noCount: 1
    }
  })
}
export default {
  getProductCount
}
