/* 评论相关接口 */
import $axios from '../plugins/ajax';

///保存往来
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
  update
}
