
import MyPerformance from './performance/myPerformance.vue'
import DayPerformance from './performance/dayPerformance.vue'
import MonthPerformance from './performance/monthPerformance.vue'
import YearPerformance from './performance/yearPerformance.vue'
import PerformanceLayout from './performance/performanceLayout.vue'

export default [
  {
    path: '/user',
    name: '/user', 
    redirect: { name: 'MyPerformance' },
    component: PerformanceLayout,
    children: [
      { 
        path: 'myPerformance', 
        name: 'MyPerformance', 
        component: MyPerformance,
        meta:{ 
          title:'我' ,
          keepAlive: true
        }
      },
      {
        path: 'dayPerformance/:day',
        name: 'DayPerformance',
        meta:{ 
          tile:'日绩效',
          keepAlive: true
        },
        component: DayPerformance
      },
      {
        path: 'monthPerformance/:month',
        name: 'MonthPerformance',
        meta:{ 
          tile:'月绩效',
          keepAlive: true
        },
        component: MonthPerformance
      },
      {
        path: 'yearPerformance/:year',
        name: 'YearPerformance',
        meta:{ 
          tile:'年绩效',
          keepAlive: true
        },
        component: YearPerformance
      }
    ]
  }
]
