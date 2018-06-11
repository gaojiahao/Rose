import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";

let spread={

    // 费用所属事业部
    // @LS 2018-6-11
    getAccounting(data){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getAccountingUnitByid',
            data:data,
        })
    }
};

export default spread;