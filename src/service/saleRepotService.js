import $axios from '../plugins/ajax'

let saleReportService={
    //项目产品类列表
    saleRepotList(){
        return $axios.ajax({
            url: '/ds/extr/fb14652e-6706-40f9-af82-35ffcfd205a0',
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