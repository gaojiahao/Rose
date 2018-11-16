/* 评论相关接口 */
import $axios from '../plugins/ajax';

// TODO 获取评论列表(PC)
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

// TODO 是否关注
export let isSubscribeByRelationKey = (relationKey = '') => {
  return $axios.ajax({
    url: '/H_roleplay-si/comment/isSubscribeByRelationKey',
    data: {
      relationKey
    }
  })
}
// ToDo 关注
export let subscribeApp = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/comment/subscribeApp',
    data: data
  })
  // return $axios.post({
  //   url: '/H_roleplay-si/comment/subscribeApp',
  //   data: {
  //     ...data
  //   }
  // })
}
// TODO 取关
export let unsubscribeApp = (data = {}) => {
  return $axios.ajax({
    type: 'POST',
    contentType: 'application/x-www-form-urlencoded',
    url: '/H_roleplay-si/comment/unsubscribeAppByRelationKey',
    data: data
  })
  // return $axios.post({
  //   url: 'H_roleplay-si/comment/unsubscribeAppByRelationKey',
  //   data
  // })
}
// TODO 获取关注的人数
export let getUserList = (data = {}) => {
  return $axios.ajax({
    url: '/H_roleplay-si/comment/getUserByRelationKey',
    data
  })
}

export default {
  getCommentList: getPCCommentList,
  saveComment,
  savePraise,
}

