import HOME from '../pages/home'
import NEWHOME from '../pages/newhome'
import APPLY from '../pages/allApply'
import LISTFORM from '../pages/listForm/listForm.vue'
import FILLFORM from '../pages/fillForm/fillForm'
import ADRESS from '../pages/dealer/adress'
import EDIT_ADS from '../pages/dealer/edit_ads'
import ADRESSDETAL from '../pages/dealer/adressDetail'
import MATERAPP from '../pages/apps/materApp'
import ADDMATER from '../pages/apps/addMater'
import MATERDETAIL from '../pages/apps/materDetail'
import WAREHOUSE from '../pages/warehouse/warehouse'
import EDIT_WAREHOUSE from '../pages/warehouse/edit_warehouse'
import WAREHOUSEDETAIL from '../pages/warehouse/warehouseDetail'

export default [
  { path: '/home', name: 'HOME', component: HOME,
    meta:{ title:'首页' } },
  { path: '/newhome', name: 'NEWHOME', component: NEWHOME,
  meta:{ title:'新首页' , keepAlive: true} },
  { path:'/allapply', name:'APPLY', component:APPLY,
    meta:{ title:'全部应用' } },
  { path:'/listform', name:'LISTFORM', component:LISTFORM,
    meta:{ title:'列表' } },
  { path:'/fillform', name:'FILLFORM', component:FILLFORM,
    meta:{ title:'填写新内容' } },
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
    meta:{ title:'物料列表' },
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
  {
    path: '/warehouse',
    name: 'WAREHOUSE',
    component: WAREHOUSE,
    meta: {title:'仓库'},
    children:[
      {
        path:'edit_warehouse',
        name:'EDIT_WAREHOUSE',
        component:EDIT_WAREHOUSE,
        meta:{ title:'编辑地址' }
      },
      {
        path:'warehouseDetail',
        name:'WAREHOUSEDETAIL',
        component:WAREHOUSEDETAIL,
        meta:{ title:'地址详情' }
      }
    ]
  },
  { path: '/', redirect:'/newhome' },
  { path:'*', redirect:'/newhome' },
]

