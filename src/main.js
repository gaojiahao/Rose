// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import FastClick from 'fastclick'
import router from './router'
import App from './App'

//声明全局空实例 用于传值
Vue.prototype.$event = new Vue();
// FastClick.attach(document.body)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app-box')
