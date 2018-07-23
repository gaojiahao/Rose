// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
import router from './router'
import adapation from './common/adapation'
import Swiper from './common/swiper-4.2.2.min.js'
import Mescroll from './common/mescroll.min.js'
import { TransferDom } from 'vux'
import  { AlertPlugin, ConfirmPlugin } from 'vux'

Vue.directive('transfer-dom', TransferDom)
Vue.use(VueRouter)
Vue.use(AlertPlugin)
Vue.use(ConfirmPlugin)

Vue.prototype.Swiper = Swiper;
Vue.prototype.Mescroll = Mescroll;



FastClick.attach(document.body)

Vue.config.productionTip = false

// router.beforeEach((to, from, next) => {
//   if(to.meta.title){
//     document.title = to.meta.title;
//   }
//   next()
// });
router.afterEach( route =>{
  document.title = route.meta.title || '';
})

/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
