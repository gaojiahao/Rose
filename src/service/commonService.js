import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};

// TODO 保存
export let saveAndStartWf = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/saveAndStartWf',
    data: data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 修改
export let saveAndCommitTask = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/saveAndCommitTask',
    data: data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 保存(没有工作流)
export let submitAndCalc = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/submitAndCalc',
    data: data
  }).catch(e => {
    return errorHandler(e);
  });
};

export let commitTask  = ( data={} )=>{
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url:'/H_roleplay-si/flow/commitTask',
    data
  }).catch(e=>{
    return errorHandler(e);
  })
}
// TODO 获取当前用户信息
export let getBaseInfoData = () => {
  return new Promise(async (resolve, reject) => {
    let user = {};
    let baseErrorHandler = (e) => {
      AlertModule.show({
        content: e.message,
      });
      reject(e);
    };
    let {nickname, userId} = await $axios.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    }).then(data => {
      return data
    }).catch(e => {
      baseErrorHandler(e);
    });
    let {groupId = '', groupName = ''} = await $axios.ajax({
      url: '/H_roleplay-si/ds/getGroupByUserId',
      data: {
        userId: userId,
        page: 1,
        start: 0,
        limit: 10000
      }
    }).then(({tableContent = []}) => {
      let [unit = {}] = tableContent;
      return unit
    }).catch(e => {
      baseErrorHandler(e);
    });
    $axios.ajax({
      url: '/H_roleplay-si/ds/getRoleByUserId',
      data: {
        userId: userId,
        // parentId: userGroupId,
        page: 1,
        start: 0,
        limit: 10000
      }
    }).then(({tableContent = []}) => {
      let [role = {}] = tableContent;
      resolve({
        handler: userId,
        handlerName: nickname,
        handlerUnit: groupId,
        handlerUnitName: groupName,
        handlerRole: role.roleId || '',
        handlerRoleName: role.roleName || '',
      });
    }).catch(e => {
      baseErrorHandler(e);
    });
  });
};

// TODO 获取视图列表
export let getList = (viewId = 0, data = {}) => {
  return $axios.ajax({
    url: `/H_roleplay-si/seconds/getReportInfoByListViewId/${viewId}`,
    data: {
      limit: 10,
      page: 1,
      start: 11,
      ...data
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 上传图片
export let upload = ({file = {}, biReferenceId = ''}) => {
  return $axios.upload({
    file,
    biReferenceId
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取加工属性
export let getDictByType = (type = '', data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getDictByType',
    data: {
      page: 1,
      start: 0,
      limit: 10000,
      type,
      ...data
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取材料大类、材料子类
export let getDictByValue = (value = '', data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getDictByValue',
    data: {
      page: 1,
      start: 0,
      limit: 10000,
      value,
      ...data
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

export default {
  saveAndStartWf,
  saveAndCommitTask,
  submitAndCalc,
  getBaseInfoData,
  getList,
  upload,
  getDictByType,
  getDictByValue,
}
