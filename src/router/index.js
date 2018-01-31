import Vue from 'vue'
import Router from 'vue-router'
import To_do from '../pages/to_do/td.vue'
import Finish from '../pages/finish/finish.vue'
import Td_detail from "../pages/to_do/td_detail.vue"
import Finish_detail from "../pages/finish/finish_detail.vue"
import VueWechatTitle from 'vue-wechat-title';  
import Welcome from "../pages/welcome/welcome.vue"
import Detail from "../pages/detail/detail.vue"
Vue.use(VueWechatTitle)

Vue.use(Router)
//router.beforeEach((to, from, next) => {
///* 路由发生变化修改页面title */
//if (to.meta.title) {
//  document.title = to.meta.title
//}
//next()
//})
export default new Router({
	mode: 'history',
  routes: [
    { path:'/Rose/to_do',  
    	component:To_do ,
    	meta: {title: '我的待办'},
    	children:[
	    	{ path:'do_detail',
			component:Detail
	    	}
    	]
    },
	{ 
		path:'/Rose/finish',
		component:Finish ,
		meta: {title: '我的已办'},
		children:[
			{ path:'done_detail',
				component:Detail
			}
		]
	},
	{ 
		path:'/welcome', 
		component:Welcome,
		meta: {title: '加载中'}		 
	},
	{
		path:"/Rose/detail",
		meta: {title: '我的待办'},
		component:Detail
	},
    { 
		path:'/',
		redirect:"/welcome"
	},
	{
		path:"*",
		redirect:"/welcome"
	}
		
  ]
})
