import $axios from '../plugins/ajax';


// TODO 消息代办列表
export let getMsgList = (data = {}) => {
    return $axios.ajax({
        url:'/H_roleplay-si/ds/getTasksListData?entityId=20000&para1='
    })
}
// TODO 所有消息列表
export let getAllMsgList = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/ds/getMyTasksAndLastNode',
        data
    })
}