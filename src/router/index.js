import Vue from 'vue'
import Router from 'vue-router'
import HOME from '@/pages/home'
import TO_DO from '@/pages/to_do'
import DONE from '@/pages/done'
import { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } from 'constants';

Vue.use(Router)

export default new Router({
  mode:'history',
  base:'/Rose_test',
  routes: [
    {
      path: '/',
      redirect:'/home'
    },
    {
      path:'/home',
      component:HOME,
      meta:'首页'
    },
    {
      path: '/to_do',
      name: 'TO_DO',
      component: TO_DO,
      meta:'我的待办'
    },
    {
      path:'/done',
      name:'DONE',
      component:DONE,
      meta:'我的已办'
    },
    {
      path:'*',
      redirect:'/to_do'
    }
  ]
})
