import notice from '@/msg/pages/notice'
import flowTodo from '@/msg/pages/flowTodo'
import comment from '@/msg/pages/comment'
import praise from '@/msg/pages/praise'
import MSGLIST from '@/msg/pages/appMsgList'
export default [
  { 
    path: '/notice', 
    name: 'MSGHOME', 
    component: notice,
    meta: { title: '消息列表', keepAlive: true},
    redirect: { name: 'flowTodo' },
    children:[{
      path:'flowTodo',
      name:'flowTodo',
      component:flowTodo,
      meta: { title: '待办', keepAlive: true},
    },{
      path:'comment',
      name:'comment',
      component:comment,
      meta: { title: '评论', keepAlive: true},
    },{
      path:'praise',
      name:'praise',
      component:praise,
      meta: { title: '点赞', keepAlive: true},
    }]
  },
  { path: '/msglist', name: 'MSGLIST', component: MSGLIST,
    meta: { title: '应用消息列表',keepAlive: true}
  }
]

