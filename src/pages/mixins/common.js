import {numberPad} from 'vux'

export default {
  data() {
    return {
      showToast: false,
      toastText: '',
      showLoading: false, // 是否展示loading
    }
  },
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
      let date = new Date(d);
      return `${date.getFullYear()}-${numberPad(date.getMonth() + 1)}-${numberPad(date.getDate())}`
    },
  }
}
