/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-20 11:02:44
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2020-01-09 16:19:41
 */
import notice from '@/msg/pages/notice'
import comment from '@/msg/pages/comment'
import praise from '@/msg/pages/praise'
import MSGLIST from '@/msg/pages/appMsgList'
export default [
  { 
    path: '/notice', 
    name: 'MSGHOME', 
    component: notice,
    meta: { title: '消息列表', keepAlive: true},
    redirect: { name: 'comment' },
    children:[{
      path:'comment',
      name:'comment',
      component:comment,
      meta: { title: '评论', keepAlive: true},
    },{
      path:'praise',
      name:'praise',
      component:praise,
      meta: { title: '点赞', keepAlive: true},
    }
    ]
  },
  { path: '/msglist', name: 'MSGLIST', component: MSGLIST,
    meta: { title: '应用消息列表',keepAlive: true}
  },
]

