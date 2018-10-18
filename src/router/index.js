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
import reportsSummary from '@/components/reports_summary'
import achievement from '@/components/achievement'
import achievementDetail from '@/components/achievementDetail'
import saleRecord from '@/components/sale_record'
import saleRecordPerson from '@/components/sale_record_person'
import AchievementEnrty from '@//components/achievementEntry'
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
        },
        {
          path: 'reportsSummary',
          component: reportsSummary,
          name: 'reportsSummary',
          meta: {
            title: '未报数人员'
          }
        }
      ],
      meta: {
        title: '查看报表'
      }
    },
    {
      path: '/entry',
      name: 'AchievementEnrty',
      component: AchievementEnrty,
      meta: {
        title: '销售业绩',
        keepAlive: true,
      }
    },
    {
      path: '/saleRecord',
      name: 'saleRecord',
      component: saleRecord,
      meta: {
        title: '销售业绩汇总',
        keepAlive: true,
      }
    },
    {
      path: '/saleRecordPerson',
      name: 'saleRecordPerson',
      component: saleRecordPerson,
      meta: {
        title: '销售个人业绩汇总',
        keepAlive: true,
      }
    },
    {
      path: '/achievement',
      name: 'achievement',
      component: achievement,
      meta: {
        title: '销售业绩列表',
        keepAlive: true,
      }
    },
    {
      path: '/achievementDetail',
      name: 'achievementDetail',
      component: achievementDetail,
      meta: {
        title: '销售业绩详情'
      }
    },
    {
      path: '*',
      redirect: '/Home'
    }
  ]
})
