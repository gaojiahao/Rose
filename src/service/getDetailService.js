import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";

let getDetailService={

    //获取任务详情
    getDetailInfo(code) {
        return $axios.ajax({
            url: '/H_roleplay-si/formAPI/findData/a43aed46-8273-478a-9161-ef940542ed71/'+code
            
        });
    },

}

export default getDetailService;