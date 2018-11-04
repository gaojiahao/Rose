import $axios from '../plugins/ajax'

// 获得 当月 当日的销售状况
export let getProductCount = () => {
  return $axios.ajax({
    url: '/ds/getProjectProductCoverNum',
    data: {
      noCount: 1
    }
  })
}
// 获得 每个月的销售目标
export let getCurrMonthStatus = () => {
  return $axios.ajax({
    url: '/mobile/getCurrMonthStatusByQuarter'
  })
}
export default {
  getProductCount,
  getCurrMonthStatus
}
