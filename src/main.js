// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import router from './router'
import App from './App'
import {querystring, AlertPlugin, LoadingPlugin, ConfirmPlugin} from 'vux'
import adapation from './common/adapation'

Vue.use(AlertPlugin);
Vue.use(LoadingPlugin);
Vue.use(ConfirmPlugin);

//声明全局空实例 用于传值
Vue.prototype.$event = new Vue();
// FastClick.attach(document.body)

Vue.config.productionTip = false;

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || '销售预报';
  next()
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
