import {numberPad, dateFormat} from 'vux'

export default {
  methods: {
    // TODO 时间戳转日期
    changeDate(d, hasSecond = false) {
      if (!d) {
        return '';
      }
      if (typeof d === 'string') {
        d = d.replace(/-/g, '/').replace(/\..*/g, '');
      }
      let fmt = 'YYYY-MM-DD';
      if (hasSecond) {
        fmt = 'YYYY-MM-DD HH:mm:ss';
      }
      return dateFormat(d, fmt)
    },
  }
}
