import Vue from 'vue';
import {AlertModule} from 'vux'

// 错误处理回调
export default function errorHandler(err){
  if(err && err.includes('查看数据错误')){
    err = '查看数据失败，请联系IT服务商'
  }
  // 弹窗提醒
  AlertModule.show({
    content: err,
    onHide(){
      history.go(-1);
      Vue.prototype.$loading.hide();
    }
  });
};