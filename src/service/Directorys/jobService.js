
import $axios from 'plugins/ajax';

//获取职位列表
export let getJobList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getAllRole',
    data
  })
}

//保存往来
export let save = (data)=>{
  return $axios.post({
      url:'/H_roleplay-si/sysRole/save',
      data
  })
}
//修改往来
export let update =(data)=>{
  return $axios.post({
      url:'/H_roleplay-si/sysRole/update',
      data
  })
}
export default {
  save,
  update,
  getJobList
}
