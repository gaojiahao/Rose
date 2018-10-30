import HOME from '../pages/home'

// ------> 基础应用 <-------
import ADRESS from '../pages/apps/basicApp/dealer/adressList'
import EDIT_ADS from '../pages/apps/basicApp/dealer/edit_ads'
import ADRESSDETAL from '../pages/apps/basicApp/dealer/adressDetail'
import MATERLIST from '../pages/apps/basicApp/Mater/materList'
import ADDMATER from '../pages/apps/basicApp/Mater/addMater'
import MATERDETAIL from '../pages/apps/basicApp/Mater/materDetail'
import WAREHOUSE from '../pages/apps/basicApp/warehouse/warehouseList'
import EDIT_WAREHOUSE from '../pages/apps/basicApp/warehouse/edit_warehouse'
import WAREHOUSEDETAIL from '../pages/apps/basicApp/warehouse/warehouseDetail'
// ------- >业务应用 <-------
import LIST from '../pages/apps/bizApp/list/list'
import FILLFORM from '../pages/apps/bizApp/fillForm/fillForm'
import DETAIL from '../pages/apps/bizApp/detail/detail'
import RELATED from '../pages/apps/bizApp/detail/related/related'
// ------- >科目应用 <-------

// ------- >仪表视图 <-------
import DASHBOARD from '../pages/apps/bizApp/dashboard/dashboard'

//
import COMMENTLIST from '@/home/pages/apps/bizApp/comment/commentList'

//应用详情
import APPDETAIL from '../pages/apps/bizApp/appDetail/appDetail.vue'

export default [
  { path: '/home', name: 'HOME', component: HOME,
  meta:{ title:'首页' , keepAlive: true} },
  {
    path: '/commentList',
    name: 'COMMENTLIST',
    component: COMMENTLIST,
    meta: { title: '评论' }
  },
  {
    path: '/dashboard',
    name: 'DASHBOARD',
    component: DASHBOARD,
    meta: { title: '仪表视图' }
  },
  {
    path:'/related/:listId',
    name:'RELATED',
    component:RELATED,
    meta:{title:'相关实例'}
  },
  {
    path:'/list/:fileId/:listId',
    name:'LIST',
    component:LIST,
    meta:{ title:'列表', keepAlive: true},
  },

  {
    path:'/fillform/:fileId/:listId',
    name:'FILLFORM',
    component:FILLFORM,
    meta:{ title:'填写新内容' }
  },
  {
    path:'/detail/:fileId/:listId',
    name:'DETAIL',
    component:DETAIL,
    meta:{ title:'订单详情' }
  },
  {
    path:'/appDetail/:listId',
    name:'APPDETAIL',
    component:APPDETAIL,
    meta:{ title:'应用详情' }
  },
  {
    path:'/adress',
    name:'ADRESS',
    component:ADRESS,
    meta:{ title:'往来列表' },
    children:[
      {
        path:'edit_ads',
        name:'EDIT_ADS',
        component:EDIT_ADS,
        meta:{ title:'编辑往来' }
      },
      {
        path:'adressDetail',
        name:'ADRESSDETAL',
        component:ADRESSDETAL,
        meta:{ title:'往来详情' }
      }
    ]
  },
  {
    path:'/materlist',
    name:'MATERLIST',
    component:MATERLIST,
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
    meta: {title:'仓库列表'},
    children:[
      {
        path:'edit_warehouse',
        name:'EDIT_WAREHOUSE',
        component:EDIT_WAREHOUSE,
        meta:{ title:'编辑仓库' }
      },
      {
        path:'warehouseDetail',
        name:'WAREHOUSEDETAIL',
        component:WAREHOUSEDETAIL,
        meta:{ title:'仓库详情' }
      }
    ]
  },
  { path: '/', redirect:'/home' },
  { path:'*', redirect:'/home' },
]

