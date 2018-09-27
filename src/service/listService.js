import $axios from '../plugins/ajax';


export let getList = (id,data = {}) => {
  return $axios.ajax({
    url:`/H_roleplay-si/seconds/getReportInfoByListViewId/${id}`,
    data
  })
};

// TODO 获取销售订单列表
export let getSellOrderList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/seconds/getSellOrderList',
    data
  })
};
// TODO 获取弹出框的销售订单列表
export let getSalesOrderList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getSalesOutStock',
    data:{
      _dc: Date.now(),
      ...data
    }
  })
};
//获取弹出框的物料订单列表
export let getMaterOrderList = (data = {})=>{
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getInvRequirePlan',
    data:{
      _dc: Date.now(),
      ...data
    }
  })
}
// TODO 获取商机订单列表
export let getBusinessList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getFilterBusiness',
    data
  })
};

// 获取 仪表视图
export let getDashboard = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getSellOrderStatement',
    data
  })
}
//获取职位列表
export let getJobList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getAllRole',
    data
  })
}

// 获取 公司列表
export let getCompany = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getCompanyList',
    data
  })
}

export default {
  getList,
  getSellOrderList,
  getBusinessList,
  getDashboard,
  getCompany
}
