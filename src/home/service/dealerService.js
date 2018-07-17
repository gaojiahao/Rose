import $axios from '../plugins/ajax';

const dealerService = {
    //获取id
    getId(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/list/getListViewById?uniqueId=7f01c808-d338-4711-8c99-319337078cc1'
        })
    },
    //获取往来列表
    getDealerList(id){
        return $axios.ajax({
            url:`/H_roleplay-si/seconds/getReportInfoByListViewId/${id}`,
            data:{
                limit: 50,
                page: 1,
                start: 0
            }
        })
    },
    //获取往来关系标签
    getDictByType(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getDictByType',
            data:{
                type: 'dealerRelLabel',
                page: 1,
                start: 0,
                limit: 25
            }
        })

    },
    //获取往来大类
    getDictByValue(value){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getDictByValue',
            data:{
                value: value,
                page: 1,
                start: 0,
                limit: 10000
            }
        })
    },
    //保存往来
    save(data){
        return $axios.post({
            url:'/H_roleplay-si/dealer/save',
            data
        })
    },
    //修改往来
    update(data){
        return $axios.post({
            url:'/H_roleplay-si/dealer/update',
            data
        })
    },
    //查询往来信息
    getDealerInfo(code){
        return $axios.ajax({
            url:`/H_roleplay-si/dealer/findData?transCode=${code}`
        })

    }


}
export default dealerService