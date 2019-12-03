import $flyio from 'plugins/ajax'
import {dateFormat} from 'vux'
let baseInfo;

exports.addBaseObject = (baseObjectKey,apiKey,data) =>{
    return $flyio.postJSON({
      url:['/', baseObjectKey, apiKey].join(''),
      data:data
    })
}
export let commitTask = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/flow/commitTask',
    data
  })
}
export let convertDataType = function (editorType, value) {
  if (!editorType) {
      return value;
  }
  switch (editorType) {
      case 'r2Numberfield':
      case 'r2Percentfield':
          value = isNaN(value) ? value : parseFloat(value);
          break;
      default:
          break;
  }
  return value;
}
// 删除文件
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
export let WebContext = {};
export let requestData = ({url = '', data = {}}) => {
  return $flyio.ajax({
    url,
    data
  })
}
// 保存
export let saveAndStartWf = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/saveAndStartWf',
    data: data
  })
};

// 修改
export let saveAndCommitTask = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/saveAndCommitTask',
    data: data
  })
};

// 保存(没有工作流)
export let submitAndCalc = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/submitAndCalc',
    data: data
  })
};
// 转办
export let transferTask = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/flow/setAssignee',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
};
// 修改(没有工作流)
export let updateData = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/updateData',
    data: data
  })
};

// 修改项目(没有工作流)
export let update = (data = {}) => {
  return $flyio.post({
    url: '/H_roleplay-si/projectApproval/update',
    data
  })
}


// 获取当前用户信息(基础对象调用)
export let getBaseInfoDataBase = () => {
  return new Promise(async (resolve, reject) => {
    let {currentUser,clientFlag} = await getBasicInfo().then(data => {
      return data
    })
    let {nickname, userId} = currentUser;
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
        clientFlag: clientFlag,
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
//获取baseinfo信息,界面全局信息
export let getBasicInfo = (data ={})=> {
  return new Promise((resolve,reject)=>{
     if(baseInfo == null){
        $flyio.ajax({
          url: `/H_roleplay-si/app/getBasicInfo`,
          data: {
            _dc: Date.now(),
          }
        }).then(data=>{
          baseInfo = data;
          resolve(data);
        }).catch(()=>{
          reject();
        })
     } else {
       resolve(baseInfo);
     }
  })
  return 
};
// 获取视图列表
export let getList = (viewId = 0, data = {}) => {
  return $flyio.ajax({
    url: `/H_roleplay-si/seconds/getReportInfoByListViewId/${viewId}`,
    data
  })
};

// 上传图片
export let upload = ({file = {}, biReferenceId = ''}) => {
  return $flyio.upload({
    file,
    biReferenceId
  })
};

// 获取企业微信临时素材
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



// 获取加工属性
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

// 获取材料大类、材料子类
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

// 获取工作流的processCode
export let getProcess = (listId = '') => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/list/getProcessByListId',
    data: {
      _dc: Date.now(),
      listId
    }
  })
};

// 获取员工、客户、加工商、渠道商
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
export let initWebContext = ()=>{
  return new Promise((resolve, reject) => {
    if(WebContext.currentUser){
      return resolve();
    }
    getBasicInfo().then(baseInfo => {
        let user = baseInfo && baseInfo.currentUser;
        if (user) {
          WebContext.currentUser = {
              userId: user.userId,
              name: user.nickname,
              email: user.email,
              gender: user.gender,
              mobile: user.mobile,
              photo: user.photo,
              entityId: user.entityId,
              entityName: user.entityName,
              userCode: user.userCode,
              sysDeptList: user.sysDeptList,
              sysRoleList: user.sysRoleList,
              isSysRoleList:user.isSysRoleList,
              sysGroupList:user.sysGroupList,
              depts: user.sysGroupList.filter(function (o) {
                  return o.groupType != 'C';
              }).map(function (o) {
                  return {
                      id: o.groupId,
                      name: o.groupName,
                      parentId: o.parentId
                  };
              }),
              areas: user.sysGroupList.filter(function (o) {
                  return o.groupType === 'A';
              }).map(function (o) {
                  return {
                      id: o.groupId,
                      name: o.groupName,
                      parentId: o.parentId
                  };
              }),
              roles: user.sysRoleList.filter(function (o) {
                  return o.id != -1;
              }).map(function (o) {
                  return {
                      id: o.id,
                      name: o.name,
                      parentId: o.parentId
                  };
              }),
              isAdmin: Array.isArray(user.isSysRoleList) ? user.isSysRoleList.filter(function (o) {
                  return o.id == 1;
              }).length : false
          };
          if (user.enterpriseInfo){
             WebContext.enterpriseInfo = user.enterpriseInfo;
          }
      }
      resolve();
    }).catch(e=>{
      
    }) 
  })
};
export let getValuesByExp = (expression) => {
  var fn = function () {
      var ns = expression.split('.'),
          objNs = 'WebContext.' + ns.shift(),
          obj = eval(objNs);

      while (ns.length && obj) {
          objNs = objNs + '.' + ns.shift();
          obj = eval(objNs);
      }
      return obj;
  };

  try {
      if (/^currentUser/.test(expression) || /^listInfo/.test(expression)) {
          return fn(expression);
      } else if (/^date\.now$/i.test(expression)) {
          return dateFormat((new Date()), 'YYYY-MM');
      } else if (/^date\.currentDate$/i.test(expression)) {
          return dateFormat((new Date()), 'YYYY-MM-DD');
      } else if (/^date\.currentDateTime$/i.test(expression)) {
          return dateFormat((new Date()), 'YYYY-MM-DD HH:mm:ss');
      }
  } catch (ex) {
      console.log(ex);
      return null;
  }
};
// 获取搜索选择器数据
export let listSearchSelectorData = (URL, data = {}) => {
  return $flyio.ajax({
    url: `/H_roleplay-si/${URL}`,
    data
  })
}
// 获取所有的经办人
export let listUsers = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/listUsers',
    data
  })
}
export let getGroupByUserId = (userId = '') => {
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
export let getRoleByUserId = (userId = '') => {
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
// 获取转办人员列表
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


// 获取数量上线和下线
export let getPriceFromSalesContractAndPrice = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/formAPI/getPriceFromSalesContractAndPrice',
    data: {
      _dc: Date.now(),
      ...data,
    }
  })
}
// 获取物料的物料的单价和税率（目前用于原料采购订单）
export let getPriceFromProcurementContract = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/json',
    url: '/H_roleplay-si/formAPI/getPriceFromProcurementContract',
    data: JSON.stringify(data)
  })
}
// 获取提交页面表单配置
export let getFormConfig = (viewId = '') => {
   return $flyio.ajax({
    url: `/H_roleplay-si/mobile/formView/${viewId}`
   })

}
export let getFormViewByUniqueId = (uniqueId) =>{
   return $flyio.ajax({
    url: `/H_roleplay-si/form/${uniqueId}/view`
   })
}
export let loadModelCfg = (listId)=>{
  return $flyio.ajax({
    url: `/H_roleplay-si/ds/getModelConfigByListId`,
    data:{
      listId:listId
    }
   })
}
// 获取提交页面表单二次配置
export let findConfigInfo = (viewId = '') => {
  return $flyio.ajax({
    url: `/H_roleplay-si/easy/formViewClient/findConfigInfo`,
    data: {
      _dc: Date.now(),
      formViewId: viewId,
    }
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

export let getFromStatus = (data ={})=> {
  return $flyio.ajax({
      url:'/H_roleplay-si/ds/getFromStatusByTransCode',
      data
  })
}
// 获取表单要提交的字段
export let getModelConfigByListId = (listId = '') => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getModelConfigByListId',
    data: {
      listId,
    }
  })

}



// 获取列表配置
export let getListViewById = (uniqueId) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/list/getListViewById',
    data: {
      _dc: Date.now(),
      uniqueId,
    }
  })
}
//撤销为草稿
export let undoDataByTransCodes = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/undo',
    data
  })
}
export let updateAppData = (opration,data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/formAPI/' + opration,
    data
  })
}
exports.updateBaseObject = (baseObjectKey,apiKey,data) =>{
  return $flyio.postJSON({
    url:['/', baseObjectKey, apiKey].join(''),
    data:data
  })
}
//归档
export let archiveDataByTransCodes = (data ={}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/archive/perform',
    data
  })  
}
//还原
export let switchToEffectiveByTransCodes = (data = {}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/archive/switchToEffective',
    data
  })
}

export default {
  convertDataType,
  getList,
  upload,
  mediaUpload,
  initWebContext,
  WebContext,
  getProcess,
  getDictByType,
  getBasicInfo,
  submitAndCalc,
  getDictByValue,
  saveAndStartWf,
  saveAndCommitTask,
  getProcessStatus,
  getObjDealerByLabelName,
  getUserList,
  transferTask,
  getFormConfig,
  undoDataByTransCodes
}
