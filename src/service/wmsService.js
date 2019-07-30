import $flyio from 'plugins/ajax';

//获取待上架的箱码
export let getStorageShelf = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getStorageShelf',
    data
  })
}

//通过库位获取仓库信息
export let getWhbyStoragelocation = (data = {}) => {
    return $flyio.ajax({
      url: '/H_roleplay-si/ds/getParentWh',
      data
    })
  }

//通过箱码获取仓库信息
export let getPickingOutByBoxCode = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPickingOutByBoxCode',
    data
  })
}

//获取库位存货
export let  getLocationOfinventory =  (data = {}) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSumInvBalance_STCK',
    data
  })
}

//拣货入库新增提交后调用
export let  releaseSortingOrder =  (transCode, matCode) =>{
  return $flyio.post({
    url: '/H_roleplay-si/wms/releaseSortingOrder',
    data: {
      transCode: transCode,
      matCode: matCode
    }
  })
}

//通过物料编码获取物料信息
export let  getInventoryInfoByBoxCode = (data ={}) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getInventoryInfoByBoxCode',
    data
  }) 
}

//撤销为草稿
export let revocation = (data = {}) =>{

}

