import $axios from '../plugins/ajax';
import errHandle from './errHandle'

// TODO 保存
export let saveAndStartWf = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/saveAndStartWf',
    data: data
  }).catch(e => {
    return errHandle(e);
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
    return errHandle(e);
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
    return errHandle(e);
  });
};

export let commitTask = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/flow/commitTask',
    data
  }).catch(e => {
    return errHandle(e);
  })
}

// TODO 获取当前用户信息(基础对象调用)
export let getBaseInfoDataBase = () => {
  return new Promise(async (resolve, reject) => {
    let {nickname, userId} = await $axios.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    }).then(data => {
      return data
    }).catch(e => {
      return errHandle(e);
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
      return errHandle(e);
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
      return errHandle(e);
    });
  });
};

// TODO 获取当前用户信息
export let getBaseInfoData = () => {
  return new Promise(async (resolve, reject) => {

    let {nickname, userId, userCode} = await $axios.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    }).then(data => {
      return data
    }).catch(e => {
      return errHandle(e);
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
      return errHandle(e);
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
        userCode: userCode,
      });
    }).catch(e => {
      return errHandle(e);
    });
  });
};

// TODO 获取视图列表
export let getList = (viewId = 0, data = {}) => {
  return $axios.ajax({
    url: `/H_roleplay-si/seconds/getReportInfoByListViewId/${viewId}`,
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 上传图片
export let upload = ({file = {}, biReferenceId = ''}) => {
  return $axios.upload({
    file,
    biReferenceId
  }).catch(e => {
    return errHandle(e);
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
    return errHandle(e);
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
    return errHandle(e);
  });
};

// TODO 获取工作流的processCode
export let getProcess = (listId = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/list/getProcessByListId',
    data: {
      _dc: Date.now(),
      listId
    }
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 获取员工、客户、加工商、渠道商
export let getObjDealerByLabelName = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getObjDealerByLabelName',
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
  saveAndStartWf,
  saveAndCommitTask,
  submitAndCalc,
  getBaseInfoData,
  getList,
  upload,
  getDictByType,
  getDictByValue,
  getProcess,
  getObjDealerByLabelName,
}
