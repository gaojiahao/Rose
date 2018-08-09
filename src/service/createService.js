import $axios from '../plugins/ajax'

let createService = {
  // TODO 获取配置
  getConfig(data = {}) {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/list/getFormViewById',
      data
    });
  },
  // TODO 获取remote数据
  getRemoteData(url, data) {
    return $axios.ajax({
      url: url,
      data: Object.assign({
        page: 1,
        start: 0,
        limit: 10000,
      }, data)
    });
  },
  // TODO 获取节点数据
  getProcess(data = {}) {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/list/getProcessByListId',
      data
    });
  },
  // TODO 提交数据(有工作流)
  saveAndStartWfOld(data = {}) {
    return $axios.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: '/H_roleplay-si/ds/saveAndStartWf',
      data: Object.assign({
        conn: 20000,
        list: 'trans_form_data',
        transCode: ''
      }, data)
    });
  },
  // TODO 重新提交(有工作流)
  saveAndCommitTaskOld(data = {}) {
    return $axios.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: '/H_roleplay-si/ds/saveAndCommitTask',
      data: Object.assign({
        conn: 20000,
        list: 'trans_form_data',
        transCode: ''
      }, data)
    });
  },
  // TODO 提交数据(有工作流)
  saveAndStartWf(data = {}) {
    return $axios.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: '/H_roleplay-si/formAPI/saveAndStartWf',
      data: data
    });
  },
  // TODO 重新提交
  saveAndCommitTask(data = {}) {
    return $axios.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: '/H_roleplay-si/formAPI/saveAndCommitTask',
      data: data
    });
  },
  // TODO 提交数据
  saveData(data = {}) {
    return $axios.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: '/H_roleplay-si/ds/saveData',
      data: Object.assign({
        conn: 20000,
        list: 'trans_form_data',
        transCode: ''
      }, data)
    });
  },
  // TODO 获取当前用户
  getUser() {
    return $axios.ajax({
      url: '/H_roleplay-si/userInfo/currentUser',
    });
  },
  // TODO 获取当前用户的信息
  getCurrentUser(name) {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/listUsers',
      data: {
        limit: 1,
        filter: JSON.stringify([{
          operator: 'eq',
          value: name,
          property: 'nickname'
        }])
      }
    });
  },
  // TODO 获取省份、城市、费用所属事业部、费用所属部门、核算归属省份、费用所属银行
  getAccountingUnitByid(data = {}) {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/getAccountingUnitByid',
      data: Object.assign({
        key: 'N1',
        parentId: '8263fabe-365f-404e-9036-c546c8376e23',
        name1: '111',
        name2: '111',
        name3: '111',
        page: 1,
        start: 0,
        limit: 10000
      }, data)
    });
  },
  // TODO 获取省长、常委
  getChangWei(data = {}) {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/getChangWei',
      data: Object.assign({
        name: '常委',
        page: 1,
        start: 0,
        limit: 20,
      }, data)
    })
  },
  // TODO 获取用户基本信息
  getBaseInfoData() {
    return $axios.ajax({
      url: '/H_roleplay-si/trans/getModelData?refresh=true&dsCode=getUserDetails',
    })
  },
  // TODO 获取表单详情
  getFormData({formKey = '', transCode = ''}) {
    return $axios.ajax({
      url: `/H_roleplay-si/formAPI/findData/${formKey}/${transCode}`,
    })
  },
  // TODO 获取任务ID
  getTaskId(transCode) {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/listTaskLogByTransCode',
      data: {
        transCode
      }
    });
  },
  // TODO 同意/不同意
  examineTask(taskId, data = {}) {
    return $axios.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: `/H_roleplay-si/flow/${taskId}/commitTask`,
      data: {
        // jsonData: {"result": 1, "transCode": "CLFYBX_1711_1091", "comment": "审批意见"} 同意
        // jsonData: {"result":0,"transCode":"CLFYBX_1710_0996","comment":"审批意见"} 不同意
        jsonData: JSON.stringify(data)
      }
    });
  },
  // TODO 查找工作流
  getWorkFlow(data = {}) {
    return $axios.ajax({
      // url: '/H_roleplay-si/ds/list/getHistoryTaskByTransCode',
      url: '/H_roleplay-si/ds/list/getAppHistoryTaskByTransCode',
      data: data
    });
  },
  // TODO 查询提交的数据
  getJsonData(referenceId = '') {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/getJsonDataByReferenceId',
      data: {
        _dc: Date.now(),
        referenceId,
      }
    });
  },
};

export default createService
