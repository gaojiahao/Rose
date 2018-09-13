import $axios from '../plugins/ajax';
import errHandle from './errHandle'

// TODO 保存项目立项
export let saveProjectApproval = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectApproval/save',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 修改项目立项
export let updateProjectApproval = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectApproval/save',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 查看项目立项
export let findProjectApproval = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectApproval/findData',
    data: {transCode}
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 保存项目计划
export let saveProjectPlan = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectPlan/save',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 修改项目计划
export let updateProjectPlan = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectPlan/update',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 查看项目计划
export let findProjectPlan = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectPlan/findData',
    data: {transCode}
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 保存项目任务
export let saveProjectTask = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectTask/save',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 修改项目任务
export let updateProjectTask = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectTask/update',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 查看项目任务
export let findProjectTask = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectTask/findData',
    data: {transCode}
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 保存项目结项
export let saveProjectConclusion = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectConclusion/save',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 修改项目结项
export let updateProjectConclusion = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectConclusion/update',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

// TODO 查看项目结项
export let findProjectConclusion = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectConclusion/findData',
    data: {transCode}
  }).catch(e => {
    return errHandle(e);
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
    return errHandle(e);
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
    return errHandle(e);
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
    return errHandle(e);
  });
};
//TODO获取费用报销中的项目列表
export let getProjectList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getProjectApproval',
    data
  }).catch(e => {
    return errHandle(e);
  });
};

//TODO 项目计划列表
export let getProjectPlanList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getProjectPlan',
    data: {
      _dc: Date.now(),
      ...data
    }
  }).catch(e => {
    return errHandle(e);
  });
};

//TODO 销售出库获取项目列表接口
export let getSalesOutStockProject = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getSalesOutStockProject',
    data: {
      _dc: Date.now(),
      ...data
    }
  }).catch(e => {
    return errHandle(e);
  });
};

export default {}
