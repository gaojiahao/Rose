import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home'
import Spread from '@/pages/spread'
import Meeting from '@/pages/meeting'
import House from '@/pages/house'
import Assets from '@/pages/assets'
import Mylist from '@/pages/mylist'
import Flow from '@/pages/flow'

Vue.use(Router)

export default new Router({
  mode:'history',
  routes: [
    { path: '/', name: 'Home', component: Home, meta:'首页'},
    { path: '/spread', name: 'Spread', component: Spread, meta:'市场宣传' },
    { path: '/meeting', name: 'Meeting', component: Meeting, meta:'会议' },
    { path: '/house', name: 'House', component: House, meta:'房屋' },
    { path: '/assets', name: 'Assets', component: Assets, meta:'固定资产' },
    { path: '/mylist', name: 'Mylist', component: Mylist, meta:'我的提交' },
    { path: '/flow', name: 'Flow', component: Flow, meta:'工作流' }
  ]
})
