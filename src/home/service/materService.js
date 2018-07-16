import axios from 'axios';
import $axios from '../plugins/ajax';
import tokenService from './tokenService'

// TODO 保存物料
export let save = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/inventory/save',
    data
  })
};

// TODO 修改物料
export let update = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/inventory/update',
    data: {...data}
  });
};

// TODO 查看物料详情
export let findData = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/inventory/findData',
    data: {transCode}
  });
};

// TODO 上传图片
export let upload = ({file = {}, biReferenceId = ''}) => {
  return $axios.upload({
    file,
    biReferenceId
  })
};

// TODO 获取加工属性
export let getDictByType = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getDictByType',
    data: {
      page: 1,
      start: 0,
      limit: 10000,
      ...data
    }
  });
};

// TODO 获取材料大类、材料子类
export let getDictByValue = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getDictByValue',
    data: {
      page: 1,
      start: 0,
      limit: 10000,
      ...data
    }
  });
};
// TODO 获取当前用户
export let getBaseInfoData = () => {
  return new Promise(async (resolve, reject) => {
    let user = {};
    let {nickname, userId} = await $axios.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    }).then(data => {
      return data
    });
    /*let listUser = await $axios.ajax({
      url: '/H_roleplay-si/ds/listUsers',
      data: {
        limit: 1,
        filter: JSON.stringify([{
          operator: 'eq',
          value: nickname,
          property: 'nickname'
        }])
      }
    }).then(({tableContent = []}) => {
      let [user = {}] = tableContent;
      return user
    });*/
    let {userGroupId, userGroupName} = await $axios.ajax({
      url: '/H_roleplay-si/ds/getUnitsByUserId',
      data: {
        userId: userId,
        page: 1,
        start: 0,
        limit: 10000
      }
    }).then(({tableContent = []}) => {
      let [unit = {}] = tableContent;
      return unit
    });
    $axios.ajax({
      url: '/H_roleplay-si/ds/getRolesByUserId',
      data: {
        userId: userId,
        parentId: userGroupId,
        page: 1,
        start: 0,
        limit: 10000
      }
    }).then(({tableContent = []}) => {
      let [role = {}] = tableContent;
      resolve({
        handler: userId,
        handlerName: nickname,
        handlerUnit: userGroupId,
        handlerUnitName: userGroupName,
        handlerRole: role.userGroupId,
        handlerRoleName: role.userGroupName,
      });
    });
  });
};

export default {
  save,
  update,
  findData,
  upload,
  getDictByType,
  getDictByValue,
  getBaseInfoData,
}
