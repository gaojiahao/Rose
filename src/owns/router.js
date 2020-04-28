
import MyPerformance from './owns/myPerformance.vue'
import DayPerformance from './owns/dayPerformance.vue'
import MonthPerformance from './owns/monthPerformance.vue'
import YearPerformance from './owns/yearPerformance.vue'

export default [
  { 
    path: '/myPerformance', name: 'MyPerformance', component: MyPerformance,
    meta:{ 
      title:'我' , 
      keepAlive: true
    },
    children: [
      {
        path: 'dayPerformance/:day',
        meta:{ 
          tile:'日绩效',
          keepAlive: true
        },
        component: DayPerformance
      },
      {
        path: 'monthPerformance/:month',
        meta:{ 
          tile:'月绩效',
          keepAlive: true
        },
        component: MonthPerformance
      },
      {
        path: 'yearPerformance/:year',
        meta:{ 
          tile:'年绩效',
          keepAlive: true
        },
        component: YearPerformance
      }
    ]
  }
]

