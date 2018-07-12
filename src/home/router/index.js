import HOME from '../pages/home'
import APPLY from '../pages/allApply'
import LIST from '../pages/list'
import SODETAIL from '../pages/detail/soDetail'
import ADRESS from '../pages/detail/adress'
import EDIT_ADS from '../pages/detail/edit_ads'
import MATERAPP from '../pages/apps/materApp'

export default [
  { path: '/home', name: 'HOME', component: HOME, meta:{ title:'首页' } },
  { path:'/allapply', name:'APPLY', component:APPLY, meta:{ title:'全部应用' } },
  { path:'/list', name:'LIST', component:LIST, meta:{ title:'任务列表' } },
  { path:'/soDetail', name:'SODETAIL', component:SODETAIL, meta:{ title:'填写订单' } },
  { path:'/adress', name:'ADRESS', component:ADRESS, meta:{ title:'选择地址' } },
  { path:'/edit_ads', name:'EDIT_ADS', component:EDIT_ADS, meta:{ title:'编辑地址' } },
  { path:'/materApp', name:'MATERAPP', component:MATERAPP, meta:{ title:'物料列表' } },
  { path: '/', redirect:'/home' },
  { path:'*', redirect:'/to_do' }
]

