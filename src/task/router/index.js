/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-20 11:02:44
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2020-01-09 16:24:46
 */

import task from '@/task/pages/task'
import flowTodo from '@/task/pages/flowTodo'
import projectTask from '@/task/pages/projectTask'
import dailyTask from '@/task/pages/dailyTask'
export default [
  { 
    path: '/task', 
    name: 'TASK', 
    component: task,
    meta: { title: '任务管理', keepAlive: true},
    redirect: { name: 'flowTodo' },
    children:[{
      path:'flowTodo',
      name:'flowTodo',
      component:flowTodo,
      meta: { title: '工作流任务', keepAlive: true},
    },
    {
      path:'projectTask',
      name:'projectTask',
      component:projectTask,
      meta: { title: '项目任务', keepAlive: true},
    },
    {
      path:'dailyTask',
      name:'dailyTask',
      component:dailyTask,
      meta: { title: '日志任务', keepAlive: true},
    }
    ]
  },
]

