import Vue from 'vue'
import App from './App'
import router from './router'
import FastClick from 'fastclick'
import adapation from './common/adapation'
import Swiper from './common/swiper-4.2.2.min.js'
import VueTouch from 'vue-touch'
import RText from './components/public/RText'
import RDateField from './components/public/DateField'
import RDatetimeField from './components/public/DatetimeField'
import RPermilField from './components/public/PermilField'
import RPercentField from './components/public/PercentField'
import RNumberField from './components/public/NumberField'
import RComboField from './components/public/ComboField'
import R2MultiSelector from './components/public/MultiSelector'
import R2Checkbox from './components/public/CheckboxField'
import R2TextArea from './components/public/R2TextArea'
import columnItem from './components/public/column/Item'
import columnTitle from './components/public/column/Title'
import fieldset from './components/public/Fieldset'
import fieldsetCt from './components/public/FieldsetCt'
import grid from './components/public/Grid'
import ReadOnlyPart from './components/public/ReadOnlyPart'
import BaseInfoPart from './components/public/BaseInfoPart'
import gridDetail from './components/public/GridDetail'
import transactorView from './components/public/TransactorView'
import matterListView from './components/public/MatterListView'
import matterItem from './components/public/MatterItem'
import BaseinfoView from './components/public/BaseinfoView'
import BomListView from './components/public/BomListView'
import WFlow from './components/public/WFlow'
import Fileupload from './components/public/Fileupload'
import ContentView from './components/public/ContentView'
import R2Action from './components/public/R2Action'
import SlideBar from './components/public/SlideBar'
import ListItem from './components/public/ListItem'
import AutoSubject from './components/public/AutoSubject'
import AppExample from './components/public/AppExample'
import { AlertPlugin, ConfirmPlugin, ToastPlugin, TransferDom, DatetimePlugin } from 'vux'
import Loading from 'plugins/loading/pageLoad/loading'
import HandleLoad from 'plugins/loading/handleLoad/handleLoading'
import platfrom from './plugins/platform/index'
import commonService from "service/commonService";

require('@/directive')
if(window.isApp){
  require('service/pushService');
}

Vue.use(Loading)
Vue.use(HandleLoad)
Vue.use(ToastPlugin)
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)
Vue.use(DatetimePlugin)
Vue.use(VueTouch,{name:'v-touch'})
Vue.directive('transfer-dom', TransferDom)

Vue.prototype.Swiper = Swiper;
FastClick.attach(document.body)

const isDebug_mode = process.env.NODE_ENV !== 'production'
Vue.config.debug = isDebug_mode
Vue.config.devtools = isDebug_mode
Vue.config.productionTip = true
// 此处声明空实例 用于非父子组件之间传值
Vue.prototype.$event = new Vue();
Vue.clone = function(a){
   return JSON.parse(JSON.stringify(a));
};
router.afterEach((to, from) => {
  document.title = to.meta.title || '';
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')


/* eslint-disable no-new */

FastClick.prototype.focus = function(targetElement) {
  var length;
  //兼容处理:在iOS7中，有一些元素（如date、datetime、month等）在setSelectionRange会出现TypeError
  //这是因为这些元素并没有selectionStart和selectionEnd的整型数字属性，所以一旦引用就会报错，因此排除这些属性才使用setSelectionRange方法
  if (platfrom.isIOS && targetElement.setSelectionRange && targetElement.type.indexOf('date') !== 0 && targetElement.type !== 'time' && targetElement.type !== 'month' && targetElement.type !== 'email') {
      length = targetElement.value.length;
      targetElement.setSelectionRange(length, length);
      /*修复bug ios 11.3不弹出键盘，这里加上聚焦代码，让其强制聚焦弹出键盘*/
      targetElement.focus();
  } else {
      targetElement.focus();
  }
};

