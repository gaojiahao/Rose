import Vue from 'vue'
import Router from 'vue-router'
import HomeRouter from '../home/router'


Vue.use(Router)

export default new Router({
  mode:'history',
  base:'/Hermes',
  routes: [
    ...HomeRouter,
  ]
})
