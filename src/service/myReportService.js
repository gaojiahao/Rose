import $axios from '../plugins/ajax'

let myReportService={
    //个人业绩报表查询
    myRepotList(data){
        return $axios.ajax({
            url: '/trans/getModelData?refresh=true&dsCode=getArray',
            data:data,
        });
    },
};
export default myReportService;