import Vue from 'vue'
import Router from 'vue-router'
import HomeRouter from '@/home/router'
import MsgRouter from '@/msg/router'

import { getFieldSetting }  from "service/fieldModelService"

Vue.use(Router)

let router = window.router;
if (router == null) {
  window.router =  new Router({
    mode:'history',
    base:'/Hermes',
    routes: [
      ...HomeRouter,
      ...MsgRouter
    ]
  })

  window.router.beforeEach((to, from, next) => {
    if(to.name !== 'Login'){
      if(!Vue.prototype.$r2FieldSetting){
        initFieldSetting();
      }
    }
    next();
  })
}
//获取系统字段模型
async function initFieldSetting(){
    await  getFieldSetting().then( res=>{
    Vue.prototype.$r2FieldSetting = {};
    res.tableContent.map(it=>{
      Vue.prototype.$r2FieldSetting[it.fieldCode] = it;
    });
  });
}
export default window.router
