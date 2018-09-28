
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
// 保存
export let save = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/sysGroup/saveBatch',
    data
  })
}
// 修改
export let update =(data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/sysGroup/updateBatch',
    data
  })
}
// 校验填写内容
export let checkValue = (filedName, val) => {
  return $axios.ajax({
    url: '/H_roleplay-si/trans/validate',
    data: {
      tableName: 'sys_group',
      filter: JSON.stringify([
        { "filedName": filedName, "symbol": "=", "value": val}
      ])
    }
  })
}

export default {
  save,
  update,
  getCompany,
  checkValue,
  CompanyInfo
}
