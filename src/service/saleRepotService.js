import $axios from '../plugins/ajax'

let saleReportService={
    //项目产品类列表
    saleRepotList(){
        return $axios.ajax({
            url:'/ds/extr/fb14652e-6706-40f9-af82-35ffcfd205a0?page=1&start=0&limit=25&sort=%5B%7B%22property%22:%22trans_detail_uncalc.bankCharge%22,%22direction%22:%22ASC%22%7D%5D',
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
    },
    //判断提交时间是否超过20点
    getModelData(){
        return $axios.ajax({
            url: '/trans/getModelData?refresh=true&dsCode=getSubmitAllow',
        });
    },
    //拿到省长和常委
    getApprovalUserByAgent(data){
        return $axios.ajax({
            url:'/ds/listUsers',
            data:data,
        })
    }
};
export default saleReportService;