import HOME from '@/msg/pages/home'
import MSGLIST from '@/msg/pages/appMsgList'
import DETAIL from '@/home/pages/apps/bizApp/detail/detail'

export default [
  { path: '/notice', name: 'HOME', component: HOME,
    meta: { title: '消息列表'},
    children:[
      {
        path:'msglist/:name',
        name:'MSGLIST',
        component:MSGLIST,
        meta:{ title:'应用消息列表'}
      },
      {
        path:'detail',
        name:'DETAIL',
        component:DETAIL,
        meta:{ title:'订单详情' }
      }
    ]
  }
]

