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

//通过物料编码获取物料信息
export let  getInventoryInfoByMatCode = (data ={}) =>{
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getInventoryInfoByMatCode',
    data
  }) 
}

//撤销为草稿
export let revocation = (data = {}) =>{

}

