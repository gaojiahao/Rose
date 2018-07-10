import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/pages/home'
import Spread from '@/pages/submit/spread'
import Meeting from '@/pages/submit/meeting'
import House from '@/pages/submit/house'
import Assets from '@/pages/submit/assets'
import Mylist from '@/pages/mylist'
import Flow from '@/pages/submit/flow'
import SpreadDetail from '@/pages/detail/spreadDetail'
import MeetingDetail from '@/pages/detail/meetingDetail'
import HouseDetail from '@/pages/detail/houseDetail'
import AssetsDetail from '@/pages/detail/assetsDetail'
import Operation from '@/pages/operation'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base:'/Zeus',
  routes: [
    {path: '/', name: 'Home', component: Home, meta: {title: '首页'}},
    {path: '/spread', name: 'Spread', component: Spread, meta: {title: ''}},
    {path: '/meeting', name: 'Meeting', component: Meeting, meta: {title: ''}},
    {path: '/house', name: 'House', component: House, meta: {title: ''}},
    {path: '/assets', name: 'Assets', component: Assets, meta: {title: ''}},
    {path: '/mylist', name: 'Mylist', component: Mylist, meta: {title: '我的提交'}},
    {path: '/flow', name: 'Flow', component: Flow, meta: {title: ''}},
    {path: '/spreadDetail', name: 'SpreadDetail', component: SpreadDetail, meta: {title: ''}},
    {path: '/meetingDetail', name: 'MeetingDetail', component: MeetingDetail, meta: {title: ''}},
    {path: '/houseDetail', name: 'HouseDetail', component: HouseDetail, meta: {title: ''}},
    {path: '/assetsDetail', name: 'AssetsDetail', component: AssetsDetail, meta: {title: ''}},
    {path: '/operation', name: 'Operation', component: Operation, meta: {title: ''}},
  ]
})
