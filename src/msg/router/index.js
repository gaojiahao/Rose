import notice from '@/msg/pages/notice'
import MSGLIST from '@/msg/pages/appMsgList'
export default [
  { path: '/notice', name: 'MSGHOME', component: notice,
    meta: { title: '消息列表', keepAlive: true}
  },
  { path: '/msglist', name: 'MSGLIST', component: MSGLIST,
    meta: { title: '应用消息列表',keepAlive: true}
  }
]

