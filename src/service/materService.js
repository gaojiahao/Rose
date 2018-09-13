import $axios from '../plugins/ajax';


// TODO 保存物料
export let save = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/inventory/save',
    data
  })
};

// TODO 修改物料
export let update = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/inventory/update',
    data
  })
};

// TODO 查看物料详情
export let findData = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/inventory/findData',
    data: {transCode}
  })
};

// TODO 上传图片
export let upload = ({file = {}, biReferenceId = ''}) => {
  return $axios.upload({
    file,
    biReferenceId
  })
};

// TODO 删除上传的图片
export let delImg = (id = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/delete',
    data: {
      id,
      list: 'attachments',
    }
  })
};

// TODO 获取仓库出库物料
export let getSumInvBalance = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getSumInvBalance',
    data
  })
};
//获取费用
export let getCost = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getCostAll',
    data
  })

}

// TODO 获取物料Pop列表
export let getObjInventoryByProcessing = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getObjInventoryByProcessing',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// TODO 获取物料Pop列表(采购订单)
export let getInventory7501 = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getPurchaseOrder',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// TODO 获取物料Pop列表(采购入库)
export let getInventory7502 = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getPurchaseWarehousing',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};
//获取物料列表
export let getMatList = ( data = {})=>{
  return $axios.ajax({
    url:'/H_roleplay-si/ds/getMaterialList',
    data
  })
}
export default {
  save,
  update,
  findData,
  upload,
  delImg,
}
