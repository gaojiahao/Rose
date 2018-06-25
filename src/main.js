// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
import router from './router'
import adapation from './common/adapation'
import  { LoadingPlugin,ToastPlugin } from 'vux'

Vue.use(VueRouter)
Vue.use(LoadingPlugin)
Vue.use(ToastPlugin)


FastClick.attach(document.body)

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  document.title = to.meta || '立项申请';
  next()
});
/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
