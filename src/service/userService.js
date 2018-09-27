import $axios from '../plugins/ajax';

// TODO 获取用户列表
export let getAllUsers = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getAllUsers',
    data: {
      _dc: Date.now(),
      sort: JSON.stringify([{"property": "crtTime", "direction": "DESC"}]),
      page: 1,
      start: 0,
      limit: 50,
      ...data,
    }
  })
};

// TODO 获取用户详情
export let getUserDetail = (userId) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getUserInfoById',
    data: {
      userId
    }
  })
};

// TODO 获取获取公司列表
export let getCompanyList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/sysGroup/getCompanyList',
    data
  })
};

// TODO 检查工号是否存在
export let validateCode = (code) => {
  return $axios.ajax({
    url: '/H_roleplay-si/trans/validate',
    data: {
      tableName: 'sys_user',
      filter: JSON.stringify([{"filedName": "userCode", "symbol": "=", "value": code}]),
    }
  })
};

// TODO 新建账号
export let addUser = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/userInfo/addUser',
    data
  })
};

export default {}

