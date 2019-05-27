import Vue from 'vue'
import App from './App'
import router from './router'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import adapation from './common/adapation'
import Swiper from './common/swiper-4.2.2.min.js'
import RText from './components/public/RText'
import columnItem from './components/public/column/Item'
import columnTitle from './components/public/column/Title'
import fieldset from './components/public/Fieldset'
import grid from './components/public/Grid'
import transactorView from './components/public/TransactorView'
import matterListView from './components/public/MatterListView'
import matterItem from './components/public/MatterItem'
import { AlertPlugin, ConfirmPlugin, ToastPlugin, TransferDom, DatetimePlugin } from 'vux'
import Loading from 'plugins/loading/pageLoad/loading'
import HandleLoad from 'plugins/loading/handleLoad/handleLoading'

Vue.use(Loading)
Vue.use(VueRouter)
Vue.use(HandleLoad)
Vue.use(ToastPlugin)
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)
Vue.use(DatetimePlugin)
Vue.directive('transfer-dom', TransferDom)

Vue.prototype.Swiper = Swiper;
FastClick.attach(document.body)

const isDebug_mode = process.env.NODE_ENV !== 'production'
Vue.config.debug = isDebug_mode
Vue.config.devtools = isDebug_mode
Vue.config.productionTip = true
// 此处声明空实例 用于非父子组件之间传值
Vue.prototype.$event = new Vue();

router.afterEach(route => {
  document.title = route.meta.title || '';
})

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
