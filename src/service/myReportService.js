import $axios from '../plugins/ajax'

let myReportService={
    //个人业绩报表查询
    myRepotList(){
        return $axios.ajax({
            url: '/trans/getModelData?refresh=true&uid=1&dsCode=getPersonalAchievementList',
        });
    },
};
export default myReportService;