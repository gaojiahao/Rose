import $axios from '../plugins/ajax';

// TODO 保存
export let saveAndStartWf = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/saveAndStartWf',
    data: data
  })
};

// TODO 修改
export let saveAndCommitTask = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/saveAndCommitTask',
    data: data
  })
};

// TODO 保存(没有工作流)
export let submitAndCalc = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/submitAndCalc',
    data: data
  })
};

// TODO 修改(没有工作流)
export let updateAndCalc = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/updateAndCalc',
    data: data
  })
};

export let commitTask = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/flow/commitTask',
    data
  })
}

// TODO 获取当前用户信息(基础对象调用)
export let getBaseInfoDataBase = () => {
  return new Promise(async (resolve, reject) => {
    let {nickname, userId} = await $axios.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    }).then(data => {
      return data
    })
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
    })
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
    })
  });
};

// TODO 获取当前用户信息
export let getBaseInfoData = () => {
  return new Promise(async (resolve, reject) => {

    let {nickname, userId, userCode} = await $axios.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    }).then(data => {
      return data
    })
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
    })
    await $axios.ajax({
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
    })
  });
};

// TODO 获取视图列表
export let getList = (viewId = 0, data = {}) => {
  return $axios.ajax({
    url: `/H_roleplay-si/seconds/getReportInfoByListViewId/${viewId}`,
    data
  })
};

// TODO 上传图片
export let upload = ({file = {}, biReferenceId = ''}) => {
  return $axios.upload({
    file,
    biReferenceId
  })
};

// TODO 获取加工属性
export let getDictByType = (type = '', data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getDictByType',
    data: {
      _dc: Date.now(),
      page: 1,
      start: 0,
      limit: 10000,
      type,
      ...data
    }
  })
};

// 获取流程状态
export let getProcessStatus = (listId) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getProcessStatus',
    data: {
      listId,
      page: 1,
      start: 0,
      limit: 10000, 
    }
  })
}

// TODO 获取材料大类、材料子类
export let getDictByValue = (value = '', data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getDictByValue',
    data: {
      _dc: Date.now(),
      page: 1,
      start: 0,
      limit: 10000,
      value,
      ...data
    }
  })
};

// TODO 获取工作流的processCode
export let getProcess = (listId = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/list/getProcessByListId',
    data: {
      _dc: Date.now(),
      listId
    }
  })
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
  })
};

// 获取所有的经办人
export let listUsers = (data = {}) =>{
  return $axios.ajax({
    url: '/H_roleplay-si/ds/listUsers',
    data
  })
}
export let getGroupByUserId = (userId = '') =>{
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getGroupByUserId',
    data: {
      page: 1,
      start: 0,
      limit: 10000,
      userId
    }
  })
}
export let getRoleByUserId = (userId = '') =>{
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getRoleByUserId',
    data: {
      page: 1,
      start: 0,
      limit: 10000,
      userId
    }
  })
}

export default {
  getList,
  upload,
  getProcess,
  getDictByType,
  submitAndCalc,
  getDictByValue,
  saveAndStartWf,
  getBaseInfoData,
  saveAndCommitTask,
  getProcessStatus,
  getObjDealerByLabelName
}
