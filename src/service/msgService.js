import $flyio from 'plugins/ajax';


// 消息代办列表
export let getMsgList = (data = {}) => {
    return $flyio.ajax({
        url:'/H_roleplay-si/ds/getTasksListData',
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

/// 新增单聊
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
