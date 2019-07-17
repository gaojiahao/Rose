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
        url: `/H_roleplay-si/ds/list/getFormByTransCode?transCode=${transCode}`,

    })
}
// 获取表单详情
export let getSOList = (data = {}, api = 'formAPI') => {
    return $flyio.ajax({
        url: '/H_roleplay-si/' + api + '/findData',
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
        url: '/H_roleplay-si/trans/getAppExampleDetails',
        data
    })
}
// 获取相关实例应用的视图
export let getListView = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/list/getListViews',
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
        url: '/H_roleplay-si/ds/list/getListById',
        data
    })
}
export let getFromStatus = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/getFromStatusByTransCode',
        data
    })
}
//获取所有流程状态
export let getProcessStatusByListId = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/getProcessStatusByListId',
        data: {
            _dc: Date.now(),
            ...data,
        }
    })
}
//获取当前流程状态
export let getStatusProcessByTransCode = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/trans/getStatusProcessByTransCode',
        data: {
            _dc: Date.now(),
            ...data,
        }
    })
}
//更新流程状态
export let updateProcessStatus = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/formAPI/updateProcessStatus',
        data: {
            _dc: Date.now(),
            ...data,
        }
    })
}
//获取科目分录数量
export let getAutoSubjectCount = (data = {}) => {
    return $flyio.ajax({
        url: '/corebiz-api/subject/getAutoSubjectCount',
        data: {
            _dc: Date.now(),
            ...data,
        }
    })
}

// 获取应用特性管理数据
export let getAppFeaturesData = (listId) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/app/feature/list',
        data: {
            listId: listId
        }
    })
}

export default {}
