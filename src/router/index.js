import Vue from 'vue'
import Router from 'vue-router'
import option from '@/components/option'
import Home from '@/components/home'
import saleReport from '@/components/sale_report'
import myRecord from '@/components/my_record'
import count from '@/components/count'
import reportsOp from '@/components/reports_op'
import reports from '@/components/reports'
import help from '@/components/help'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: '/Rose/',
  routes: [
    {
      path: '/',
      redirect: '/option'
    },
    {
      path: '/option',
      name: 'Option',
      component: option
    },
    {
      path: '/Home',
      name: 'Home',
      component: Home
    },
    // 销售预报提交
    {
      path: '/saleReport',
      name: 'saleReport',
      component: saleReport,
    }, {
      path: '/help',
      name: 'help',
      component: help,
    },
    {
      path: '/count',
      name: 'Count',
      component: count,
    },
    {
      path: '/myRecord',
      name: 'myRecord',
      component: myRecord
    },
    {
      path: '/reportsOp',
      name: 'reportsOp',
      component: reportsOp,
      children: [
        {path: 'reports', component: reports, name: 'reports'}
      ]
    },
    {
      path: '*',
      redirect: '/option'
    }
  ]
})
