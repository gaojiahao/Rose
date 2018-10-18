import $axios from '../plugins/ajax'

let myReportService={
    //个人业绩报表查询
    myRepotList(data){
        return $axios.ajax({
            url: '/trans/getModelData?refresh=true&dsCode=getArray',
            data:data,
        });
    },
    //个人业绩汇总
    allSaleReport(data){
        return $axios.ajax({
            url:'/mobile/getPerformanceBySalesman',
            data
        })
    },
    allProductReport(data){
        return $axios.ajax({
            url:'/mobile/getPerformanceByProduct',
            data
        })
    }
};
export default myReportService;