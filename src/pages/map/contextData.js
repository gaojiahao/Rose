import {numberPad} from 'vux'

let contextData = {
  // 获取用户名
  'currentUser.name': function () {
    return this.info.nickname;
  },
  'currentUser.id': function () {
    return '';
  },
  // 获取区域
  'currentUser.areas[0].name': function () {
    let areas = this.info.area && this.info.area.split(',') || [];
    return areas[0] || '';
  },
  // 获取部门名称
  'currentUser.depts[0].name': function () {
    let depts = this.info.dept && this.info.dept.split(',') || [];
    return depts[0] || '';
  },
  // 获取角色名称
  'currentUser.roles[0].name': function () {
    let roles = this.info.role && this.info.role.split(',') || [];
    return roles[0] || '';
  },
  // 获取时间
  'date.now': function (fmt = 'Y-m-d H:i:s') {
    let date = new Date();
    let dateObj = {
      Y: date.getFullYear(),
      m: numberPad(date.getMonth() + 1),
      d: numberPad(date.getDate()),
      H: numberPad(date.getHours()),
      i: numberPad(date.getMinutes()),
      s: numberPad(date.getSeconds()),
    };
    let dateStr = fmt;
    Object.entries(dateObj).forEach(([key, value]) => {
      dateStr = dateStr.replace(key, value);
    });
    return dateStr
  }
};

export default {
  info: {},
  setInfo(info) {
    this.info = info;
  },
  getContext(key = '') {
    if (typeof contextData[key] !== 'function') {
      return '';
    }
    return contextData[key].call(this);
  },
}
