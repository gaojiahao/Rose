import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";

let mylist={
    // @LS 2018-6-11
    //待审批
    getTasksListData(data){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getTasksListData2',
            data:data,
        })
    },
    // @LS 2018-6-15
    //进行中，已完成
    getCompletedListDataByStatus(data){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getCompletedListData2',
            data:data,
        })
    },
    // TODO 我的提交
    getListStartedByMe(data = {}){
      return $axios.ajax({
        url:'/H_roleplay-si/ds/listStartedByMe2',
        data:{
          _dc: Date.now(),
          page: 1,
          start: 0,
          limit: 10,
          ...data,
        },
      })
    },
};

export default mylist;
