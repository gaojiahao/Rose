import $flyio from '../plugins/ajax'

let getTaskService = {
  // TODO 返回待处理列表
  getDoList(id,page) {
    return $flyio.ajax({
      url: '/H_roleplay-si/ds/getTasksListDataByListId',
      data: {
        entityId: 20000,
        listID: id,
        para1: '',
        page: page,
        start: 0,
        
        limit: 11
      }
    })
  },
  //获取进行中列表
  getList(id,page,status) {
    return $flyio.ajax({
        url: '/H_roleplay-si/ds/getCompletedByStatusAndListId',
        data: {
          entityId: 20000,
          listID: id,
          status: status,
          page: page,
          start: 0,
          limit: 11,
        }
    })
  }

};
export default getTaskService