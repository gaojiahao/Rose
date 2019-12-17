/*
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-12-03 09:54:38
 * @LastEditors: Gabriel.gaojiahao
 * @LastEditTime: 2019-12-12 14:39:42
 */
import Vue from 'vue'
import Router from 'vue-router'
import HomeRouter from '@/home/router'
import MsgRouter from '@/msg/router'

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
      ...HomeRouter,
      ...MsgRouter
    ]
  })

  window.router.beforeEach((to, from, next) => {
    let {query,fullPath} = to;
    if(query.tag&&query.tag=='share'){
      storage.setItem('shareUrl',window.location.href);
    }
    if(to.name !== 'Login'){
      if(!storage.getItem('r2_cachedListLevelFieldSetting')){
        initListLevelFieldSetting();   
      }
      if(!storage.getItem('r2_cachedDicts')){
        initDicts();   
      }
      if(!Vue.prototype.$r2FieldSetting){
        initFieldSetting();
      }
    }
    next();
  })
}

//获取系统字段模型
async function initFieldSetting(){
  await getFieldSetting().then( res=>{
    var me = this,
        r2_cachedListLevelFieldSetting = JSON.parse(storage.getItem('r2_cachedListLevelFieldSetting')),
        r2_cachedDicts = JSON.parse(storage.getItem('r2_cachedDicts'));

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
  });
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
    storage.setItem(r2_cachedListLevelFieldSetting,  JSON.stringify(_cachedListLevelFieldSetting));
  });
}

async function initDicts() {
  await getAllDict().then(res=>{
    var me = this,
    _cachedDicts = {};
    res.tableContent.map(it=>{
      _cachedDicts[it.value] = it;
    });
    //console.log('_cachedDicts',_cachedDicts);
    storage.setItem('r2_cachedDicts',  JSON.stringify(_cachedDicts));
  });
}

function ensureUrl(url) {
  if (/^\/H_roleplay-si/i.test(url)) {
      return url;
  } else if (/^\/R_roleplay-si/i.test(url)) {
      return url.replace(/^\/R_roleplay-si/i, '/H_roleplay-si');
  } else if (/^\/account-api/i.test(url)) {
      return url;
  } else if (/^\/corebiz-api/i.test(url)) {
      return url;
  } else {
      return '/H_roleplay-si' + url;
  }
}
export default window.router
