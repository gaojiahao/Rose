import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";

let getDetailService={

    //获取任务详情
    getDetailInfo(id,code) {
        return $axios.ajax({
            url:`/H_roleplay-si/formAPI/findData/${id}/${code}`
            
        });
    },

}

export default getDetailService;