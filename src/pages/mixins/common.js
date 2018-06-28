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
    changeDate(d) {
      if (!d) {
        return '';
      }
      if (typeof d === 'string') {
        d = d.replace(/-/g, '/');
      }
      let date = new Date(d);
      return `${date.getFullYear()}-${numberPad(date.getMonth() + 1)}-${numberPad(date.getDate())}`
    },
  }
}
