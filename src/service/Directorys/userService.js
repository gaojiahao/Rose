import $flyio from 'plugins/ajax';

// 获取用户列表
export let getAllUsers = (data = {}) => {
  return $flyio.ajax({
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

// 获取用户详情
export let getUserDetail = (userId) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getUserInfoById',
    data: {
      userId
    }
  })
};

// 获取获取公司列表
export let getCompanyList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/sysGroup/getCompanyList',
    data
  })
};

// 检查工号是否存在
export let validateCode = (code) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/trans/validate',
    data: {
      tableName: 'sys_user',
      filter: JSON.stringify([{"filedName": "userCode", "symbol": "=", "value": code}]),
    }
  })
};

// 新建账号
export let addUser = (data = {}) => {
  return $flyio.post({
    url: '/H_roleplay-si/userInfo/addUser',
    data
  })
};

// 修改账号
export let updateUser = (data = {}) => {
  return $flyio.post({
    url: '/H_roleplay-si/userInfo/updateUser',
    data
  })
};

export default {}

