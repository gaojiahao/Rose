import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";

let getDetailService={
    //获取表单id
    getFormId(code){
        return $axios.ajax({
            url:`/H_roleplay-si/ds/list/getFormByTransCode?transCode=${code}`
            
        });
    },
    //获取任务详情
    getDetailInfo(id,code) {
        return $axios.ajax({
            url:`/H_roleplay-si/formAPI/findData/${id}/${code}`
            
        });
    },
    //获取任务id
    getTaskInfo(code){
        return $axios.ajax({
            url:`/H_roleplay-si/ds/getWorkFlowInfoByTransCode?transCode=${code}`
        })

    },
    //获取接口任务详情
    getDoInfo(code){
        return $axios.ajax({
            url:`/H_roleplay-si/ds/getJsonDataByReferenceId?referenceId=${code}`
        })
    },
    //获取分配人列表
    getUserList(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getUsersByGroupId?groupId=353'
        })

    },
    //提交任务
    submitTask(data){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/saveAndCommitTask',
            type:'POST',
            contentType:'application/x-www-form-urlencoded',
            data:data
        })
    }
    

}

export default getDetailService;