import $axios from '../plugins/ajax';


// TODO 保存项目立项
export let saveProjectApproval = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectApproval/save',
    data
  })
};

// TODO 修改项目立项
export let updateProjectApproval = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectApproval/save',
    data
  })
};

// TODO 查看项目立项
export let findProjectApproval = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectApproval/findData',
    data: {transCode}
  })
};

// TODO 保存项目计划
export let saveProjectPlan = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectPlan/save',
    data
  })
};

// TODO 修改项目计划
export let updateProjectPlan = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectPlan/update',
    data
  })
};

// TODO 查看项目计划
export let findProjectPlan = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectPlan/findData',
    data: {transCode}
  })
};

// TODO 保存项目任务
export let saveProjectTask = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectTask/save',
    data
  })
};

// TODO 修改项目任务
export let updateProjectTask = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectTask/update',
    data
  })
};

// TODO 查看项目任务
export let findProjectTask = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectTask/findData',
    data: {transCode}
  })
};

// TODO 保存项目结项
export let saveProjectConclusion = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectConclusion/save',
    data
  })
};

// TODO 修改项目结项
export let updateProjectConclusion = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/projectConclusion/update',
    data
  })
};

// TODO 查看项目结项
export let findProjectConclusion = (transCode = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectConclusion/findData',
    data: {transCode}
  })
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
  })
};

// TODO 获取项目列表自动填充字段带出
export let getProjectApproval = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getProjectApprovalAll',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
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
  })
};
//TODO获取费用报销中的项目列表
export let getProjectList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getProjectApproval',
    data
  })
};

//TODO 项目计划列表
export let getProjectPlanList = (listViewID, data = {}) => {
  return $axios.ajax({
    // url: '/H_roleplay-si/ds/getProjectPlan',
    url: `/H_roleplay-si/mobile/getProjectPlan/${listViewID}`,
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

//TODO 销售出库获取项目列表接口
export let getSalesOutStockProject = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getSalesOutStockProject',
    data: {
      _dc: Date.now(),
      ...data
    }
  })
};

// TODO 查询项目对应的实际、预算、差额
export let findConclusion = (projectName) => {
  return $axios.ajax({
    url: '/H_roleplay-si/projectConclusion/findConclusion',
    data: {
      _dc: Date.now(),
      projectName
    }
  })
};

export default {}
