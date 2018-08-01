import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'
// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};

// TODO 消息代办列表
export let getMsgList = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/ds/getMyAgenda',
        data
    }).catch(e => {
        return errorHandler(e);
    });
}
// TODO 所有消息列表
export let getAllMsgList = (data = {}) => {
    return $axios.ajax({
        url: '/H_roleplay-si/ds/getMyTasks',
        data
    }).catch(e => {
        return errorHandler(e);
    });
}