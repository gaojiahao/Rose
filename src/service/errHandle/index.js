import Vue from 'vue';
import {AlertModule} from 'vux'

// 错误处理回调
export default function errorHandler(err){
  AlertModule.show({
    content: err,
    onHide(){
      history.go(-1);
      Vue.prototype.$loading.hide();
    }
  });
  return Promise.reject(err)
};