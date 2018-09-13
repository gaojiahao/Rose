import $axios from '../plugins/ajax';
import errHandle from './errHandle'

// TODO 消息代办列表
export let getMsgList = (data = {}) => {
    return $axios.ajax({
        url:'/H_roleplay-si/ds/getTasksListData?entityId=20000&para1='
    }).catch(e => {
        return errHandle(e);
    });
}
// TODO 所有消息列表
export let getAllMsgList = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/ds/getMyTasksAndLastNode',
        data
    }).catch(e => {
        return errHandle(e);
    });
}