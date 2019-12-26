/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-20 11:02:44
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2019-12-25 14:56:42
 */
import notice from '@/msg/pages/notice'
import flowTodo from '@/msg/pages/flowTodo'
import comment from '@/msg/pages/comment'
import praise from '@/msg/pages/praise'
import MSGLIST from '@/msg/pages/appMsgList'
import TASK from '@/task/task'
import flowTask from '@/task/flowTask'
import projectTask from '@/task/projectTask'
import dailyTask from '@/task/dailyTask'
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
  },
  {
    path:'/task',
    name:'TASK',
    component:TASK,
    meta: { title: '任务管理', keepAlive: false},
    redirect: { name: 'flowTask' },
    children:[{
      path:'flowTask',
      name:'flowTask',
      component:flowTask,
      meta: { title: '工作流任务', keepAlive: true},
    },{
      path:'projectTask',
      name:'projectTask',
      component:projectTask,
      meta: { title: '项目任务', keepAlive: true},
    },{
      path:'dailyTask',
      name:'dailyTask',
      component:dailyTask,
      meta: { title: '日志任务', keepAlive: true},
    }]
  }
]

