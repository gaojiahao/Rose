/* 评论相关接口 */
import $axios from '../plugins/ajax';

// TODO 获取pc评论列表
export let getPCCommentList = (data = {}) => {
  return $axios.ajax({
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

// TODO 获取评论列表
export let getCommentList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getMobileCommentByTransCode',
    data: {
      page: 1,
      limit: 10,
      ...data,
    }
  })
};

// TODO 获取回复列表
export let getReply = (data = {}) => {
  return $axios.ajax({
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

// TODO 发送评论
export let saveComment = (data = {}) => {
  return $axios.post({
    url: '/H_roleplay-si/comment/saveComment',
    data: {
      commentAndReply: false,
      commentAttachments: [],
      type: "instance",
      ...data,
    }
  })
};

// TODO 点赞
export let savePraise = (commentId = '') => {
  return $axios.post({
    url: '/H_roleplay-si/comment/savePraise',
    data: {
      commentId
    }
  })
};
//获取应用的详情
export let getAppDetail = (uniqueId = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/list/getListById',
    data: {
      uniqueId
    }
  })
};
//获取更新日志列表
export let getChangeLog = (data={}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getChangeLog',
    data
  })
};
//获取管理员自评列表
export let getAdminCommentList = (data={}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/ds/getAssessmentByListId',
    data
  })
};
export default {
  getAppDetail,
  getChangeLog,
  getAdminCommentList,
  getPCCommentList

}

