import HOME from '../pages/home'
import NEWHOME from '../pages/newhome'
import APPLY from '../pages/allApply'
import LIST from '../pages/list'
import DETAIL from '../pages/detail/detail'
import ADRESS from '../pages/dealer/adress'
import EDIT_ADS from '../pages/dealer/edit_ads'
import ADRESSDETAL from '../pages/dealer/adressDetail'
import MATERAPP from '../pages/apps/materApp'
import ADDMATER from '../pages/apps/addMater'
import MATERDETAIL from '../pages/apps/materDetail'

export default [
  { path: '/home', name: 'HOME', component: HOME,
    meta:{ title:'首页' } },
  { path: '/newhome', name: 'NEWHOME', component: NEWHOME,
  meta:{ title:'新首页' } },
  { path:'/allapply', name:'APPLY', component:APPLY,
    meta:{ title:'全部应用' } },
  { path:'/list', name:'LIST', component:LIST,
    meta:{ title:'任务列表' } },
  { path:'/detail', name:'DETAIL', component:DETAIL,
    meta:{ title:'填写订单' } },
  { 
    path:'/adress',
    name:'ADRESS', 
    component:ADRESS,
    meta:{ title:'选择地址' },
    children:[
      {
        path:'edit_ads',
        name:'EDIT_ADS',
        component:EDIT_ADS,
        meta:{ title:'编辑地址' }
      },
      {
        path:'adressDetail', 
        name:'ADRESSDETAL', 
        component:ADRESSDETAL, 
        meta:{ title:'地址详情' }
      }
    ]
  },
  { 
    path:'/materApp', 
    name:'MATERAPP', 
    component:MATERAPP,
    meta:{ title:'物料列表', keepAlive: true },
    children:[
      {
        path:'addMater', 
        name:'ADDMATER', 
        component:ADDMATER,
        meta:{ title:'新增物料' }
      },
      {
        path:'materDetail',
        name:'MATERDETAIL', 
        component:MATERDETAIL,
        meta:{ title:'物料详情' }
      }
    ]
  },
  { path: '/', redirect:'/newhome' },
  { path:'*', redirect:'/newhome' }
]

