import HOME from '@/msg/pages/home'
import MSGLIST from '@/msg/pages/appMsgList'

export default [
  { path: '/notice', name: 'HOME', component: HOME,
    meta: { title: '消息列表'},
    children:[
      {
        path:'msglist',
        name:'MSGLIST',
        component:MSGLIST,
        meta:{ title:'应用消息列表' }
      }
    ]
  }
]

