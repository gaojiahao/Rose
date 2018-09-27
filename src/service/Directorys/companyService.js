
import $axios from 'plugins/ajax';

// 获取 公司列表
export let getCompany = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getCompanyList',
    data
  })
}
// 获取公司详情
export let CompanyInfo = (groupId = '') => {
  return $axios.ajax({
      url: '/H_roleplay-si/sysGroup/getCompanyList',
      data: {
          groupId
      }
  })
}
//保存往来
export let save = (data = {})=>{
  return $axios.post({
      url:'/H_roleplay-si/sysGroup/saveBatch',
      data
  })
}
//修改往来
export let update =(data = {})=>{
  return $axios.post({
      url:'/H_roleplay-si/sysGroup/updateBatch',
      data
  })
}
export default {
  save,
  update,
  getCompany,
  CompanyInfo
}
