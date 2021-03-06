/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-12-03 09:54:38
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2020-01-15 15:54:56
 */
import Vue from 'vue'
import Router from 'vue-router'

import SetHost from '@/views/setHost'
import Login from '@/views/login'
import TokenExpiry from '@/views/tokenExpiry'
import MsgRouter from '@/views/msg/router'
import Contacts from '@/views/contacts/contacts'
import HomeRouter from '@/views/home/router'


import tokenService from 'service/tokenService'
import TaskRouter from '@/views/taskflow/router'
import {isPC,isQYWX,isDD} from '@/plugins/platform/index'
import userRouter from '@/views/user/router'

import { getFieldSetting, getAllDict, getAllFieldSettingListLevel}  from "service/fieldModelService"

Vue.use(Router)

const storage = window['sessionStorage'];
const r2_cachedListLevelFieldSetting = 'r2_cachedListLevelFieldSetting';

let router = window.router;
if (router == null) {
  window.router =  new Router({
    mode:!!window.isApp?'hash':'history',
    base:'/Hermes',
    routes: [
      { path: '/', redirect:'/home' },
      { path:'*', redirect:'/home' },
      { 
        path: '/contacts/:id', 
        name: 'CONTACTS', 
        component: Contacts,
        meta:{ 
          title:'通讯录' , 
          keepAlive: true
        } 
      },
      ...HomeRouter,
      ...MsgRouter,
      ...TaskRouter,
      ...userRouter,
      {
        path:'/setHost',
        name:'setHost',
        component:SetHost,
        meta:{
           title:'服务器设置'
        }
      },
      {
        path: '/login',
        name: 'Login',
        component: Login,
        // redirect: '/Login',
        meta: {
          title: '登录'
        }
      },{
        path: '/tokenExpiry',
        component: TokenExpiry,
        meta:{
          title: 'token过期了'
        }
      }
    ]
  })

  window.router.beforeEach((to, from, next) => {
    // let {query,fullPath} = to;
    // console.log('to',to);
    // if(query.tag&&query.tag=='share'){
    //   storage.setItem('shareUrl',window.location.href);
    //   if(!storage.getItem('r2FieldSetting')){
    //     initFieldSetting();
    //   } 
    // }
    // if(tokenService.getToken() != '' && to.name !== 'Login'){
    //   if(!storage.getItem('r2_cachedListLevelFieldSetting')){
    //     initListLevelFieldSetting();   
    //   }
    //   if(!storage.getItem('r2_cachedDicts')){
    //     initDicts();   
    //   }
    //   if(!Vue.prototype.$r2FieldSetting){
    //     console.log('to',to);
    //     initFieldSetting();
    //   }
    // }
    load(to);
    next();
  })
}

//获取系统字段模型
async function initFieldSetting(){
  await getFieldSetting().then( res=>{
    var me = this,
        r2_cachedListLevelFieldSetting = storage.getItem('r2_cachedListLevelFieldSetting'),
        r2_cachedDicts = storage.getItem('r2_cachedDicts');
 
    r2_cachedListLevelFieldSetting = r2_cachedListLevelFieldSetting != null ? JSON.parse(r2_cachedListLevelFieldSetting) : null;
    r2_cachedDicts = r2_cachedDicts != null ? JSON.parse(r2_cachedDicts) : null;
    if(r2_cachedListLevelFieldSetting == null || r2_cachedDicts == null ) return;

    Vue.prototype.$r2FieldSetting = {};
    res.tableContent.map(field=>{
      field.config = JSON.parse(field.config);
      if (field.fieldType === 'dictionary' || field.fieldType === 'options') {
        if (r2_cachedListLevelFieldSetting[field.fieldCode]) {
          field.optionItems = r2_cachedListLevelFieldSetting[field.fieldCode].map(function (fs) {
            return {
              id: fs.fieldValue,
              name: fs.fieldValue,
              listId: fs.listId,
              sort: fs.sort
            };
          });
        } else if (field.fieldType === 'options') {
          field.optionItems = Array.isArray(field.config.optionState) ? [] : (field.config.optionState ? JSON.parse(field.config.optionState):'');
        } else if (field.config.dictCode) {
          //字典暂不处理
          // var dicts = Ext.Object.getValues(r2.global.WebContext._cachedDicts).filter(function (d) {
          //     var parentNode = r2.global.WebContext._cachedDicts[field.config.dictCode];
          //     return parentNode && d.parentId === parentNode.id;
          // });
          // field.optionItems = dicts.map(function (field) {
          //   return {
          //       id: field.value,
          //       name: field.name,
          //       sort: field.sort
          //   };
          // });
        }
    }
    Vue.prototype.$r2FieldSetting[field.fieldCode] = field;
    });
    if(!storage.getItem('r2FieldSetting')){
      storage.setItem('r2FieldSetting',  JSON.stringify(Vue.prototype.$r2FieldSetting));
    }
  }).catch(e =>{console.log(e)});
}
async function initListLevelFieldSetting() {
  await getAllFieldSettingListLevel().then(res=>{
    var me = this,
        _cachedListLevelFieldSetting = {};

    res.tableContent.map(it=>{
      _cachedListLevelFieldSetting[it.fieldCode] = _cachedListLevelFieldSetting[it.fieldCode] ? 
        Array.isArray(_cachedListLevelFieldSetting[it.fieldCode]) ? _cachedListLevelFieldSetting[it.fieldCode].concat(it) : [it, _cachedListLevelFieldSetting[it.fieldCode]] 
        : it;
    });
    //console.log('_cachedListLevelFieldSetting',_cachedListLevelFieldSetting);
    for(var val in _cachedListLevelFieldSetting){
      _cachedListLevelFieldSetting[val].sort(function(a, b){return a.sort - b.sort});
    }
    storage.setItem('r2_cachedListLevelFieldSetting', _cachedListLevelFieldSetting ? JSON.stringify(_cachedListLevelFieldSetting):'');
  }).catch(e =>{e});
}

async function initDicts() {
  await getAllDict().then(res=>{
    var me = this,
    _cachedDicts = {};
    res.tableContent.map(it=>{
      _cachedDicts[it.value] = it;
    });
    //console.log('_cachedDicts',_cachedDicts);
    storage.setItem('r2_cachedDicts',  _cachedDicts ? JSON.stringify(_cachedDicts):'');
  }).catch(e =>{e});
}

async function load(to){ //在路由拦截中添加缓存
  var fieldSettingCache = storage.getItem('r2FieldSetting');
  let {query,fullPath} = to;

  if(query.tag&&query.tag=='share'){
    storage.setItem('shareUrl',window.location.href);
    if(!fieldSettingCache){
      await initFieldSetting();
    } 
  }

  if (tokenService.getToken() != '' && to.name !== 'Login'){
    if(!storage.getItem('r2_cachedListLevelFieldSetting')){
      await initListLevelFieldSetting();   
    }
    if(!storage.getItem('r2_cachedDicts')){
      await initDicts();   
    }
    if(!Vue.prototype.$r2FieldSetting){
      if(fieldSettingCache != null){
        try{
          Vue.prototype.$r2FieldSetting = JSON.parse(fieldSettingCache);
        } catch(e){
           console.log('fieldSetting cache parse error');
        }      
      } else {
        await initFieldSetting();//添加缓存
      }
    }
  } else if(isQYWX&&!Vue.prototype.$r2FieldSetting) {
    await initListLevelFieldSetting();  
    await initDicts();   
    await initFieldSetting();
  } else if(isDD&&!window.sessionStorage.getItem('r2FieldSetting')){
    await initListLevelFieldSetting();  
    await initDicts();   
    await initFieldSetting();
  }
}

export default window.router
