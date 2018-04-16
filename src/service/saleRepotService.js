import $axios from '../plugins/ajax'

let saleReportService={
    //项目产品类列表
    saleRepotList(){
        return $axios.ajax({
            url: '/ds/extr/93090d70-b4d4-48f5-b6a7-79697c6570ef',
        });
    },
    //提交产品合计
    subAmount(data){
        return $axios.ajax({
            type: 'POST',
            url: '/ds/saveData',
            contentType:'application/x-www-form-urlencoded',
            data,
        });
    }
};
export default saleReportService;