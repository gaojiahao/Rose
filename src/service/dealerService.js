import $axios from '../plugins/ajax';

const dealerService = {
    // 获取id
    getId(id){
        return $axios.ajax({
            url: `/H_roleplay-si/ds/list/getListViewById?uniqueId=${id}`
        })
    },
    // 获取所有往来列表
    getDealerList(id,data){
        return $axios.ajax({
            url: `/H_roleplay-si/seconds/getReportInfoByListViewId/${id}`,
            data
        })
    },
    // 获取订单往来客户列表
    getOrderDealerList(data){
        return $axios.ajax({
            url: '/H_roleplay-si/ds/getObjDealerByLabelName',
            data
        })
    },
    // 获取往来分类
    getDealerClassfiy(){
        return $axios.ajax({
            url: '/H_roleplay-si/ds/list/getListViews?listId=c0375170-d537-4f23-8ed0-a79cf75f5b04'
        })
    },
    // 获取往来关系标签
    getDictByType(){
        return $axios.ajax({
            url: '/H_roleplay-si/ds/getDictByType',
            data:{
                type: 'dealerRelLabel',
                page: 1,
                start: 0,
                limit: 25
            }
        })
    },
    // 获取往来大类
    getDictByValue(value){
        return $axios.ajax({
            url: '/H_roleplay-si/ds/getDictByValue',
            data:{
                value: value,
                page: 1,
                start: 0,
                limit: 10000
            }
        })
    },
    // 保存往来
    save(data){
        return $axios.post({
            url: '/H_roleplay-si/dealer/save',
            data
        })
    },
    // 修改往来
    update(data){
        return $axios.post({
            url: '/H_roleplay-si/dealer/update',
            data
        })
    },
    // 查询往来信息
    getDealerInfo(code){
        return $axios.ajax({
            url: `/H_roleplay-si/dealer/findData?transCode=${code}`
        })
    },
    // 获取新增应用中的往来
    getAppdealer(data){
        return $axios.ajax({
            url: '/H_roleplay-si/ds/getObjDealerByLabelName',
            data
        })
    },
    // 获取联系人
    getContactList(data){
        return $axios.ajax({
            url: '/H_roleplay-si/ds/getObjDealerContact',
            data
        })
    },
    // TODO 获取供应商列表(付供应商欠款)
    getPaySupplierArrears(data = {}){
      return $axios.ajax({
        url: '/H_roleplay-si/ds/getPaySupplierArrears',
        data: {
          _dc: Date.now(),
          ...data,
        }
      })
    },
    // TODO 获取供应商列表(付供应商定金)
    getDepositToPaySuppliers(data = {}) {
      return $axios.ajax({
        url: '/H_roleplay-si/ds/getDepositToPaySuppliers',
        data: {
          _dc: Date.now(),
          ...data,
        }
      })
    },
    // TODO 获取往来列表(出让承兑汇票)
    getSaleAcceptanceBill(data = {}) {
      return $axios.ajax({
        url: '/H_roleplay-si/ds/getSaleAcceptanceBill',
        data: {
          _dc: Date.now(),
          ...data,
        }
      })
    },
    // TODO 获取往来列表(收到承兑汇票)
    getObjDealerBalByLabelName(data = {}) {
      return $axios.ajax({
        url: '/H_roleplay-si/ds/getObjDealerBalByLabelName',
        data: {
          _dc: Date.now(),
          ...data,
        }
      })
    },
}
export let getPaySupplierArrears = dealerService.getPaySupplierArrears;
export let getDepositToPaySuppliers = dealerService.getDepositToPaySuppliers;
export let getSaleAcceptanceBill = dealerService.getSaleAcceptanceBill;
export let getObjDealerBalByLabelName = dealerService.getObjDealerBalByLabelName;
export default dealerService
