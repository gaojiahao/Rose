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
export let  releaseSortingOrder =  (transCode,matCode) =>{
  return $flyio.post({
    url: `/H_roleplay-si/wms/releaseSortingOrder?transCode=${transCode}&matCode=${matCode}`
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
export let getBoxInfoByPallet = (data = {}) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getBoxInfoByPallet',
    data: data
  })
}
 
//入库上架时，如果直接扫箱码，校验箱码是否与托盘码建立关系
export let validateBoxInfoByMD = (data ={}) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/validateBoxInfoByMD',
    data: data
  })
}



