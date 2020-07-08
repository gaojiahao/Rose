
import MyPerformance from './performance/myPerformance.vue'
import DayPerformance from './performance/dayPerformance.vue'
import MonthPerformance from './performance/monthPerformance.vue'
import YearPerformance from './performance/yearPerformance.vue'
import PerformanceLayout from './performance/performanceLayout.vue'

import SettingLayout from './setting/settingLayout'
import UserEntites from './setting/userEntites'

export default [
  {
    path: '/user',
    name: '/user', 
    meta: { title: '我', keepAlive: true},
    redirect: { name: 'MyPerformance' },
    component: PerformanceLayout,
    children: [
      { 
        path: 'myPerformance', 
        name: 'MyPerformance', 
        component: MyPerformance,
        meta:{ 
          title:'我' ,
          keepAlive: true,
          disablebBack:true
        }
      },
      {
        path: 'dayPerformance/:day',
        name: 'DayPerformance',
        meta:{ 
          title:'日绩效',
          keepAlive: true
        },
        component: DayPerformance
      },
      {
        path: 'monthPerformance/:month',
        name: 'MonthPerformance',
        meta:{ 
          title:'月累计绩效',
          keepAlive: true
        },
        component: MonthPerformance
      },
      {
        path: 'yearPerformance/:year',
        name: 'YearPerformance',
        meta:{ 
          title:'年度累计绩效',
          keepAlive: true
        },
        component: YearPerformance
      },{
        path:'setting',
        name:'setting',
        meta:{
          title:'设置',
          keepAlive: true
        },
        component:SettingLayout,
        children:[
          {
            path:'entities',
            name:'entities',
            meta:{
              title:'切换身份',
              keepAlive: true
            },
            component:UserEntites,
          }
        ]
      }
    ],
  }
]

