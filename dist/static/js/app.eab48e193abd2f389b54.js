webpackJsonp([1],{"5m+1":function(t,s){},NHnr:function(t,s,e){"use strict";Object.defineProperty(s,"__esModule",{value:!0});var a=e("VCXJ"),i={data:()=>({tablist:[{title:"我的待办",path:"/to_do",icon:"icon-daiban"},{title:"我的已办",path:"/finish",icon:"icon-yiban"}],num:"0"}),created(){this.$event.$on("num",t=>{this.num=t})}},n={render:function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{attrs:{id:"app"}},[e("keep-alive",[e("router-view",{directives:[{name:"wechat-title",rawName:"v-wechat-title",value:t.$route.meta.title,expression:"$route.meta.title"}]})],1),t._v(" "),e("nav",{staticClass:"navbar"},t._l(t.tablist,function(s){return e("router-link",{attrs:{to:s.path}},[e("span",{staticClass:"iconfont",class:s.icon}),t._v(" "),e("p",[t._v(t._s(s.title))]),t._v(" "),e("span",{staticClass:"weui-badge",staticStyle:{position:"absolute",top:"0",right:"40%"}},[t._v(t._s(t.num))])])}))],1)},staticRenderFns:[]};var o=e("X4nt")(i,n,!1,function(t){e("V0XL")},null,null).exports,l=e("zO6J"),r=e("2sCs"),c=e.n(r);function _(t){return new Promise((s,e)=>{c.a.get("/H_roleplay-si/ds/getMyToDoTask",{headers:{authorization:t}}).then(t=>{console.log(t),s(t)}).catch(t=>{s(t)})})}function u(t,s){return new Promise((e,a)=>{c.a.get("/H_roleplay-si/ds/listTaskLogByTransCode",{headers:{authorization:s},params:{transCode:t}}).then(t=>{const s=t.data.tableContent;e(s)})})}var v={data:()=>({show:!1,listArr:[],more:"",arr:[]}),methods:{goDetail(t){this.$router.push({path:"/to_do/do_detail",query:{info:t}})},upCallback(){this.show=!0,this.more="没有数据"}},mounted(){this.mescroll=new MeScroll("td",{up:{callback:this.upCallback(),isBounce:!1,use:!1},down:{use:!1}})},created(){_(localStorage.getItem("token")).then(t=>{console.log(t),this.listArr=t.data.tableContent,this.$event.$emit("num",t.data.tableContent.length)})}},d={render:function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",[e("div",{staticClass:"page",attrs:{id:"td"}},[e("div",{staticClass:"wrapper"},[t._m(0),t._v(" "),e("ul",{staticClass:"list"},t._l(t.listArr,function(s){return e("li",{on:{click:function(e){t.goDetail(s)}}},[e("p",[e("span",{staticClass:"task_name"},[t._v(t._s(s.requireName))]),t._v(" "),e("i",{staticClass:"date"},[t._v(t._s(s.startTime.substring(0,10)))])]),t._v(" "),e("p",[e("span",{staticClass:"do_user"},[t._v("操作名称："+t._s(s.nodeName))]),t._v(" "),e("em",{staticClass:"status"},[t._v(t._s(s.status))])]),t._v(" "),e("p",[e("span",{staticClass:"do_user"},[t._v("发起人："+t._s(s.crtName))])]),t._v(" "),e("p",[e("em",{staticClass:"code"},[t._v(t._s(s.businessKey))])])])})),t._v(" "),t.show?e("div",{staticClass:"bottom"},[e("span",[t._v(t._s(t.more))])]):t._e()])]),t._v(" "),e("router-view")],1)},staticRenderFns:[function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{staticClass:"weui-search-bar",attrs:{id:"searchBar"}},[e("form",{staticClass:"weui-search-bar__form"},[e("div",{staticClass:"weui-search-bar__box"},[e("i",{staticClass:"weui-icon-search"}),t._v(" "),e("input",{staticClass:"weui-search-bar__input",attrs:{type:"search",id:"searchInput",placeholder:"搜索",required:""}}),t._v(" "),e("a",{staticClass:"weui-icon-clear",attrs:{href:"javascript:",id:"searchClear"}})]),t._v(" "),e("label",{staticClass:"weui-search-bar__label",attrs:{id:"searchText"}},[e("i",{staticClass:"weui-icon-search"}),t._v(" "),e("span",[t._v("搜索")])])]),t._v(" "),e("a",{staticClass:"weui-search-bar__cancel-btn",attrs:{href:"javascript:",id:"searchCancel"}},[t._v("取消")])])}]};var p=e("X4nt")(v,d,!1,function(t){e("WHHc")},null,null).exports,h={data:()=>({doneList:[],mescroll:null,more:"",show:!1}),methods:{goDetail(t){this.$router.push({path:"/finish/done_detail",query:{info:t}})},upCallback(){this.show=!0,this.more="没有数据了"}},created(){var t,s=localStorage.getItem("token");(t=s,new Promise((s,e)=>{c.a.get("/H_roleplay-si/ds/getMyDoneTask",{headers:{authorization:t}}).then(t=>{const e=t.data;s(e)})})).then(t=>{this.doneList=t.tableContent})},mounted(){this.mescroll=new MeScroll("finish",{up:{isBounce:!1,use:!1,callback:this.upCallback()},down:{use:!1}})}},f={render:function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",[e("div",{staticClass:"page mesroll",attrs:{id:"finish"}},[e("div",{staticClass:"wrapper"},[t._m(0),t._v(" "),e("ul",{staticClass:"list",attrs:{id:"finishTask"}},t._l(t.doneList,function(s){return e("li",{on:{click:function(e){t.goDetail(s)}}},[e("p",[e("span",{staticClass:"task_name"},[t._v(t._s(s.requireName))]),t._v(" "),e("i",{staticClass:"date"},[t._v(t._s(s.startTime.substring(0,10)))])]),t._v(" "),e("p",[e("span",{staticClass:"do_user"},[t._v("操作名称："+t._s(s.nodeName))]),t._v(" "),e("em",{staticClass:"status"},[t._v(t._s(s.status))])]),t._v(" "),e("p",[e("span",{staticClass:"do_user"},[t._v("发起人："+t._s(s.crtName))])]),t._v(" "),e("p",[e("em",{staticClass:"code"},[t._v("交易号："+t._s(s.businessKey))])]),t._v(" "),e("p",[e("em",{staticClass:"code"},[t._v("完成时间："+t._s(s.endTime))])])])})),t._v(" "),t.show?e("div",{staticClass:"bottom"},[e("span",[t._v(t._s(t.more))])]):t._e()])]),t._v(" "),e("router-view")],1)},staticRenderFns:[function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("div",{staticClass:"weui-search-bar",attrs:{id:"searchBar"}},[e("form",{staticClass:"weui-search-bar__form"},[e("div",{staticClass:"weui-search-bar__box"},[e("i",{staticClass:"weui-icon-search"}),t._v(" "),e("input",{staticClass:"weui-search-bar__input",attrs:{type:"search",id:"searchInput",placeholder:"搜索",required:""}}),t._v(" "),e("a",{staticClass:"weui-icon-clear",attrs:{href:"javascript:",id:"searchClear"}})]),t._v(" "),e("label",{staticClass:"weui-search-bar__label",attrs:{id:"searchText"}},[e("i",{staticClass:"weui-icon-search"}),t._v(" "),e("span",[t._v("搜索")])])]),t._v(" "),e("a",{staticClass:"weui-search-bar__cancel-btn",attrs:{href:"javascript:",id:"searchCancel"}},[t._v("取消")])])}]};var m=e("X4nt")(h,f,!1,function(t){e("m22/")},null,null).exports,C={data:()=>({infoList:[],detailInfo:{},showDialog:!1,dialogInfo:"确定同意该请求吗？"}),methods:{agree(){this.showDialog=!0,this.dialogInfo="确定同意该请求吗？"},reject(){this.dialogInfo="确定拒绝该请求吗?",this.showDialog=!0},close(){this.showDialog=!1}},created(){this.detailInfo=this.$route.query.info;let t=localStorage.getItem("token");console.log(t),u(this.detailInfo.businessKey,t).then(t=>{this.infoList=t})},mounted(){this.mescroll=new MeScroll("dProcess",{up:{isBounce:!1,use:!1},down:{use:!1}})}},w={render:function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("transition",{attrs:{"enter-active-class":"slideInRight","leave-active-class":"slideOutRight"}},[e("div",{attrs:{id:"td_detail"}},[e("div",{staticClass:"detail"},[e("p",{staticClass:"name"},[t._v(t._s(t.detailInfo.requireName))]),t._v(" "),e("p",{staticClass:"status1"},[t._v(t._s(t.detailInfo.status))])]),t._v(" "),e("ul",[t.detailInfo.requireName?e("li",[e("span",[t._v("需求名称:")]),t._v(" "),e("i",[t._v(t._s(t.detailInfo.requireName))])]):t._e(),t._v(" "),e("li",[e("span",[t._v("发 起 人:")]),t._v(" "),e("i",[t._v(t._s(t.detailInfo.crtName))])]),t._v(" "),e("li",[e("span",[t._v("发起时间:")]),t._v(" "),e("i",[t._v(t._s(t.detailInfo.crtTime))])]),t._v(" "),t.detailInfo.level?e("li",[e("span",[t._v("优 先 级:")]),t._v(" "),e("i",[t._v(t._s(t.detailInfo.level))])]):t._e(),t._v(" "),e("li",[e("span",[t._v("预计交付日：")]),t._v(" "),e("input",{attrs:{type:"date"}})])]),t._v(" "),e("div",{staticClass:"process limit",attrs:{id:"dProcess"}},[e("div",{staticClass:"wrapper"},[e("div",{staticClass:"agree_status"},t._l(t.infoList,function(s){return e("div",{staticClass:"allInfo"},[e("div",{staticClass:"info"},[e("i",{staticClass:"iconfont icon-shenfenzheng"}),t._v(" "),e("p",[e("span",[t._v(t._s(s.userName))]),t._v(" "),e("span",[t._v(t._s(s.nodeName))]),t._v(" "),e("span",[t._v(t._s(s.endTime))])]),t._v(" "),s.status?e("i",{staticClass:" weui-icon weui-icon-success"}):t._e(),t._v(" "),s.status?t._e():e("i",{staticClass:" weui-icon weui-icon-waiting",staticStyle:{top:"15px"}}),t._v(" "),e("em",{staticClass:"taskStatus"},[t._v(t._s(s.status))])]),t._v(" "),e("div",{staticClass:"iconfont icon-xia arrow"})])}))])]),t._v(" "),e("div",{staticClass:"btn"},[e("span",{on:{click:function(s){t.agree()}}},[t._v("同意")]),t._v(" "),e("span",{on:{click:function(s){t.reject()}}},[t._v("拒绝")])]),t._v(" "),t.showDialog?e("div",{staticClass:"js_dialog",staticStyle:{opacity:"1"},attrs:{id:"iosDialog1"}},[e("div",{staticClass:"weui-mask"}),t._v(" "),e("div",{staticClass:"weui-dialog"},[e("div",{staticClass:"weui-dialog__bd"},[t._v(t._s(t.dialogInfo))]),t._v(" "),e("div",{staticClass:"weui-dialog__ft"},[e("a",{staticClass:"weui-dialog__btn weui-dialog__btn_default",attrs:{href:"javascript:;"},on:{click:function(s){t.close()}}},[t._v("确认")]),t._v(" "),e("a",{staticClass:"weui-dialog__btn weui-dialog__btn_primary",attrs:{href:"javascript:;"},on:{click:function(s){t.close()}}},[t._v("取消")])])])]):t._e()])])},staticRenderFns:[]};var g=e("X4nt")(C,w,!1,function(t){e("5m+1")},null,null).exports,b={data:()=>({infoList:[],detailInfo:{}}),created(){this.detailInfo=this.$route.query.info;let t=localStorage.getItem("token");console.log(t),u(this.detailInfo.businessKey,t).then(t=>{this.infoList=t})},mounted(){this.mescroll=new MeScroll("taskDetail",{up:{isBounce:!1,use:!1},down:{use:!1}})}},I={render:function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("transition",{attrs:{"enter-active-class":"slideInRight","leave-active-class":"slideOutRight"}},[e("div",{attrs:{id:"finish_detail"}},[e("div",{attrs:{id:"taskDetail"}},[e("div",{staticClass:"wrapper"},[e("div",{staticClass:"detail"},[e("p",{staticClass:"name"},[t._v(t._s(t.detailInfo.requireName))]),t._v(" "),e("p",{staticClass:"status1 done_status"},[t._v(t._s(t.detailInfo.status))])]),t._v(" "),e("ul",[t.detailInfo.requireName?e("li",[e("span",[t._v("需求名称:")]),t._v(" "),e("i",[t._v(t._s(t.detailInfo.requireName))])]):t._e(),t._v(" "),e("li",[e("span",[t._v("发 起 人:")]),t._v(" "),e("i",[t._v(t._s(t.detailInfo.crtName))])]),t._v(" "),e("li",[e("span",[t._v("发起时间:")]),t._v(" "),e("i",[t._v(t._s(t.detailInfo.crtTime))])]),t._v(" "),t.detailInfo.level?e("li",[e("span",[t._v("优 先 级:")]),t._v(" "),e("i",[t._v(t._s(t.detailInfo.level))])]):t._e()]),t._v(" "),e("div",{staticClass:"process"},[e("div",{staticClass:"agree_status"},[t._l(t.infoList,function(s){return e("div",{staticClass:"allInfo"},[e("div",{staticClass:"info"},[e("i",{staticClass:"iconfont icon-shenfenzheng"}),t._v(" "),e("p",[e("span",[t._v(t._s(s.userName))]),t._v(" "),e("span",[t._v(t._s(s.nodeName))]),t._v(" "),e("span",[t._v(t._s(s.endTime))])]),t._v(" "),s.status?e("i",{staticClass:" weui-icon weui-icon-success"}):t._e(),t._v(" "),s.status?t._e():e("i",{staticClass:" weui-icon weui-icon-waiting",staticStyle:{top:"15px"}}),t._v(" "),e("em",{staticClass:"taskStatus"},[t._v(t._s(s.status))])]),t._v(" "),e("div",{staticClass:"iconfont icon-xia arrow"})])}),t._v(" "),"进行中"!=t.detailInfo.status?e("div",{staticClass:"process_over"},[t._v("流程结束")]):t._e()],2)])])])])])},staticRenderFns:[]};var k=e("X4nt")(b,I,!1,function(t){e("W4v3")},null,null).exports,y=e("HLLT"),$=e.n(y),N={data:()=>({}),created(){var t=localStorage.getItem("token"),s=this;setTimeout(function(){var e;_(t).then(t=>{if(200==t.status)console.log(t.data),s.$router.replace("/to_do");else{console.log("进入了");var a=location.href;if(a.indexOf("code")>0){var i=a.split("?")[1].split("&")[0].split("=")[1];(e=i,new Promise((t,s)=>{c.a.get("/H_roleplay-si/wxLogin?code="+e+"&state=1").then(s=>{const e=s.data;t(e)})})).then(t=>{localStorage.setItem("token",t.token),s.$router.replace("/to_do")})}else{window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=ww3c1aa17c16e380b7&redirect_uri=https%3a%2f%2frfd.roletask.com%2fRose%2f%23%2fto_do&response_type=code&scope=snsapi_base&agentid=1000017&state=1#wechat_redirect"}}})},0)}},x={render:function(){var t=this.$createElement;return(this._self._c||t)("router-view")},staticRenderFns:[]};var S=e("X4nt")(N,x,!1,function(t){e("SDCm")},null,null).exports;a.a.use($.a),a.a.use(l.a);var T=new l.a({routes:[{path:"/to_do",component:p,meta:{title:"我的待办"},children:[{path:"do_detail",component:g}]},{path:"/finish",component:m,meta:{title:"我的已办"},children:[{path:"done_detail",component:k}]},{path:"/welcome",component:S},{path:"/",redirect:"/welcome"}]});a.a.config.productionTip=!1,a.a.prototype.$http=c.a,a.a.prototype.$event=new a.a,new a.a({el:"#app",router:T,template:"<App/>",components:{App:o}})},SDCm:function(t,s){},V0XL:function(t,s){},W4v3:function(t,s){},WHHc:function(t,s){},"m22/":function(t,s){}},["NHnr"]);
//# sourceMappingURL=app.eab48e193abd2f389b54.js.map