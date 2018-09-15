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
      // 列表数据出现任何错误都不用返回
      if(location.pathname.indexOf('list') === -1){
        history.go(-1);
        Vue.prototype.$loading.hide();
        Vue.prototype.$HandleLoad.hide();
      }
      
    }
  });
};