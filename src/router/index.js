import Vue from 'vue'
import Router from 'vue-router'
import OP from '@/components/option'
import Home from '@/components/home'
import SP from '@/components/sale_report'
import MR from '@/components/my_record'
import Count from '@/components/count'
import RP_op from '@/components/reports_op'
import RP from '@/components/reports'


Vue.use(Router)

export default new Router({
  mode:'history',
  routes: [
    {
      path: '/Op',
      name: 'Option',
      component: OP
    },
    {
      path: '/Rose',
      name: 'Home',
      component: Home,
      children:[
        { path:'sp', component:SP, name:'SP' },
        { path:'mr', component:MR, name:'My_Record' },
        { path:'count', component:Count, name:'Count' },
        { path:'rp_op', component:RP_op, name:'Reports_op' },
        { path:'rp', component:RP, name:'Reports' }
      ]
    },
    {
      path:'*',
      redirect:'/Op'
    }


  ]
})
