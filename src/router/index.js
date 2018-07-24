import Vue from 'vue'
import Router from 'vue-router'
import HomeRouter from '../home/router'


Vue.use(Router)

let router = new Router({
  mode:'history',
  base:'/Hermes',
  routes: [
    ...HomeRouter,
  ]
})
export default router
