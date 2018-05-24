import axios from 'axios';
import $axios from '../plugins/ajax'
import conf from "../plugins/ajax/conf";
import { resolve } from 'path';

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
    //获取viewId
    getViewId(id){
        return $axios.ajax({
            url:`/H_roleplay-si/ds/list/getFormViewById?uniqueId=${id}`
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
    //获取分配人列表
    getTransferUserList(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getAllUsers?sort=%5B%7B%22property%22%3A%22crtTime%22%2C%22direction%22%3A%22DESC%22%7D%5D'
        })

    },
    //提交任务
    saveAndCommitTask(data){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/saveAndCommitTask',
            type:'POST',
            contentType:'application/x-www-form-urlencoded;charset=utf-8',
            data
        })
    },
    //提交任务2
    commitTask(data,id){
        return $axios.ajax({
            url:`/H_roleplay-si/flow/${id}/commitTask`,
            type:'POST',
            contentType:'application/x-www-form-urlencoded',
            data:data
        })
    },
    //转办任务
    transferTask(data){
        return $axios.ajax({
            url:`/H_roleplay-si/flow/setAssignee?userId=${data.userId}&userCode=${data.userCode}&taskId=${data.taskId}&comment=${data.comment}&taskTime=${data.taskTime}`
        })

    },
    //任务流
    getFlowList(code){
        return $axios.ajax({
            url:`/H_roleplay-si/ds/listTaskLogByTransCode?transCode=${code}`
        })
    }
    
    

}

export default getDetailService;