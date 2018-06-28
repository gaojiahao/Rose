import {Toast, numberPad} from 'vux'
import Loading from './../components/loading'

export default {
  data() {
    return {
      showToast: false,
      toastText: '',
      showLoading: false, // 是否展示loading
    }
  },
  components: {Toast, Loading},
  methods: {
    // TODO 显示错误提示
    showToastText(test = '') {
      this.showToast = true;
      this.toastText = test;
    },
    // TODO 时间戳转日期
    changeDate(d, hasSecond = false) {
      if (!d) {
        return '';
      }
      if (typeof d === 'string') {
        d = d.replace(/-/g, '/');
      }
      let date = new Date(d);
      let dateObj = {
        Y: date.getFullYear(),
        m: numberPad(date.getMonth() + 1),
        d: numberPad(date.getDate()),
        H: numberPad(date.getHours()),
        i: numberPad(date.getMinutes()),
        s: numberPad(date.getSeconds()),
      };
      let fmt = 'Y-m-d';
      if (hasSecond) {
        fmt = 'Y-m-d H:i:s';
      }
      Object.entries(dateObj).forEach(([key, value]) => {
        fmt = fmt.replace(key, value);
      });
      return fmt;
    },
  }
}
