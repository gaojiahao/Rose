webpackJsonp([1],{"1Bso":function(t,s){},GRJM:function(t,s){},NHnr:function(t,s,a){"use strict";Object.defineProperty(s,"__esModule",{value:!0});var e=a("HWwm"),i={render:function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{attrs:{id:"app"}},[a("keep-alive",[a("router-view",{directives:[{name:"wechat-title",rawName:"v-wechat-title",value:t.$route.meta.title,expression:"$route.meta.title"}]})],1),t._v(" "),a("nav",{staticClass:"navbar"},t._l(t.tablist,function(s){return a("router-link",{attrs:{to:s.path}},[a("span",{staticClass:"iconfont",class:s.icon}),t._v(" "),a("p",[t._v(t._s(s.title))]),t._v(" "),a("span",{staticClass:"weui-badge",staticStyle:{position:"absolute",top:"0",right:"40%"}},[t._v(t._s(t.num))])])}))],1)},staticRenderFns:[]},n=a("UF+H")({data:function(){return{tablist:[{title:"我的待办",path:"/to_do",icon:"icon-daiban"},{title:"我的已办",path:"/finish",icon:"icon-yiban"}],num:0}},created:function(){var t=this;this.$event.$on("num",function(s){t.num=s})}},i,!1,function(t){a("1Bso")},null,null).exports,o=a("ie8r"),r=a("VLzP"),c=a.n(r),l=a("s9z8"),_=a.n(l),u=void 0,v={data:function(){return{isLoadMore:!1,listArr:[],more:"加载中",arr:[]}},methods:{goDetail:function(t){this.$router.push({path:"to_do/detail",query:{info:t}})}},mounted:function(){var t=this;(u=new IScroll("#td",{probeType:2,click:!0})).on("scrollStart",function(){u.maxScrollY<0&&(t.isLoadMore=!0),u.refresh()}),u.on("scroll",function(){u.y<=u.maxScrollY-30&&(t.more="没有数据了")})},created:function(){var t=this;(function(t){return new c.a(function(s,a){_.a.get("/H_roleplay-si/wxLogin?code="+t+"&state=1").then(function(t){var a=t.data;s(a)})})})(location.href.split("?")[1].split("&")[0].split("=")[1]).then(function(t){console.log(t),localStorage.setItem("token",t.token)});var s=localStorage.getItem("token");console.log(s),function(t){return console.log(t),new c.a(function(s,a){_.a.get("/H_roleplay-si/ds/getMyToDoTask",{headers:{authorization:t}}).then(function(t){var a=t.data;s(a)})})}(s).then(function(s){t.listArr=s.tableContent,t.$event.$emit("num",s.tableContent.length)})}},d={render:function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",[a("div",{staticClass:"page",attrs:{id:"td"}},[a("div",{staticClass:"wrapper"},[t._m(0),t._v(" "),a("ul",{staticClass:"list"},t._l(t.listArr,function(s){return a("li",{on:{click:function(a){t.goDetail(s)}}},[a("p",[a("span",{staticClass:"task_name"},[t._v(t._s(s.requireName))]),t._v(" "),a("i",{staticClass:"date"},[t._v(t._s(s.startTime.substring(0,10)))])]),t._v(" "),a("p",[a("span",{staticClass:"do_user"},[t._v("操作名称："+t._s(s.nodeName))]),t._v(" "),a("em",{staticClass:"status"},[t._v(t._s(s.status))])]),t._v(" "),a("p",[a("span",{staticClass:"do_user"},[t._v("发起人："+t._s(s.crtName))])]),t._v(" "),a("p",[a("em",{staticClass:"code"},[t._v(t._s(s.businessKey))])])])})),t._v(" "),t.isLoadMore?a("div",{staticClass:"bottom"},[a("span",[t._v(t._s(t.more))])]):t._e()])]),t._v(" "),a("router-view")],1)},staticRenderFns:[function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"weui-search-bar",attrs:{id:"searchBar"}},[s("form",{staticClass:"weui-search-bar__form"},[s("div",{staticClass:"weui-search-bar__box"},[s("i",{staticClass:"weui-icon-search"}),this._v(" "),s("input",{staticClass:"weui-search-bar__input",attrs:{type:"search",id:"searchInput",placeholder:"搜索",required:""}}),this._v(" "),s("a",{staticClass:"weui-icon-clear",attrs:{href:"javascript:",id:"searchClear"}})]),this._v(" "),s("label",{staticClass:"weui-search-bar__label",attrs:{id:"searchText"}},[s("i",{staticClass:"weui-icon-search"}),this._v(" "),s("span",[this._v("搜索")])])]),this._v(" "),s("a",{staticClass:"weui-search-bar__cancel-btn",attrs:{href:"javascript:",id:"searchCancel"}},[this._v("取消")])])}]},h=a("UF+H")(v,d,!1,function(t){a("lEBP")},null,null).exports,p=void 0,f={data:function(){return{isLoadMore:!1,doneList:[],more:"加载中"}},methods:{goDetail:function(t){this.$router.push({path:"to_do/detail",query:{info:t}})}},mounted:function(){var t=this;(p=new IScroll("#finish",{probeType:2,click:!0})).on("scrollStart",function(){p.maxScrollY<0&&(t.isLoadMore=!0),p.refresh()}),p.on("scroll",function(){p.y<=p.maxScrollY-30&&(t.more="没有数据了")})},created:function(){var t=this;(function(t){return new c.a(function(s,a){_.a.get("/H_roleplay-si/ds/getMyDoneTask",{headers:{authorization:t}}).then(function(t){var a=t.data;s(a)})})})(localStorage.getItem("token")).then(function(s){t.doneList=s.tableContent})}},m={render:function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",[a("div",{staticClass:"page",attrs:{id:"finish"}},[a("div",{staticClass:"wrapper"},[t._m(0),t._v(" "),a("ul",{staticClass:"list"},t._l(t.doneList,function(s){return a("li",{on:{click:function(a){t.goDetail(s)}}},[a("p",[a("span",{staticClass:"task_name"},[t._v(t._s(s.requireName))]),t._v(" "),a("i",{staticClass:"date"},[t._v(t._s(s.startTime.substring(0,10)))])]),t._v(" "),a("p",[a("span",{staticClass:"do_user"},[t._v("操作名称："+t._s(s.nodeName))]),t._v(" "),a("em",{staticClass:"status"},[t._v(t._s(s.status))])]),t._v(" "),a("p",[a("span",{staticClass:"do_user"},[t._v("发起人："+t._s(s.crtName))])]),t._v(" "),a("p",[a("em",{staticClass:"code"},[t._v("交易号："+t._s(s.businessKey))])]),t._v(" "),a("p",[a("em",{staticClass:"code"},[t._v("完成时间："+t._s(s.endTime))])])])})),t._v(" "),t.isLoadMore?a("div",{staticClass:"bottom"},[a("span",[t._v(t._s(t.more))])]):t._e()])]),t._v(" "),a("router-view")],1)},staticRenderFns:[function(){var t=this.$createElement,s=this._self._c||t;return s("div",{staticClass:"weui-search-bar",attrs:{id:"searchBar"}},[s("form",{staticClass:"weui-search-bar__form"},[s("div",{staticClass:"weui-search-bar__box"},[s("i",{staticClass:"weui-icon-search"}),this._v(" "),s("input",{staticClass:"weui-search-bar__input",attrs:{type:"search",id:"searchInput",placeholder:"搜索",required:""}}),this._v(" "),s("a",{staticClass:"weui-icon-clear",attrs:{href:"javascript:",id:"searchClear"}})]),this._v(" "),s("label",{staticClass:"weui-search-bar__label",attrs:{id:"searchText"}},[s("i",{staticClass:"weui-icon-search"}),this._v(" "),s("span",[this._v("搜索")])])]),this._v(" "),s("a",{staticClass:"weui-search-bar__cancel-btn",attrs:{href:"javascript:",id:"searchCancel"}},[this._v("取消")])])}]},C=a("UF+H")(f,m,!1,function(t){a("qTil")},null,null).exports,w={data:function(){return{infoList:[],detailInfo:{},showDialog:!1,dialogInfo:"确定同意该请求吗？"}},methods:{agree:function(){this.showDialog=!0},reject:function(){this.dialogInfo="确定拒绝该请求吗",this.showDialog=!0},close:function(){this.showDialog=!1}},created:function(){var t=this;this.detailInfo=this.$route.query.info;var s=localStorage.getItem("token");(function(t,s){return new c.a(function(a,e){_.a.get("/H_roleplay-si/ds/listTaskLogByTransCode",{headers:{authorization:s},params:{transCode:t}}).then(function(t){var s=t.data.tableContent;a(s)})})})(this.detailInfo.businessKey,s).then(function(s){t.infoList=s})},mounted:function(){new IScroll(".taskDetail",{probeType:2,tap:!0})}},g={render:function(){var t=this,s=t.$createElement,a=t._self._c||s;return a("div",{attrs:{id:"td_detail"}},[a("div",{staticClass:"taskDetail",staticStyle:{overflow:"hidden"}},[a("div",{staticClass:"wrapper"},[a("div",{staticClass:"detail"},[a("p",{staticClass:"name"},[t._v(t._s(t.detailInfo.requireName))]),t._v(" "),a("p",{staticClass:"status1"},[t._v(t._s(t.detailInfo.status))])]),t._v(" "),a("ul",[a("li",[a("span",[t._v("需求名称:")]),t._v(" "),a("i",[t._v(t._s(t.detailInfo.requireName))])]),t._v(" "),a("li",[a("span",[t._v("发 起 人:")]),t._v(" "),a("i",[t._v(t._s(t.detailInfo.crtName))])]),t._v(" "),a("li",[a("span",[t._v("发起时间:")]),t._v(" "),a("i",[t._v(t._s(t.detailInfo.crtTime))])]),t._v(" "),a("li",[a("span",[t._v("优 先 级:")]),t._v(" "),a("i",[t._v(t._s(t.detailInfo.level))])]),t._v(" "),"进行中"==t.detailInfo.status?a("li",[a("span",{staticStyle:{color:"#E64340"}},[t._v("预计交付日：")]),t._v(" "),a("input",{attrs:{type:"date"}})]):t._e()]),t._v(" "),a("div",{staticClass:"process"},[a("div",{staticClass:"agree_status"},t._l(t.infoList,function(s){return a("div",{staticClass:"allInfo"},[a("div",{staticClass:"info"},[a("i",{staticClass:"iconfont icon-shenfenzheng"}),t._v(" "),a("p",[a("span",[t._v(t._s(s.userName))]),t._v(" "),a("span",[t._v(t._s(s.nodeName))]),t._v(" "),a("span",[t._v(t._s(s.endTime))])]),t._v(" "),s.status?a("i",{staticClass:" weui-icon weui-icon-success"}):t._e(),t._v(" "),s.status?t._e():a("i",{staticClass:" weui-icon weui-icon-waiting",staticStyle:{top:"15px"}}),t._v(" "),a("em",{staticClass:"taskStatus"},[t._v(t._s(s.status))])]),t._v(" "),a("div",{staticClass:"iconfont icon-xia arrow"})])}))])])]),t._v(" "),a("div",{staticClass:"btn"},[a("span",{on:{click:function(s){t.agree()}}},[t._v("同意")]),t._v(" "),a("span",{on:{click:function(s){t.reject()}}},[t._v("拒绝")])]),t._v(" "),t.showDialog?a("div",{staticClass:"js_dialog",staticStyle:{opacity:"1"},attrs:{id:"iosDialog1"}},[a("div",{staticClass:"weui-mask"}),t._v(" "),a("div",{staticClass:"weui-dialog"},[a("div",{staticClass:"weui-dialog__bd"},[t._v(t._s(t.dialogInfo))]),t._v(" "),a("div",{staticClass:"weui-dialog__ft"},[a("a",{staticClass:"weui-dialog__btn weui-dialog__btn_default",attrs:{href:"javascript:;"},on:{click:function(s){t.close()}}},[t._v("确认")]),t._v(" "),a("a",{staticClass:"weui-dialog__btn weui-dialog__btn_primary",attrs:{href:"javascript:;"},on:{click:function(s){t.close()}}},[t._v("取消")])])])]):t._e()])},staticRenderFns:[]},b=a("UF+H")(w,g,!1,function(t){a("GRJM")},null,null).exports,y=a("Amyk"),k=a.n(y);e.a.use(k.a),e.a.use(o.a);var I=new o.a({routes:[{path:"/to_do",component:h,meta:{title:"我的待办"},children:[{path:"detail",component:b}]},{path:"/finish",component:C,meta:{title:"我的已办"}},{path:"/",redirect:"/to_do"}]});e.a.config.productionTip=!1,e.a.prototype.$http=_.a,e.a.prototype.$event=new e.a,new e.a({el:"#app",router:I,template:"<App/>",components:{App:n}})},lEBP:function(t,s){},qTil:function(t,s){}},["NHnr"]);
//# sourceMappingURL=app.2b5f55f057e2378f7733.js.map