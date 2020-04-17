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
export let getGroupMsg = groupId =>{
    return $flyio.ajax({
        url:'/im/message/getGroupMessage?groupId=' + groupId
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
export let getEmployee = ()=>{
    return $flyio.ajax({
        url:'/ds/getEmployee'
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
