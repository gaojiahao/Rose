import $flyio from 'plugins/ajax';

// 工作流
export let getWorkFlow = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/listTaskLogByTransCode',
        data: {
          _dc: Date.now(),
          ...data,
        }
    })
}
// 判断工作流节点是否与<我>有关
export let isMyflow = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/getWorkFlowInfoByTransCode',
        data
    })
}
//获取listId
export let getListId = (transCode = '') => {
    return $flyio.ajax({
        url:`/H_roleplay-si/ds/list/getFormByTransCode?transCode=${transCode}`,

    })
}
// 获取表单详情
export let getSOList = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/formAPI/findData',
        data
    })
}
// 获取物料价格
export let getSaleQuotePrice = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/ds/getSaleQuotePrice',
    data: data
  })
};
// 获取相关实例分类
export let getAppExampleDetails = (data = {}) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/trans/getAppExampleDetails',
        data
    })
}
// 获取相关实例应用的视图
export let getListView = (data = {}) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/ds/list/getListViews',
        data
    })
}
// 获取任务日志列表
export let findAllJobLog = (transCode = '') => {
    return $flyio.ajax({
        url: '/H_roleplay-si/jobLog/findAllJobLog',
        data: {
            pageIndex: 1,
            pageSize: 1000,
            transCode
        }
    })
}
export let getListById = (data = {}) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/ds/list/getListById',
        data
    })
}
export let getFromStatus = (data ={}) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/ds/getFromStatusByTransCode',
        data
    })
}
export default{}
