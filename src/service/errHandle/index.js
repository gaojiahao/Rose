import Vue from 'vue';
import {AlertModule} from 'vux'

// 错误处理回调
export default function errorHandler(err){
  if(err && err.includes('database')){
    err = '抱歉，查看数据失败'
  }
  // 弹窗提醒
  AlertModule.show({
    content: err,
    onHide(){
      Vue.prototype.$loading.hide();
      Vue.prototype.$HandleLoad.hide();
    }
  });
};