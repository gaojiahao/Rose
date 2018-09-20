/* 评论相关接口 */
import $axios from '../plugins/ajax';

// TODO 获取评论列表
export let getCommentList = (data = {}) => {
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

export default {
  getCommentList,
  saveComment,
  savePraise,
}

