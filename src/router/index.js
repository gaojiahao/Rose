/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-12-03 09:54:38
 * @LastEditors: Gabriel.gaojiahao
 * @LastEditTime: 2019-12-03 10:00:16
 */
import Vue from 'vue'
import Router from 'vue-router'
import HomeRouter from '@/home/router'
import MsgRouter from '@/msg/router'

import { getFieldSetting }  from "service/fieldModelService"

Vue.use(Router)

let router = window.router;
if (router == null) {
  window.router =  new Router({
    mode:!!window.cordova?'hash':'history',
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
