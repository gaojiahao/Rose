import $flyio from 'plugins/ajax';

//获取待上架的箱码
export let getStorageShelf = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getStorageShelf2',
    data
  })
}


//通过箱码获取箱码具体信息
export let getPreShelfInvInfoByBoxCode = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPreShelfInvInfoByBoxCode',
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

//拣货下架通过箱码获取仓库信息
export let getPickingOutByBoxCode = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPickingOutByBoxCode',
    data
  })
}

//分拣通过箱码获取仓库信息
export let getSortingByBoxCode = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSortingByBoxCode',
    data
  })
}

//按单拣货通过箱码获取仓库信息
export let getSortingOrderByBoxCode = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSortingOrderByBoxCode',
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

//拣货下架释放订单占用
export let  releaseSortingOrder =  (transCode,matCode) =>{
  return $flyio.post({
    url: `/H_roleplay-si/wms/releaseSortingOrder?transCode=${transCode}&matCode=${matCode}`
  })
}

//分拣，按单拣货生成出库单
export let  autoConfirmStockPick =  (applicationCode,onShelvesCode) =>{
  return $flyio.post({
    url: `/H_roleplay-si/wms/autoConfirm?onShelvesCode=${onShelvesCode}&applicationCode=${applicationCode}`
  })
}

//通过物料编码获取物料信息
export let  getInventoryInfoByBoxCode = (data ={}) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getInventoryInfoByBoxCode',
    data
  }) 
}

//获取拣货入库待拣货数据
export let  getForPickingData =  (transCode) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getPickingOutByTransCode',
    data: {
      transCode: transCode
    }
  })
}

//获取分拣数据
export let  getSortOutData =  (transCode) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSortingByTransCode',
    data: {
      transCode: transCode
    }
  })
}

//获取按单拣货数据
export let  getOrderPickingData =  (transCode) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getSortingOrderByTransCode',
    data: {
      transCode: transCode
    }
  })
}

//根据物料编码获取物料信息
export let getInventoryInfoByMatCode = (data = {}) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getInventoryInfoByMatCode',
    data: data
  })
}


//根据托盘码获取码垛箱码信息
export let getBoxInfoByMD = (data = {}) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getBoxInfoByMD',
    data: data
  })
}

//根据托盘码获取箱码库存信息
export let getBoxInfoByPallet = (pallet,transCode) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getBoxInfoByPallet',
    data: {
      pallet: pallet,
      transCode: transCode
    }
  })
}

//分拣根据托盘码获取箱码库存信息
export let getSortOutBoxInfoByPallet = (pallet) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getBoxInfoByPalletOut',
    data: {
      pallet:pallet
    }
  })
}
 
//入库上架时，如果直接扫箱码，校验箱码是否与托盘码建立关系
export let validateBoxInfoByMD = (data ={}) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/validateBoxInfoByMD',
    data: data
  })
}

//通过托盘码获取库位信息
export let getLocationByPallet = (pallet) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getLocationByPallet',
    data: {
      pallet:pallet
    }
  })
}


//通过库位码获取库位信息
export let getLocationInfo = (location) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getLocationInfo',
    data: {
      location:location
    }
  })
}

//自动生成入库确认单
export let autoConfirm = (onShelvesCode,applicationCode) =>{
  return $flyio.ajax({
    url: `/H_roleplay-si/wms/autoConfirm?onShelvesCode=${onShelvesCode}&applicationCode=${applicationCode}`,
    type:'post',
    contentType:'application/json'
  })
}









