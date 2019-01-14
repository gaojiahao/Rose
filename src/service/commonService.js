import $flyio from '../plugins/ajax'

// TODO 保存
export let saveAndStartWf = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/saveAndStartWf',
    data: data
  })
};

// TODO 修改
export let saveAndCommitTask = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/saveAndCommitTask',
    data: data
  })
};

// TODO 保存(没有工作流)
export let submitAndCalc = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/submitAndCalc',
    data: data
  })
};

// TODO 修改(没有工作流)
export let updateData = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/updateData',
    data: data
  })
};

export let commitTask = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/flow/commitTask',
    data
  })
}

// TODO 获取当前用户信息(基础对象调用)
export let getBaseInfoDataBase = () => {
  return new Promise(async (resolve, reject) => {
    let {nickname, userId} = await $flyio.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    }).then(data => {
      return data
    })
    let {userGroupId = '', userGroupName = ''} = await $flyio.ajax({
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
    $flyio.ajax({
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

// 获取当前用户信息
export let getBaseInfoData = () => {
  return new Promise(async (resolve, reject) => {
    // 当前用户
    let {nickname, userId, userCode} = await $flyio.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    }).then(data => {
      return data
    })
    // 经办组织
    let { tableContent: handleORG } = await $flyio.ajax({
      url: '/H_roleplay-si/ds/getGroupByUserId',
      data: {
        userId,
        page: 1,
        start: 0,
        limit: 10000
      }
    }).then(({tableContent = []}) => {
      return { tableContent };
    })
    // 经办职位
    let { tableContent: userRoleList } = await $flyio.ajax({
      url: '/H_roleplay-si/ds/getRoleByUserId',
      data: {
        userId,
        page: 1,
        start: 0,
        limit: 10000
      }
    }).then(({tableContent = []}) => {
      return { tableContent }
    })
    resolve({
      handleORG,
      userRoleList,
      userId,
      nickname,
      userCode,
    })
  });
};

// TODO 获取视图列表
export let getList = (viewId = 0, data = {}) => {
  return $flyio.ajax({
    url: `/H_roleplay-si/seconds/getReportInfoByListViewId/${viewId}`,
    data
  })
};

// TODO 上传图片
export let upload = ({file = {}, biReferenceId = ''}) => {
  return $flyio.upload({
    file,
    biReferenceId
  })
};

// TODO 获取企业微信临时素材
export let mediaUpload = ({mediaId = '', biReferenceId = ''}) => {
  let param = new FormData();  // 创建form对象
  param.append('mediaId', mediaId);  // 通过append向form对象添加数据
  if (biReferenceId) {
    param.append('biReferenceId', biReferenceId); // 添加form表单中其他数据
  }
  return $flyio.post({
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    url: '/H_roleplay-si/ds/mediaUpload',
    data: param
  })
};

// TODO 删除文件
export let deleteFile = (id = '') => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/delete',
    data: {
      _dc: Date.now(),
      id,
      list: 'attachments'
    }
  })
};

// TODO 获取加工属性
export let getDictByType = (type = '', data = {}) => {
  return $flyio.ajax({
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
  return $flyio.ajax({
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
  return $flyio.ajax({
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
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/list/getProcessByListId',
    data: {
      _dc: Date.now(),
      listId
    }
  })
};

// TODO 获取员工、客户、加工商、渠道商
export let getObjDealerByLabelName = (data = {}) => {
  return $flyio.ajax({
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
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/listUsers',
    data
  })
}
export let getGroupByUserId = (userId = '') =>{
  return $flyio.ajax({
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
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getRoleByUserId',
    data: {
      page: 1,
      start: 0,
      limit: 10000,
      userId
    }
  })
}
// TODO 获取转办人员列表
export let getUserList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/listUsers',
    data: {
      _dc: Date.now(),
      sort: JSON.stringify([{property: 'crtTime', direction: 'DESC'}]),
      ...data
    }
  })
};

// TODO 转办
export let transferTask = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/flow/setAssignee',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};
// 获取提交页面表单配置
export let getFormConfig = (viewId = '') => {
  return $flyio.ajax({
    url: `/H_roleplay-si/mobile/formView/${viewId}`
  })

}
// 获取提交页面表单配置
export let getFormViews = (listId = '') => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/list/getFormViews',
    data: {
      listId,
    }
  })

}
export let requestData = ({url = '', data = {}}) => {
  return $flyio.ajax({
    url,
    data
  })
}

// TODO 获取列表配置
export let getListViewById = (uniqueId) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/list/getListViewById',
    data: {
      _dc: Date.now(),
      uniqueId,
    }
  })
}

export default {
  getList,
  upload,
  mediaUpload,
  getProcess,
  getDictByType,
  submitAndCalc,
  getDictByValue,
  saveAndStartWf,
  getBaseInfoData,
  saveAndCommitTask,
  getProcessStatus,
  getObjDealerByLabelName,
  getUserList,
  transferTask,
  getFormConfig
}
