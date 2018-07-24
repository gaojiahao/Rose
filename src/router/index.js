import Vue from 'vue'
import Router from 'vue-router'
import HomeRouter from '../home/router'


Vue.use(Router)

let router = new Router({
  mode:'history',
  base:'/Hermes',
  routes: [
    ...HomeRouter,
  ]
})
router.afterEach((to,from)=>{
  if(from.path === '/home' && to.path === '/list'){
    let refresh = sessionStorage.getItem('isRefresh');
    if(refresh === '0'){
      sessionStorage.setItem('isRefresh' ,null);
      location.reload();
    }
    else {
      sessionStorage.setItem('isRefresh','0');
    }
  }
  else if (from.path === '/list' && to.path === '/home'){
    sessionStorage.setItem('isRefresh' ,0);
  }
})
export default router
