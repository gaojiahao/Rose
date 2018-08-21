import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};
const warehouseService = {
    //获取id
    getId(id){
        return $axios.ajax({
            url:`/H_roleplay-si/ds/list/getListViewById?uniqueId=${id}`
        }).catch(e => {
            return errorHandler(e);
          });
    },
    //获取仓库列表
    getwarehouseList(id,data){
        return $axios.ajax({
            url:`/H_roleplay-si/seconds/getReportInfoByListViewId/${id}`,
            data
        }).catch(e => {
            return errorHandler(e);
          });
    },
    //获取仓库分类
    getwarehouseClassfiy(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getDictByType',
            data:{
                type: 'warehouseRelType',
                page: 1,
                start: 0,
                limit: 50
            }
        }).catch(e => {
            return errorHandler(e);
        });
    },
    //获取客户
    getDealer(){
        return $axios.ajax({
            url:'/H_roleplay-si/ds/getObjDealerByLabelName',
            data:{
                dealerLabelName: '客户',
                page: 1,
                start: 0,
                limit: 1000
            }
        }).catch(e => {
            return errorHandler(e);
        });
    },
    //保存仓库
    save(data){
        return $axios.post({
            url:'/H_roleplay-si/warehouse/save',
            data
        }).catch(e => {
            return errorHandler(e);
        });
    },
    //修改仓库
    update(data){
        return $axios.post({
            url:'/H_roleplay-si/warehouse/update',
            data
        }).catch(e => {
            return errorHandler(e);
        });
    },
    //查询仓库信息
    getwarehouseInfo(code){
        return $axios.ajax({
            url:`/H_roleplay-si/warehouse/findData?transCode=${code}`
        }).catch(e => {
            return errorHandler(e);
        });

    }


}
export default warehouseService