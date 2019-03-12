
import $flyio from 'plugins/ajax';

//获取职位列表
export let getJobList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getAllRole',
    data
  })
}

//保存往来
export let save = (data) => {
  return $flyio.post({
      url:'/H_roleplay-si/sysRole/save',
      data
  })
}
//修改往来
export let update =(data) => {
  return $flyio.post({
      url:'/H_roleplay-si/sysRole/update',
      data
  })
}
export default {
  save,
  update,
  getJobList
}
