import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};

let spread={
    // 表单信息
    // @LS 2018-6-11
    getFormView(data){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/list/getFormViewById',
            data:data,
        })
    },
    // 费用所属
    // @LS 2018-6-11
    getAccounting(data){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getAccountingUnitByid',
            data:data,
        }).catch(e => {
            return errorHandler(e);
        });
    },
    // 获取提交个人信息
    // @LS 2018-6-25
    getBaseInfo(){
        return $axios.ajax({
            url:'/H_roleplay-si/trans/getModelData?refresh=true&dsCode=getUserDetails',
        })
    },
    //获取市场费用信息
    getMarketInfo(key,name){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getMarketInformation',
            data:{
                key: key,
                name1: name,
                page: 1,
                start: 0,
                limit: 10000
            }
        }).catch(e => {
            return errorHandler(e);
        });
    }
};

export default spread;