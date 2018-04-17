import $axios from '../plugins/ajax'

let saleReportService={
    //项目产品类列表
    saleRepotList(){
        return $axios.ajax({
            url: '/ds/extr/269f5a62-54e4-45f7-bf65-3fd68c68245f',
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