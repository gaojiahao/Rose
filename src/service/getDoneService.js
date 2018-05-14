import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";

let getDoneService={

    //获取所有代办列表
    getDoneList(data) {
        return $axios.ajax({
            url: '/H_roleplay-si/ds/getMyDoneTask',
            data:data,
        });
    },

}

export default getDoneService;