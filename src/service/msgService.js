import $flyio from '../plugins/ajax';


// TODO 消息代办列表
export let getMsgList = (data = {}) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/ds/getTasksListData?entityId=20000&para1='
    })
}
// TODO 所有消息列表
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