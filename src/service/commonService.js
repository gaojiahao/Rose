import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};

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
    let {userGroupId = '', userGroupName = ''} = await $axios.ajax({
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
    }).catch(e => {
      baseErrorHandler(e);
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
        handlerRole: role.userGroupId || '',
        handlerRoleName: role.userGroupName || '',
      });
    }).catch(e => {
      baseErrorHandler(e);
    });
  });
};

// TODO 获取列表
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

export default {
  saveAndStartWf,
  saveAndCommitTask,
  getBaseInfoData,
  getList,
}
