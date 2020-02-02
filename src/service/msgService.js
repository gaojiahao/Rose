/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-20 11:02:44
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2020-01-09 14:46:29
 */
import $flyio from 'plugins/ajax';


// 消息代办列表
export let getMsgList = (data = {}) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/ds/getTasksListData',
        data
    })
}
export let getMsgList2 = (data = {}) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/mobile/getTasksListData',
        data
    })
}
// 所有消息列表
export let getAllMsgList = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/getMyTasksAndLastNode',
        data
    })
}

export let getNotice = ( data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/getNotice',
        data
    })
}

// 获取点赞列表
export let getNoticeByPraise = ( data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/mobile/getNoticeByPraise',
        data
    })
}
export let getList = (viewId = 0, data = {}) => {
    return $flyio.ajax({
      url: `/H_roleplay-si/seconds/getReportInfoByListViewId/${viewId}`,
      data
    })
};

//获取工作流任务信息
export let getWorkFlowInfoByTransCode = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/getWorkFlowInfoByTransCode',
        data
    })
}
