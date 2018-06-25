import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";

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
        })
    },
    // 获取提交个人信息
    // @LS 2018-6-25
    getBaseInfo(){
        return $axios.ajax({
            url:'/H_roleplay-si/trans/getModelData?refresh=true&dsCode=getUserDetails',
        })
    },
};

export default spread;