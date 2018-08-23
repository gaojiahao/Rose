// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
import router from './router'
import adapation from './common/adapation'
import Swiper from './common/swiper-4.2.2.min.js'
import { TransferDom } from 'vux'
import  { AlertPlugin, ConfirmPlugin, DatetimePlugin ,ToastPlugin } from 'vux'

Vue.directive('transfer-dom', TransferDom)
Vue.use(VueRouter)
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)
Vue.use(DatetimePlugin)
Vue.use(ToastPlugin)
Vue.prototype.Swiper = Swiper;
FastClick.attach(document.body)

const isDebug_mode = process.env.NODE_ENV !== 'production'
Vue.config.debug = isDebug_mode
Vue.config.devtools = isDebug_mode
Vue.config.productionTip = false
Vue.prototype.$event = new Vue();

router.afterEach( route =>{
  document.title = route.meta.title || '';
})

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
