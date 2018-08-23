import $axios from '../plugins/ajax';
import {AlertModule} from 'vux'

// TODO 错误处理回调
let errorHandler = (e) => {
  AlertModule.show({
    content: e.message,
  });
  return Promise.reject(e)
};

// TODO 保存项目立项
export let saveProjectApproval = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectApproval/save',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 修改项目立项
export let updateProjectApproval = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectApproval/save',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 查看项目立项
export let findProjectApproval = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectApproval/findData',
    data: {transCode}
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 保存项目计划
export let saveProjectPlan = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectPlan/save',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 修改项目计划
export let updateProjectPlan = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectPlan/update',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 查看项目计划
export let findProjectPlan = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectPlan/findData',
    data: {transCode}
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 保存项目任务
export let saveProjectTask = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectTask/save',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 修改项目任务
export let updateProjectTask = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectTask/update',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 查看项目任务
export let findProjectTask = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectTask/findData',
    data: {transCode}
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 保存项目结项
export let saveProjectConclusion = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectConclusion/save',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 修改项目结项
export let updateProjectConclusion = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectConclusion/update',
    data
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 查看项目结项
export let findProjectConclusion = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectConclusion/findData',
    data: {transCode}
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取项目列表
export let getProjectPlanProjectName = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getProjectPlanProjectName',
    data: {
      _dc: Date.now(),
      page: 1,
      start: 0,
      limit: 10000,
      ...data
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取项目列表自动填充字段带出
export let getProjectApproval = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getProjectApprovalAll',
    data: {
      _dc: Date.now(),
      ...data
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

// TODO 获取项目相关的任务列表
export let getProjectTodoTask = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getProjectTodoTask',
    data: {
      _dc: Date.now(),
      page: 1,
      start: 0,
      limit: 100,
      ...data
    }
  }).catch(e => {
    return errorHandler(e);
  });
};

export default {}
