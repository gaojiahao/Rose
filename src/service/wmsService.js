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
