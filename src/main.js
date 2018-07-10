// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import App from './App'
import router from './router'
import adapation from './common/adapation'
import {ToastPlugin} from 'vux'

require('./common/css/swiper.css');

Vue.use(VueRouter);
Vue.use(ToastPlugin);


FastClick.attach(document.body);

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
  let {meta} = to;
  document.title = meta.title || '';
  next()
});
/* eslint-disable no-new */
new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box');
