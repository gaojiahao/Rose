import $axios from '../plugins/ajax'

let todoService = {
  // TODO 返回代办列表
  getList(data = {}) {
    return $axios.ajax({
      url: '/H_roleplay-si/ds/getMyToDoTask',
      data: {
        page: data.page,
        start: 0,
        limit: 10
      }
    });
  }
};

export default todoService
