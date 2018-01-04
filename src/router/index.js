import Vue from 'vue'
import Router from 'vue-router'
import To_do from '../pages/to_do/td.vue'
import Finish from '../pages/finish/finish.vue'
import VueWechatTitle from 'vue-wechat-title';  
Vue.use(VueWechatTitle)

Vue.use(Router)
//router.beforeEach((to, from, next) => {
///* 路由发生变化修改页面title */
//if (to.meta.title) {
//  document.title = to.meta.title
//}
//next()
//})
export default new Router({
  routes: [
    { path:'/to_do',  component:To_do , meta: {title: '我的待办'}},
    { path:'/finish', component:Finish ,meta: {title: '我的已办'}},
    { path:'/', redirect:'/to_do'}
  ]
})
