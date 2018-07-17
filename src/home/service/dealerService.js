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

    }
}
export default dealerService