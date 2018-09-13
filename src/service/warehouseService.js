import $axios from '../plugins/ajax';
import errHandle from './errHandle'

//获取id
export let getId = (id) => {
  return $axios.ajax({
    url: `/H_roleplay-si/ds/list/getListViewById?uniqueId=${id}`
  }).catch(e => {
    return errHandle(e);
  });
};

//保存仓库
export let save = (data) => {
  return $axios.post({
    url: '/H_roleplay-si/warehouse/save',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

//修改仓库
export let update = (data) => {
  return $axios.post({
    url: '/H_roleplay-si/warehouse/update',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

//查询仓库信息
export let getwarehouseInfo = (code) => {
  return $axios.ajax({
    url: `/H_roleplay-si/warehouse/findData?transCode=${code}`
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 获取组织列表
export let getDepartMentWage = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getDepartMentWage',
    data: {
      _dc: Date.now(),
      page: 1,
      start: 0,
      limit: 10000,
      ...data
    }
  }).catch(e => {
    return errHandle(e);
  });
};

export default {
  getId,
  save,
  update,
  getwarehouseInfo,
  getDepartMentWage,
}
