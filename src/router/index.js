/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-12-03 09:54:38
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2020-01-02 17:49:13
 */
import Vue from 'vue'
import Router from 'vue-router'
import HomeRouter from '@/home/router'
import tokenService from 'service/tokenService'
import MsgRouter from '@/msg/router'

import { getFieldSetting, getAllDict, getAllFieldSettingListLevel}  from "service/fieldModelService"

Vue.use(Router)

const storage = window['sessionStorage'];

let router = window.router;
if (router == null) {
  window.router =  new Router({
    mode:!!window.isApp?'hash':'history',
    base:'/Hermes',
    routes: [
      ...HomeRouter,
      ...MsgRouter
    ]
  })

  window.router.beforeEach((to, from, next) => {
    console.log("分享的我进来了吗");
    let {query,fullPath} = to;
    if(tokenService.getToken() != '' && to.name !== 'Login'){
      console.log("分享的我进来了吗1");
      if(!storage.getItem('r2FieldSetting')){
        initFieldSetting();
      }
    }
    if(query.tag&&query.tag=='share'){
      console.log("分享的我进来了吗1");
      storage.setItem('shareUrl',window.location.href);
      initFieldSetting();
    }
    next();
  })
}

//获取系统字段模型
async function initFieldSetting(){
  let a =  storage.getItem('r2_cachedListLevelFieldSetting') ||  await initListLevelFieldSetting(),
      b= storage.getItem('r2_cachedDicts') ||  await initDicts();
      await getFieldSetting().then( res=>{
    var me = this,
        r2_cachedListLevelFieldSetting = a,
        r2_cachedDicts = b;
 
    // r2_cachedListLevelFieldSetting = r2_cachedListLevelFieldSetting != null ? JSON.parse(r2_cachedListLevelFieldSetting) : null;
    // r2_cachedDicts = r2_cachedDicts != null ? JSON.parse(r2_cachedDicts) : null;
    // if(r2_cachedListLevelFieldSetting == null || r2_cachedDicts == null ) return;

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
    storage.setItem('r2FieldSetting',  JSON.stringify(Vue.prototype.$r2FieldSetting));
  }).catch(e =>{console.log(e)});
}
function initListLevelFieldSetting() {
  return new Promise((resolve, reject) => {
    getAllFieldSettingListLevel().then(res=>{
      var me = this,
          _cachedListLevelFieldSetting = {};

      res.tableContent.map(it=>{
        _cachedListLevelFieldSetting[it.fieldCode] = _cachedListLevelFieldSetting[it.fieldCode] ? 
          Array.isArray(_cachedListLevelFieldSetting[it.fieldCode]) ? _cachedListLevelFieldSetting[it.fieldCode].concat(it) : [it, _cachedListLevelFieldSetting[it.fieldCode]] 
          : it;
      });
      for(var val in _cachedListLevelFieldSetting){
        _cachedListLevelFieldSetting[val].sort(function(a, b){return a.sort - b.sort});
      }
      storage.setItem('r2_cachedListLevelFieldSetting', _cachedListLevelFieldSetting ? JSON.stringify(_cachedListLevelFieldSetting):'');
      resolve(_cachedListLevelFieldSetting ? JSON.stringify(_cachedListLevelFieldSetting):'');
    }).catch(e =>{e});
  });
}
function initDicts() {
  return new Promise((resolve, reject) => {
    getAllDict().then(res=>{
      var me = this,
      _cachedDicts = {};
      res.tableContent.map(it=>{
        _cachedDicts[it.value] = it;
      });
      storage.setItem('r2_cachedDicts',  _cachedDicts ? JSON.stringify(_cachedDicts):'');
      resolve(_cachedDicts ? JSON.stringify(_cachedDicts):'');
    }).catch(e =>{e});
  });
}
export default window.router
