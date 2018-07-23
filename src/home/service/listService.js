import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};
export let getList = ( data = {})=>{
    return $axios.ajax({
        url:'/H_roleplay-si/seconds/getReportInfoByListViewId/2176',
        data
    }).catch(e => {
        return errorHandler(e);
    });
}
export default{
    getList 
}
