import $flyio from '../plugins/ajax';


//获取id
export let getId = (id) => {
  return $flyio.ajax({
    url: `/H_roleplay-si/ds/list/getListViewById?uniqueId=${id}`
  })
};

//保存仓库
export let save = (data) => {
  return $flyio.post({
    url: '/H_roleplay-si/warehouse/save',
    data
  })
};

//修改仓库
export let update = (data) => {
  return $flyio.post({
    url: '/H_roleplay-si/warehouse/update',
    data
  })
};

//查询仓库信息
export let getwarehouseInfo = (code) => {
  return $flyio.ajax({
    url: `/H_roleplay-si/warehouse/findData?transCode=${code}`
  })
};

// TODO 获取组织列表
export let getDepartMentWage = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getDepartMentWage',
    data: {
      _dc: Date.now(),
      page: 1,
      start: 0,
      limit: 10000,
      ...data
    }
  })
};

export default {
  getId,
  save,
  update,
  getwarehouseInfo,
  getDepartMentWage,
}
