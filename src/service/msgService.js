import $flyio from 'plugins/ajax';


// 消息代办列表
export let getMsgList = (data = {}) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/mobile/getTasksListData',
        data
    })
}
// 所有消息列表
export let getAllMsgList = (data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/getMyTasksAndLastNode',
        data
    })
}

export let getNotice = ( data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/getNotice',
        data
    })
}

// 获取点赞列表
export let getNoticeByPraise = ( data = {}) => {
    return $flyio.ajax({
        url: '/H_roleplay-si/mobile/getNoticeByPraise',
        data
    })
}

export let getMyGroups = ()=>{
    return $flyio.ajax({
        url:'/im/group/getMyGroups'
    })
}
export let sendMsg = (data)=>{
    return $flyio.postJSON({
        url:'/im/message/save',
        data
    })
}
export const checkMessage = (groupId) => $flyio.post({url:'/im/message/check?groupId='+groupId})
export let getGroupMsg = (groupId,page=0) =>{
    var data = {},
        pageSize = 20;
    if (page){
        data.page = page;//(page-1)*pageSize;
       // data.limit = pageSize;
    }
    return $flyio.ajax({
        url:'/im/message/getGroupMessage?groupId=' + groupId,
        data
    })
}
export let searchGroupMsg = (data)=>{
    return $flyio.ajax({
        url:'/im/message/getGroupMessage',
        data
    })
}
export let getMessagesByImType = (params) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/im/message/getMessageByImType',
        data:params
    });
}
export let getAddressBook = (id)=>{
    var data = id != '0'? {groupId:id}:undefined;

    return $flyio.ajax({
        url:'/im/group/getAddressBook',
        data
    })
}

/**
 * 获取所有员工
 */
export let getEmployee = (filter,page,limit)=>{
    let data = {
        filter: filter,
        limit: limit,
        page: page
    }
    return $flyio.ajax({
        url:'/ds/getEmployee',
        data
    })
}

/**
 * 查看消息的阅读情况
 */
export let getMsgCheckStatus = (msgId, checkType)=>{
    let data = {
        msgId: msgId,
        checkType: checkType
    }
    return $flyio.ajax({
        url:'/im/message/getMsgCheckStatus',
        data
    })
}

/**
 * 获取所有员工
 */
export let getMembers = (groupId)=>{
    var data = {
        groupId: groupId
    };

    return $flyio.ajax({
        url:'/im/group/getMembers', 
        data
    })
}

// 添加群成员
export let addMember = (data = {}) => {
    return $flyio.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: '/im/group/addMember',
      data
    })
  };

// 新增群组
export let createGroup = (data = {}) => {
    return $flyio.ajax({
      type: 'POST',
      contentType: 'application/x-www-form-urlencoded',
      url: '/im/group/create',
      data
    })
  };

 //删除群成员
export let removeMember = (data={}) => {
    return $flyio.ajax({
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        url: '/im/group/removeMember',
        data
      })
}

// 新增单聊
export let getGroupByUserId = (userId) => {
    var data = {
        userId: userId
    };
    return $flyio.ajax({
        url:'/im/group/getGroupByUserId', 
        data
    })
}

 //修改群名称
 export let setGroupName = (data={}) => {
    return $flyio.ajax({
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        url: '/im/group/setName',
        data
      })
}

// 根据搜索关键词获取导航信息
export let getGroupsByName = (name) => {
    var data = {
        name: name
    };
    return $flyio.ajax({
        url:'/im/group/getGroupsByName', 
        data
    })
}

 //消息置顶
 export let setFocus = (data={}) => {
    return $flyio.ajax({
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        url: '/im/group/setFocus',
        data
      })
}

 //消息取消置顶
 export let deleteFocus = (data={}) => {
    return $flyio.ajax({
        type: 'POST',
        contentType: 'application/x-www-form-urlencoded',
        url: '/im/group/delFocus',
        data
      })
}

// 获取用户详情
export let getUserInfoById = (userId) => {
    var data = {
        userId: userId
    };
    return $flyio.ajax({
        url:'/ds/getUserInfoById', 
        data
    })
}
// 通过消息ID获取消息所在分页信息
export const getGroupMsgById = (groupId,msgId)=>{
    return $flyio.ajax({
        url:'/im/message/getGroupMsgById',
        data:{
            groupId:groupId,
            msgId:msgId,
            limit:20
        }
  });
}
// 通过ID获取群信息
export const getGroupById = (groupId)=>{
    return $flyio.ajax({
        url:'im/group/getGroupById',
        data:{
            groupId:groupId
        }
  });
}
  
