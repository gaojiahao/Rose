import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};
// 工作流
export let getWorkFlow = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/ds/listTaskLogByTransCode',
        data
    }).catch( err => {
        return errorHandler(err);
    })
}
// 判断工作流节点是否与<我>有关
export let isMyflow = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/ds/getWorkFlowInfoByTransCode',
        data
    }).catch( err => {
        return errorHandler(err);
    })
}
//获取listId
export let getListId = (transCode = '')=>{
    return $axios.ajax({
        url:`/H_roleplay-si/ds/list/getFormByTransCode?transCode=${transCode}`,
        
    }).catch( err => {
        return errorHandler(err);
    })
}
// 获取表单详情
export let getSOList = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/formAPI/findData',
        data
    }).catch(e => {
        return errorHandler(e);
    });
}
// 获取当前用户
export let currentUser = (_dc = '') => {
    return $axios.ajax({
        url: '/H_roleplay-si/userInfo/currentUser',
        _dc
    }).catch( err => {
        return errorHandler(err);
    })
}

export default{
    isMyflow,
    getSOList,
    currentUser,
    getWorkFlow
}
