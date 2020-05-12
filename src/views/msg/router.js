/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-20 11:02:44
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2020-01-07 13:55:33
 */

import notice from './pages/notice'
import flowTodo from './pages/flowTodo'
import comment from './pages/comment'
import praise from './pages/praise'
import MSGLIST from './pages/appMsgList'

import Msg from './navigation'
import GroupMsg from './msg/content'
import GroupInfo from './msg/groupInfo'

export default [
  { 
    path: '/msg', name: 'MsgNavigation', component: Msg,
    meta:{ 
      title:'消息' , 
      keepAlive: true
    },
    children: [
      {
        path: 'group/:groupId',
        meta:{ 
          tile:'聊天页面',
          keepAlive: true
        },
        component: GroupMsg,
        children:[{
          path:'info',
          meta:{ 
            tile:'群组信息',
            keepAlive: true
          },
          component:GroupInfo
        }]
      },
      {
        path: 'list',
        component: GroupMsg
      }
    ]
  },
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
  { 
    path: '/msglist', 
    name: 'MSGLIST', 
    meta: { title: '应用消息列表',keepAlive: true}
  },
]

