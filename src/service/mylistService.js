import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";

let mylist={
    // @LS 2018-6-11
    //待审批
    getTasksListData(data){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getTasksListDataByListId',
            data:data,
        })
    },
    // @LS 2018-6-15
    //进行中，已完成
    getCompletedListDataByStatus(data){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getCompletedListDataByStatus',
            data:data,
        })
    }
};

export default mylist;
