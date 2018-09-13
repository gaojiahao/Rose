import $axios from '../plugins/ajax';
import errHandle from './errHandle'

// 工作流
export let getWorkFlow = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/ds/listTaskLogByTransCode',
        data
    }).catch( err => {
        return errHandle(err);
    })
}
// 判断工作流节点是否与<我>有关
export let isMyflow = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/ds/getWorkFlowInfoByTransCode',
        data
    }).catch( err => {
        return errHandle(err);
    })
}
//获取listId
export let getListId = (transCode = '')=>{
    return $axios.ajax({
        url:`/H_roleplay-si/ds/list/getFormByTransCode?transCode=${transCode}`,

    }).catch( err => {
        return errHandle(err);
    })
}
// 获取表单详情
export let getSOList = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/formAPI/findData',
        data
    }).catch(e => {
        return errHandle(e);
    });
}
// 获取当前用户
export let currentUser = (_dc = '') => {
    return $axios.ajax({
        url: '/H_roleplay-si/userInfo/currentUser',
        _dc
    }).catch( err => {
        return errHandle(err);
    })
}

// TODO 获取物料价格
export let getSaleQuotePrice = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/ds/getSaleQuotePrice',
    data: data
  }).catch( err => {
    return errHandle(err);
  })
};
// TODO 获取相关实例分类
export let getAppExampleDetails = (data = {})=>{
    return $axios.ajax({
        url:'/H_roleplay-si/trans/getAppExampleDetails',
        data
    }).catch( err => {
        return errHandle(err);
    })
}
// TODO 获取相关实例应用的视图
export let getListView = (data = {})=>{
    return $axios.ajax({
        url:'/H_roleplay-si/ds/list/getListViews',
        data
    }).catch( err => {
        return errHandle(err);
    })
}
export default{
    isMyflow,
    getSOList,
    currentUser,
    getWorkFlow
}
