import Vue from 'vue';
import { AlertModule } from 'vux'

// 错误处理回调
export default function errorHandler(err) {
  if (err && ( err.includes('查询') || err.includes('database'))) {
    err = '抱歉，数据似乎出了点问题，请稍后重试'
  }
  // 弹窗提醒
  AlertModule.show({
    title: '提示',
    content: err,
    onHide: () => {
      Vue.prototype.$loading.hide();
      Vue.prototype.$HandleLoad.hide();
    }
  });
};