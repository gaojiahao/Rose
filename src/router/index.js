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
      redirect: '/Home',
    },
    {
      path: '/option',
      name: 'Option',
      component: option
    },
    {
      path: '/Home',
      name: 'Home',
      component: Home,
      meta: {
        title: '销售预报'
      }
    },
    // 销售预报提交
    {
      path: '/saleReport',
      name: 'saleReport',
      component: saleReport,
      meta: {
        title: '预报提交'
      }
    }, {
      path: '/help',
      name: 'help',
      component: help,
      meta: {
        title: '支援预报提交'
      }
    },
    {
      path: '/count',
      name: 'Count',
      component: count,
      meta: {
        title: '合计'
      }
    },
    {
      path: '/myRecord',
      name: 'myRecord',
      component: myRecord,
      meta: {
        title: '个人业绩'
      }
    },
    {
      path: '/reportsOp',
      name: 'reportsOp',
      component: reportsOp,
      children: [
        {
          path: 'reports',
          component: reports,
          name: 'reports',
          meta: {
            title: '报表'
          }
        }
      ],
      meta: {
        title: '查看报表'
      }
    },
    {
      path: '*',
      redirect: '/Home'
    }
  ]
})
