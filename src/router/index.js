import Vue from 'vue'
import Router from 'vue-router'
import option from 'views/option'
import Home from 'views/home'
import saleReport from 'views/sale_report'
import myRecord from 'views/my_record'
import count from 'views/count'
import reportsOp from 'views/reports_op'
import reports from 'views/reports'
import help from 'views/help'
import reportsSummary from 'views/reports_summary'
import achievement from 'views/achievement/achievement'
import achievementDetail from 'views/achievement/achievementDetail'
import saleRecord from 'views/achievement/sale_record'
import saleRecordPerson from 'views/achievement/sale_record_person'
import AchievementEnrty from 'views/achievement/achievementEntry'
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
      }
    },
    {
      path: '/saleRecord',
      name: 'saleRecord',
      component: saleRecord,
      meta: {
        title: '销售业绩汇总',
      }
    },
    {
      path: '/saleRecordPerson',
      name: 'saleRecordPerson',
      component: saleRecordPerson,
      meta: {
        title: '销售个人业绩汇总',
      }
    },
    {
      path: '/achievement',
      name: 'achievement',
      component: achievement,
      meta: {
        title: '销售业绩列表',
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
