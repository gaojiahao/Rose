
import MyPerformance from './owns/myPerformance.vue'
import DayPerformance from './owns/dayPerformance.vue'
import MonthPerformance from './owns/monthPerformance.vue'
import YearPerformance from './owns/yearPerformance.vue'
import PerformanceLayout from './owns/performanceLayout.vue'

export default [
  {
    path: '/performance',
    name: 'PerformanceLayout', 
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

