import Vue from 'vue'
import Router from 'vue-router'
import OP from '@/components/option'
import Home from '@/components/home'
import saleReport from '@/components/sale_report'
import myRecord from '@/components/my_record'
import count from '@/components/count'
import reportsOp from '@/components/reports_op'
import reports from '@/components/reports'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/Op',
      name: 'Option',
      component: OP
    },
    {
      path: '/Rose',
      name: 'Home',
      component: Home
    },
    // 销售预报提交
    {
      path: '/saleReport',
      name: 'saleReport',
      component: saleReport,
      children: [
        {path: 'count', name: 'count', component: count}
      ]
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
      redirect: '/Op'
    }
  ]
})
