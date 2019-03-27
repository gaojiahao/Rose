import $flyio from 'plugins/ajax';

// 获取pc评论列表
export let getPCCommentList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/comment/getCommentByRelationKey',
    data: {
      sort: JSON.stringify([{"property": "crtTime", "direction": "DESC"}]),
      page: 1,
      limit: 10,
      total: 0,
      ...data,
    }
  })
};

// 获取评论列表
export let getCommentList = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getMobileCommentByTransCode',
    data: {
      page: 1,
      limit: 10,
      ...data,
    }
  })
};

// 获取回复列表
export let getReply = (data = {}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/comment/getCommentByParentId',
    data: {
      sort: JSON.stringify([{"property":"crtTime","direction":"ASC"}]),
      parentId: 145657,
      page: 1,
      limit: 10,
      ...data,
    }
  })
};

// 发送评论
export let saveComment = (data = {}) => {
  return $flyio.post({
    url: '/H_roleplay-si/comment/saveComment',
    data: {
      commentAndReply: false,
      commentAttachments: [],
      type: "instance",
      ...data,
    }
  })
};

// 点赞
export let savePraise = (commentId = '') => {
  return $flyio.post({
    url: '/H_roleplay-si/comment/savePraise',
    data: {
      commentId
    }
  })
};

// 获取 应用的基本信息（权限、图标、管理员等）
export let getAppDetail = (uniqueId = '') => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/list/getListById',
    data: {
      uniqueId
    }
  })
};

// 获取 更新日志列表
export let getChangeLog = (data={}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getChangeLog',
    data
  })
};

// 获取 管理员自评列表
export let getAdminCommentList = (data={}) => {
  return $flyio.ajax({
    url: '/H_roleplay-si/ds/getAssessmentByListId',
    data
  })
};

// 提交日志
export let saveLog = (data={}) => {
  return $flyio.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/app/saveLog',
    data
  })
}

// 提交管理员自评
export let saveAssessment = (data={}) => {
  return $flyio.post({
    url: '/H_roleplay-si/app/saveAssessment',
    data
  })
}
export default {}

