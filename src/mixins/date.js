import {numberPad} from 'vux'

let dateMixin = {
  methods: {
    // TODO 获取昨日、本日、本周、本月、本年的起始和结束日期
    getDate(type = '') {
      let now = new Date();
      let dayTime = 24 * 3600 * 1000; // 一天的毫秒数
      let date1 = '';
      let date2 = `${now.getFullYear()}-${numberPad(now.getMonth() + 1)}-${numberPad(now.getDate())}`;
      switch (type) {
        case 'yesterdays':
          let yesterdays = new Date(now - dayTime);
          let yes = `${yesterdays.getFullYear()}-${numberPad(yesterdays.getMonth() + 1)}-${numberPad(yesterdays.getDate())}`;
          date1 = yes;
          date2 = yes;
          break;
        case 'days':
          let days = `${now.getFullYear()}-${numberPad(now.getMonth() + 1)}-${numberPad(now.getDate())}`;
          date1 = days;
          break;
        case 'weeks':
          let curDay = now.getDay() !== 0 ? now.getDay() : 7;
          let weeks = new Date(now - (curDay - 1) * dayTime); // 获取周一的日期
          date1 = `${weeks.getFullYear()}-${numberPad(weeks.getMonth() + 1)}-${numberPad(weeks.getDate())}`;
          break;
        case 'months':
          date1 = `${now.getFullYear()}-${numberPad(now.getMonth() + 1)}-01`;
          break;
        case 'years':
          date1 = `${now.getFullYear()}-01-01`;
          break;
        default:
          date1 = date2;
          break;
      }
      return {
        date1: date1,
        date2: date2
      };
    },
  }
};

export default dateMixin