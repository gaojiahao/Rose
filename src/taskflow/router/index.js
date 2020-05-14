/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-20 11:02:44
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2020-01-07 13:55:33
 */
import taskflow from '@/taskflow/pages/taskflow'
import flowTask from '@/taskflow/pages/flowTask'
import projectTask from '@/taskflow/pages/projectTask'
import dailyTask from '@/taskflow/pages/dailyTask'
import myToDoTask from '@/taskflow/pages/myToDoTask'
import myCompleted from '@/taskflow/pages/myCompleted'
export default [
  { 
    path: '/taskflow', 
    name: 'taskflow', 
    component: taskflow,
    meta: { title: '任务列表', keepAlive: true},
    // redirect: { name: 'myToDoTask' },
    // children:[{
    //   path:'flowTask',
    //   name:'flowTask',
    //   component:flowTask,
    //   meta: { title: '工作流任务', keepAlive: true},
    // },{
    //   path:'projectTask',
    //   name:'projectTask',
    //   component:projectTask,
    //   meta: { title: '项目任务', keepAlive: true},
    // },{
    //   path:'dailyTask',
    //   name:'dailyTask',
    //   component:dailyTask,
    //   meta: { title: '日志任务', keepAlive: true},
    // },{
    //   path:'myToDoTask',
    //   name:'myToDoTask',
    //   component:myToDoTask,
    //   meta: { title: '我的待办', keepAlive: true},
    // },{
    //   path:'myCompleted',
    //   name:'myCompleted',
    //   component:myCompleted,
    //   meta: { title: '我的已办', keepAlive: true},
    // }
    // ]
  },
]

