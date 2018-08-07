import HOME from '@/msg/pages/home'
import MSGLIST from '@/msg/pages/appMsgList'
import DETAIL from '@/home/pages/apps/bizApp/detail/detail'
import FILLFORM from '@/home/pages/apps/bizApp/fillForm/fillForm'
export default [
  { path: '/notice', name: 'MSGHOME', component: HOME,
    meta: { title: '消息列表'},
    children:[
      {
        path:'msglist/:code',
        name:'MSGLIST',
        component:MSGLIST,
        meta:{ title:'应用消息列表'},
        children:[
          {
            path:'detail',
            name:'MSGDETAIL',
            component:DETAIL,
            meta:{ title:'订单详情' }
          },
          {
            path:'fillform',
            name:'MSGFILLFORM',
            component:FILLFORM,
            meta:{ title:'填写新内容' }
          }
        ]
      },
    ]
  }
]

