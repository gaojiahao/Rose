import $axios from '../plugins/ajax';

const warehouseService = {
    //获取id
    getId(id){
        return $axios.ajax({
            url:`/H_roleplay-si/ds/list/getListViewById?uniqueId=${id}`
        })
    },
    //获取仓库列表
    getwarehouseList(id,data){
        return $axios.ajax({
            url:`/H_roleplay-si/seconds/getReportInfoByListViewId/${id}`,
            data
        })
    },
    //获取仓库分类
    getwarehouseClassfiy(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/list/getListViews?listId=c0375170-d537-4f23-8ed0-a79cf75f5b04'
        })
    },
    //获取仓库关系标签
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
    //获取仓库大类
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
    //保存仓库
    save(data){
        return $axios.post({
            url:'/H_roleplay-si/warehouse/save',
            data
        })
    },
    //修改仓库
    update(data){
        return $axios.post({
            url:'/H_roleplay-si/warehouse/update',
            data
        })
    },
    //查询仓库信息
    getwarehouseInfo(code){
        return $axios.ajax({
            url:`/H_roleplay-si/warehouse/findData?transCode=${code}`
        })

    }


}
export default warehouseService