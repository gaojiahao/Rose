webpackJsonp([1],{"0LVZ":function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("EOUf"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("Feja");var r=function(e){a("qplK")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},"1T0R":function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("nHSH");t.default={data:function(){return{doneList:[],mescroll:null,show:!0,list:[]}},methods:{goDetail:function(e){this.$router.push({path:"/finish/done_detail",query:{info:e}})}},created:function(){var e=this,t=localStorage.getItem("token");(0,i.getDoneTask)(t).then(function(t){e.doneList=t.tableContent,console.log(t)})},mounted:function(){this.mescroll=new MeScroll("finish",{up:{isBounce:!1,use:!1},down:{use:!1}})}}},"29vh":function(e,t,a){"use strict";var i={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("transition",{attrs:{"enter-active-class":"slideInRight","leave-active-class":"slideOutRight"}},[a("div",{attrs:{id:"finish_detail"}},[a("div",{staticClass:"mescroll",attrs:{id:"taskDetail"}},[a("div",{staticClass:"wrapper"},[e.detailInfo.baseinfo&&e.detailInfo.requirement?a("group",{attrs:{"label-width":"4.5em","label-margin-right":"2em","label-align":"left"}},[a("cell",{attrs:{title:"需求编码",value:e.detailInfo.transCode,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"提交人",value:e.detailInfo.baseinfo.creatorName,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"创建时间",value:e.detailInfo.baseinfo.crtTime,"value-align":"left"}}),e._v(" "),e.detailInfo.baseinfo.requireName?a("cell",{attrs:{title:"需求名称",value:e.detailInfo.requirement.requireName,"value-align":"left"}}):e._e(),e._v(" "),e.detailInfo.requirement.level.value?a("cell",{attrs:{title:"优先级",value:e.detailInfo.requirement.level.value,"value-align":"left"}}):e._e(),e._v(" "),e.detailInfo.requirement.level.value?e._e():a("cell",{attrs:{title:"优先级",value:e.detailInfo.requirement.level,"value-align":"left"}}),e._v(" "),e.detailInfo.requirement.etc?a("cell",{attrs:{title:"预计交付时间",value:e.detailInfo.requirement.etc,"value-align":"left"}}):e._e(),e._v(" "),e.detailInfo.requirement.userStory?a("cell",{attrs:{title:"用户故事",value:e.detailInfo.requirement.userStory,"value-align":"left"}}):e._e(),e._v(" "),a("cell",{attrs:{title:"工作流","is-link":"","border-intent":!1,"arrow-direction":e.show?"up":"down"},nativeOn:{click:function(t){e.show=!e.show}}})],1):e._e(),e._v(" "),e.detailInfo.requirement?e._e():a("group",{attrs:{"label-width":"4.5em","label-margin-right":"2em","label-align":"left"}},[a("cell",{attrs:{title:"需求编码",value:e.detailInfo.transCode,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"提交人",value:e.detailInfo.baseinfo.creatorName,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"创建时间",value:e.detailInfo.baseinfo.crtTime,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"工作流","is-link":"","border-intent":!1,"arrow-direction":e.show?"up":"down"},nativeOn:{click:function(t){e.show=!e.show}}})],1),e._v(" "),e.show?a("div",{staticClass:"process"},[a("div",{staticClass:"agree_status"},[e._l(e.infoList,function(t){return a("div",{staticClass:"allInfo"},[a("div",{staticClass:"info"},[a("i",{staticClass:"iconfont icon-shenfenzheng"}),e._v(" "),a("p",[a("span",[e._v(e._s(t.userName))]),e._v(" "),a("span",[e._v(e._s(t.nodeName))])]),e._v(" "),a("p",[a("span",[e._v(e._s(t.endTime))])]),e._v(" "),t.message?a("p",[a("span",[e._v("审批意见："+e._s(t.message))])]):e._e(),e._v(" "),t.status?a("i",{staticClass:" weui-icon weui-icon-success"}):e._e(),e._v(" "),t.status?e._e():a("i",{staticClass:" weui-icon weui-icon-waiting",staticStyle:{top:"15px"}})]),e._v(" "),a("div",{staticClass:"iconfont icon-xia arrow"})])}),e._v(" "),"进行中"!=e.detailInfo.status?a("div",{staticClass:"process_over"},[e._v("流程结束")]):e._e()],2)]):e._e()],1)])])])},staticRenderFns:[]};t.a=i},"42M5":function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("e04t"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("SzJl");var r=function(e){a("RaNe")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},AoWc:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("XdZA"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("sVYj");var r=function(e){a("aM96")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},DydW:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("1T0R"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("jJFf");var r=function(e){a("jSAH")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},EOUf:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=c(a("ZLEe")),n=c(a("zjwm")),l=c(a("TxQy")),s=c(a("qXfr")),r=c(a("AoWc")),o=c(a("ONf4")),u=c(a("Tvtw"));function c(e){return e&&e.__esModule?e:{default:e}}t.default={name:"datetime",mixins:[o.default],components:{Group:s.default,InlineDesc:r.default,Icon:n.default},props:{format:{type:String,default:"YYYY-MM-DD"},title:String,value:{type:String,default:""},inlineDesc:String,placeholder:String,minYear:Number,maxYear:Number,confirmText:String,cancelText:String,clearText:String,yearRow:{type:String,default:"{value}"},monthRow:{type:String,default:"{value}"},dayRow:{type:String,default:"{value}"},hourRow:{type:String,default:"{value}"},minuteRow:{type:String,default:"{value}"},required:{type:Boolean,default:!1},minHour:{type:Number,default:0},maxHour:{type:Number,default:23},startDate:{type:String,validator:function(e){return!e||10===e.length}},endDate:{type:String,validator:function(e){return!e||10===e.length}},valueTextAlign:String,displayFormat:Function,readonly:Boolean,hourList:Array,minuteList:Array,show:Boolean,defaultSelectedValue:String,computeHoursFunction:Function,computeDaysFunction:Function},created:function(){this.isFirstSetValue=!1,this.currentValue=this.value},data:function(){return{currentShow:!1,currentValue:null,valid:!0,errors:{}}},mounted:function(){var e=this,t=this.uuid;this.$el.setAttribute("id","vux-datetime-"+t),this.readonly||this.$nextTick(function(){e.render(),e.show&&e.$nextTick(function(){e.picker&&e.picker.show(e.currentValue)})})},computed:{pickerOptions:function(){var e=this,t={trigger:"#vux-datetime-"+this.uuid,format:this.format,value:this.currentValue,output:".vux-datetime-value",confirmText:e.getButtonText("confirm"),cancelText:e.getButtonText("cancel"),clearText:e.clearText,yearRow:this.yearRow,monthRow:this.monthRow,dayRow:this.dayRow,hourRow:this.hourRow,minuteRow:this.minuteRow,minHour:this.minHour,maxHour:this.maxHour,startDate:this.startDate,endDate:this.endDate,hourList:this.hourList,minuteList:this.minuteList,defaultSelectedValue:this.defaultSelectedValue,computeHoursFunction:this.computeHoursFunction,computeDaysFunction:this.computeDaysFunction,onSelect:function(t,a,i){e.picker&&e.picker.config.renderInline&&(e.$emit("input",i),e.$emit("on-change",i))},onConfirm:function(t){e.currentValue=t},onClear:function(t){e.$emit("on-clear",t)},onHide:function(t){e.currentShow=!1,e.$emit("update:show",!1),e.validate(),e.$emit("on-hide",t),"cancel"===t&&e.$emit("on-cancel"),"confirm"===t&&e.$emit("on-confirm")},onShow:function(){e.currentShow=!0,e.$emit("update:show",!0),e.$emit("on-show")}};return this.minYear&&(t.minYear=this.minYear),this.maxYear&&(t.maxYear=this.maxYear),t},firstError:function(){var e=(0,i.default)(this.errors)[0];return this.errors[e]},labelClass:function(){return{"vux-cell-justify":"justify"===this.$parent.labelAlign||"justify"===this.$parent.$parent.labelAlign}}},methods:{getButtonText:function(e){return"cancel"===e&&this.cancelText?this.cancelText:"confirm"===e&&this.confirmText?this.confirmText:this.$el.getAttribute("data-"+e+"-text")},render:function(){var e=this;this.$nextTick(function(){e.picker&&e.picker.destroy(),e.picker=new l.default(e.pickerOptions)})},validate:function(){if(!this.currentValue&&this.required)return this.valid=!1,void(this.errors.required="必填");this.valid=!0,this.errors={}}},watch:{readonly:function(e){e?this.picker&&this.picker.destroy():this.render()},show:function(e){e!==this.currentShow&&(e?this.picker&&this.picker.show(this.currentValue):this.picker&&this.picker.hide(this.currentValue))},currentValue:function(e,t){this.$emit("input",e),this.isFirstSetValue?this.$emit("on-change",e):(this.isFirstSetValue=!0,t&&this.$emit("on-change",e)),this.validate()},startDate:function(){this.render()},endDate:function(){this.render()},format:function(e){this.currentValue&&(this.currentValue=(0,u.default)(this.currentValue,e)),this.render()},value:function(e){this.readonly||this.picker&&this.picker.config.renderInline?this.currentValue=e:this.currentValue!==e&&(this.currentValue=e,this.render())}},beforeDestroy:function(){this.picker&&this.picker.destroy()}}},"F+FH":function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("sAbS"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("sXkm");var r=function(e){a("XP3O")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},Feja:function(e,t,a){"use strict";var i={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("a",{staticClass:"vux-datetime weui-cell",class:{"weui-cell_access":!e.readonly},attrs:{"data-cancel-text":"取消","data-confirm-text":"确定",href:"javascript:"}},[e._t("default",[a("div",[e._t("title",[a("p",{class:e.labelClass,style:{width:e.$parent.labelWidth,textAlign:e.$parent.labelAlign,marginRight:e.$parent.labelMarginRight},domProps:{innerHTML:e._s(e.title)}})]),e._v(" "),e.inlineDesc?a("inline-desc",[e._v(e._s(e.inlineDesc))]):e._e()],2),e._v(" "),a("div",{staticClass:"weui-cell__ft vux-cell-primary vux-datetime-value",style:{textAlign:e.valueTextAlign}},[!e.currentValue&&e.placeholder?a("span",{staticClass:"vux-cell-placeholder"},[e._v(e._s(e.placeholder))]):e._e(),e._v(" "),e.currentValue?a("span",{staticClass:"vux-cell-value"},[e._v(e._s(e.displayFormat?e.displayFormat(e.currentValue):e.currentValue))]):e._e(),e._v(" "),a("icon",{directives:[{name:"show",rawName:"v-show",value:!e.valid,expression:"!valid"}],staticClass:"vux-input-icon",attrs:{type:"warn",title:e.firstError}})],1)])],2)},staticRenderFns:[]};t.a=i},FmGn:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("oZKD"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("vHCn");var r=function(e){a("lFh0")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},IN7x:function(e,t){},KkqI:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i,n=a("cHyu"),l=(i=n)&&i.__esModule?i:{default:i};t.default={name:"group",methods:{cleanStyle:l.default},props:{title:String,titleColor:String,labelWidth:String,labelAlign:String,labelMarginRight:String,gutter:[String,Number]}}},M93x:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("Q3GK"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("zgKB");var r=function(e){a("QD8p")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},NHnr:function(e,t,a){"use strict";var i=r(a("VCXJ")),n=r(a("M93x")),l=r(a("YaEn")),s=r(a("2sCs"));function r(e){return e&&e.__esModule?e:{default:e}}i.default.config.productionTip=!1,i.default.prototype.$http=s.default,i.default.prototype.$event=new i.default,new i.default({el:"#app",router:l.default,template:"<App/>",components:{App:n.default}})},NWFM:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i,n=a("px/9"),l=(i=n)&&i.__esModule?i:{default:i};t.default={mixins:[l.default],name:"x-dialog",model:{prop:"show",event:"change"},props:{show:{type:Boolean,default:!1},maskTransition:{type:String,default:"vux-mask"},maskZIndex:[String,Number],dialogTransition:{type:String,default:"vux-dialog"},dialogClass:{type:String,default:"weui-dialog"},hideOnBlur:Boolean,dialogStyle:Object,scroll:{type:Boolean,default:!0,validator:function(e){return!0}}},computed:{maskStyle:function(){if(void 0!==this.maskZIndex)return{zIndex:this.maskZIndex}}},mounted:function(){"undefined"!=typeof window&&window.VUX_CONFIG&&"VIEW_BOX"===window.VUX_CONFIG.$layout&&(this.layout="VIEW_BOX")},watch:{show:function(e){this.$emit("update:show",e),this.$emit(e?"on-show":"on-hide"),e?this.addModalClassName():this.removeModalClassName()}},methods:{shouldPreventScroll:function(){var e=/iPad|iPhone|iPod/i.test(window.navigator.userAgent),t=this.$el.querySelector("input")||this.$el.querySelector("textarea");if(e&&t)return!0},hide:function(){this.hideOnBlur&&(this.$emit("update:show",!1),this.$emit("change",!1),this.$emit("on-click-mask"))}},data:function(){return{layout:""}}}},"O/gm":function(e,t,a){"use strict";var i={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[e.title?a("div",{staticClass:"weui-cells__title",style:e.cleanStyle({color:e.titleColor}),domProps:{innerHTML:e._s(e.title)}}):e._e(),e._v(" "),e._t("title"),e._v(" "),a("div",{staticClass:"weui-cells",class:{"vux-no-group-title":!e.title},style:e.cleanStyle({marginTop:"number"==typeof e.gutter?e.gutter+"px":e.gutter})},[e._t("after-title"),e._v(" "),e._t("default")],2)],2)},staticRenderFns:[]};t.a=i},Q3GK:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={data:function(){return{tablist:[{title:"我的待办",path:"/to_do",icon:"icon-daiban"},{title:"我的已办",path:"/finish",icon:"icon-yiban"}],num:"0"}},created:function(){var e=this;this.$event.$on("num",function(t){e.num=t})}}},QD8p:function(e,t){},RaNe:function(e,t){},SzJl:function(e,t,a){"use strict";var i={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",[a("div",{staticClass:"page mescroll",attrs:{id:"td"}},[a("div",{staticClass:"wrapper"},[e._m(0),e._v(" "),a("ul",{staticClass:"list"},e._l(e.listArr,function(t,i){return a("li",{key:i,on:{click:function(a){e.goDetail(t.businessKey)}}},[a("p",[a("span",{staticClass:"task_name"},[e._v(e._s(t.requireName))]),e._v(" "),a("i",{staticClass:"date"},[e._v(e._s(t.startTime.substring(0,10)))])]),e._v(" "),a("p",[a("span",{staticClass:"do_user"},[e._v("操作名称："+e._s(t.nodeName))]),e._v(" "),a("em",{staticClass:"status"},[e._v(e._s(t.status))])]),e._v(" "),a("p",[a("span",{staticClass:"do_user"},[e._v("发起人："+e._s(t.crtName))])]),e._v(" "),a("p",[a("em",{staticClass:"code"},[e._v(e._s(t.businessKey))])])])}))])]),e._v(" "),a("router-view")],1)},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"weui-search-bar",attrs:{id:"searchBar"}},[t("form",{staticClass:"weui-search-bar__form"},[t("div",{staticClass:"weui-search-bar__box"},[t("i",{staticClass:"weui-icon-search"}),this._v(" "),t("input",{staticClass:"weui-search-bar__input",attrs:{type:"search",id:"searchInput",placeholder:"搜索",required:""}}),this._v(" "),t("a",{staticClass:"weui-icon-clear",attrs:{href:"javascript:",id:"searchClear"}})]),this._v(" "),t("label",{staticClass:"weui-search-bar__label",attrs:{id:"searchText"}},[t("i",{staticClass:"weui-icon-search"}),this._v(" "),t("span",[this._v("搜索")])])]),this._v(" "),t("a",{staticClass:"weui-search-bar__cancel-btn",attrs:{href:"javascript:",id:"searchCancel"}},[this._v("取消")])])}]};t.a=i},TS2B:function(e,t){},Wvra:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("Yq8K"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("hC2f");var r=function(e){a("TS2B")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},XP3O:function(e,t){},XdZA:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"inline-desc"}},YaEn:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=d(a("VCXJ")),n=d(a("zO6J")),l=d(a("42M5")),s=d(a("DydW")),r=d(a("Wvra")),o=d(a("iCzg")),u=d(a("HLLT")),c=d(a("F+FH"));function d(e){return e&&e.__esModule?e:{default:e}}i.default.use(u.default),i.default.use(n.default),t.default=new n.default({routes:[{path:"/to_do",component:l.default,meta:{title:"我的待办"},children:[{path:"do_detail",component:r.default}]},{path:"/finish",component:s.default,meta:{title:"我的已办"},children:[{path:"done_detail",component:o.default}]},{path:"/welcome",component:c.default},{path:"/",redirect:"/welcome"}]})},Yq8K:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("nHSH"),n=r(a("qXfr")),l=r(a("FmGn")),s=r(a("0LVZ"));function r(e){return e&&e.__esModule?e:{default:e}}t.default={data:function(){return{infoList:[],detailInfo:{},showDialog:!1,dialogInfo:"确定同意该请求吗？",show:!1}},components:{Group:n.default,Cell:l.default,Datetime:s.default},methods:{agree:function(){this.showDialog=!0,this.dialogInfo="确定同意该请求吗？"},reject:function(){this.dialogInfo="确定拒绝该请求吗?",this.showDialog=!0},close:function(){this.showDialog=!1},change:function(){}},created:function(){var e=this,t=localStorage.getItem("token"),a=this.$route.query.data,n=(new Date).getTime();console.log(t),(0,i.getListTask)(a,t).then(function(t){e.infoList=t}),(0,i.getDetailInfo)(n,t,a).then(function(t){t.length>=1&&(e.detailInfo=JSON.parse(t[0].json_data));var a=JSON.parse(t[0].json_data);console.log(a),console.log(e.detailInfo.transCode.indexOf("CSBUG"))})},mounted:function(){this.mescroll=new MeScroll("td_detail",{up:{isBounce:!1,use:!1},down:{use:!1}})}}},ZMnM:function(e,t,a){"use strict";var i={render:function(){var e=this.$createElement;return(this._self._c||e)("i",{class:[this.className,this.isMsg?"weui-icon_msg":""]})},staticRenderFns:[]};t.a=i},aM96:function(e,t){},ag88:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("NWFM"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("oexr");var r=function(e){a("rerI")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},e04t:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("nHSH");t.default={data:function(){return{show:!1,listArr:[],list:[]}},methods:{goDetail:function(e){this.$router.push({path:"/to_do/do_detail",query:{data:e}})}},mounted:function(){this.mescroll=new MeScroll("td",{up:{isBounce:!1,use:!1},down:{use:!1}})},created:function(){var e=this,t=localStorage.getItem("token");(0,i.getTask)(t).then(function(t){console.log(t),e.listArr=t.data.tableContent,e.$event.$emit("num",t.data.tableContent.length)})}}},eDdd:function(e,t){},hC2f:function(e,t,a){"use strict";var i={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("transition",{attrs:{"enter-active-class":"slideInRight","leave-active-class":"slideOutRight"}},[a("div",{staticClass:"mescroll",attrs:{id:"td_detail"}},[a("div",{staticClass:"wrapper"},[e.detailInfo.transCode.indexOf("CSBUG")>=0?a("group",{attrs:{"label-width":"4.5em","label-margin-right":"2em","label-align":"left"}},[e.detailInfo.requirement?a("cell",{attrs:{title:"BUG标题",value:e.detailInfo.requirement.requireName,"value-align":"left"}}):e._e(),e._v(" "),a("cell",{attrs:{title:"需求编码",value:e.detailInfo.transCode,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"提交人",value:e.detailInfo.baseinfo.creatorName,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"创建时间",value:e.detailInfo.baseinfo.crtTime,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"所属模块",value:e.detailInfo.requirement.requireNature.value,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"BUG类型",value:e.detailInfo.requirement.requireDemension.value,"value-align":"left"}}),e._v(" "),e.detailInfo.requirement.level.value?a("cell",{attrs:{title:"优先级",value:e.detailInfo.requirement.level.value,"value-align":"left"}}):e._e(),e._v(" "),e.detailInfo.requirement.level.value?e._e():a("cell",{attrs:{title:"优先级",value:e.detailInfo.requirement.level,"value-align":"left"}}),e._v(" "),a("datetime",{attrs:{format:"YYYY-MM-DD HH:mm",title:"预计交付时间",placeholder:"请选择","value-align":"left"},on:{"on-change":e.change}}),e._v(" "),a("cell",{attrs:{title:"用户故事",value:e.detailInfo.requirement.userStory,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"验收标准",value:e.detailInfo.requirement.acceptStandard,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"工作流","is-link":"","border-intent":!1,"arrow-direction":e.show?"up":"down"},nativeOn:{click:function(t){e.show=!e.show}}})],1):e._e(),e._v(" "),e.detailInfo.requirementProject?a("group",{attrs:{"label-width":"4.5em","label-margin-right":"2em","label-align":"left"}},[a("cell",{attrs:{title:"项目名称",value:e.detailInfo.requirementProject.projectName,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"需求名称",value:e.detailInfo.requirementProject.requireName,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"需求编码",value:e.detailInfo.transCode,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"提交人",value:e.detailInfo.baseinfo.creatorName,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"创建时间",value:e.detailInfo.baseinfo.crtTime,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"应用类型",value:e.detailInfo.requirementProject.appType,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"应用名称",value:e.detailInfo.requirementProject.appName,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"实现方式",value:e.detailInfo.requirementProject.provideType,"value-align":"left"}}),e._v(" "),e.detailInfo.requirementProject.level.value?a("cell",{attrs:{title:"优先级",value:e.detailInfo.requirementProject.level.value,"value-align":"left"}}):e._e(),e._v(" "),e.detailInfo.requirementProject.level.value?e._e():a("cell",{attrs:{title:"优先级",value:e.detailInfo.requirementProject.level,"value-align":"left"}}),e._v(" "),e.detailInfo.requirementProject.etc?e._e():a("datetime",{attrs:{format:"YYYY-MM-DD HH:mm",title:"预计交付时间",placeholder:"请选择","value-align":"left"},on:{"on-change":e.change}}),e._v(" "),a("cell",{attrs:{title:"用户故事",value:e.detailInfo.requirementProject.userStory,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"验收标准",value:e.detailInfo.requirementProject.acceptStandard,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"工作流","is-link":"","border-intent":!1,"arrow-direction":e.show?"up":"down"},nativeOn:{click:function(t){e.show=!e.show}}})],1):e._e(),e._v(" "),e.detailInfo.baseinfoExt?a("group",{attrs:{"label-width":"4.5em","label-margin-right":"2em","label-align":"left"}},[a("cell",{attrs:{title:"需求编码",value:e.detailInfo.transCode,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"需求名称",value:e.detailInfo.baseinfo.transType2,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"提交人",value:e.detailInfo.baseinfo.creatorName,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"创建时间",value:e.detailInfo.baseinfo.crtTime,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"发布环境",value:e.detailInfo.baseinfoExt.varchar2,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"代码分支",value:e.detailInfo.baseinfoExt.varchar4,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"前后端",value:e.detailInfo.baseinfoExt.varchar3.value,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"预计发布时间",value:e.detailInfo.baseinfoExt.datetime1,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"预计发布说明",value:e.detailInfo.baseinfoExt.varchar1,"value-align":"left"}}),e._v(" "),a("cell",{attrs:{title:"工作流","is-link":"","border-intent":!1,"arrow-direction":e.show?"up":"down"},nativeOn:{click:function(t){e.show=!e.show}}})],1):e._e(),e._v(" "),e.show?a("div",{staticClass:"process limit"},[a("div",{staticClass:"agree_status"},e._l(e.infoList,function(t,i){return a("div",{key:i,staticClass:"allInfo"},[a("div",{staticClass:"info"},[a("i",{staticClass:"iconfont icon-shenfenzheng"}),e._v(" "),a("p",[a("span",[e._v(e._s(t.userName))]),e._v(" "),a("span",[e._v(e._s(t.nodeName))])]),e._v(" "),a("p",[a("span",[e._v(e._s(t.endTime))])]),e._v(" "),t.message?a("p",[a("span",[e._v("审批意见："+e._s(t.message))])]):e._e(),e._v(" "),t.status?a("i",{staticClass:" weui-icon weui-icon-success"}):e._e(),e._v(" "),t.status?e._e():a("i",{staticClass:" weui-icon weui-icon-waiting",staticStyle:{top:"15px"}})]),e._v(" "),a("div",{staticClass:"iconfont icon-xia arrow"})])}))]):e._e()],1),e._v(" "),a("div",{staticClass:"btn"},[a("span",{on:{click:function(t){e.agree()}}},[e._v("同意")]),e._v(" "),a("span",{on:{click:function(t){e.reject()}}},[e._v("拒绝")])])])])},staticRenderFns:[]};t.a=i},iCzg:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("m1bu"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("29vh");var r=function(e){a("eDdd")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},ib8q:function(e,t){},jJFf:function(e,t,a){"use strict";var i={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticStyle:{height:"100%"}},[a("div",{staticClass:"page mescroll",attrs:{id:"finish"}},[a("div",{staticClass:"wrapper"},[e._m(0),e._v(" "),a("ul",{staticClass:"list",attrs:{id:"finishTask"}},e._l(e.doneList,function(t){return a("li",{on:{click:function(a){e.goDetail(t)}}},[a("p",[a("span",{staticClass:"task_name"},[e._v(e._s(t.requireName))]),e._v(" "),a("i",{staticClass:"date"},[e._v(e._s(t.startTime.substring(0,10)))])]),e._v(" "),a("p",[a("span",{staticClass:"do_user"},[e._v("操作名称："+e._s(t.nodeName))]),e._v(" "),a("em",{staticClass:"status"},[e._v(e._s(t.status))])]),e._v(" "),a("p",[a("span",{staticClass:"do_user"},[e._v("发起人："+e._s(t.crtName))])]),e._v(" "),a("p",[a("em",{staticClass:"code"},[e._v("交易号："+e._s(t.businessKey))])]),e._v(" "),a("p",[a("em",{staticClass:"code"},[e._v("完成时间："+e._s(t.endTime))])])])}))])]),e._v(" "),a("router-view")],1)},staticRenderFns:[function(){var e=this.$createElement,t=this._self._c||e;return t("div",{staticClass:"weui-search-bar",attrs:{id:"searchBar"}},[t("form",{staticClass:"weui-search-bar__form"},[t("div",{staticClass:"weui-search-bar__box"},[t("i",{staticClass:"weui-icon-search"}),this._v(" "),t("input",{staticClass:"weui-search-bar__input",attrs:{type:"search",id:"searchInput",placeholder:"搜索",required:""}}),this._v(" "),t("a",{staticClass:"weui-icon-clear",attrs:{href:"javascript:",id:"searchClear"}})]),this._v(" "),t("label",{staticClass:"weui-search-bar__label",attrs:{id:"searchText"}},[t("i",{staticClass:"weui-icon-search"}),this._v(" "),t("span",[this._v("搜索")])])]),this._v(" "),t("a",{staticClass:"weui-search-bar__cancel-btn",attrs:{href:"javascript:",id:"searchCancel"}},[this._v("取消")])])}]};t.a=i},jSAH:function(e,t){},lFh0:function(e,t){},m1bu:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("nHSH"),n=o(a("qXfr")),l=o(a("FmGn")),s=o(a("ag88")),r=o(a("zjwm"));function o(e){return e&&e.__esModule?e:{default:e}}t.default={data:function(){return{infoList:[],detailInfo:{},show:!1}},components:{Group:n.default,Cell:l.default,XDialog:s.default,Icon:r.default},created:function(){var e=this;this.detailInfo=this.$route.query.info;var t=localStorage.getItem("token"),a=this.$route.query.info.businessKey,n=(new Date).getTime();console.log(t),(0,i.getListTask)(this.detailInfo.businessKey,t).then(function(t){e.infoList=t}),(0,i.getDetailInfo)(n,t,a).then(function(t){t.length>=1&&(e.detailInfo=JSON.parse(t[0].json_data));var a=JSON.parse(t[0].json_data);console.log(a)})},mounted:function(){this.mescroll=new MeScroll("taskDetail",{up:{isBounce:!1,use:!1},down:{use:!1}})}}},nHSH:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=l(a("rVsN"));t.getLogin=function(e){return new i.default(function(t,a){n.default.get("/H_roleplay-si/wxLogin?code="+e+"&state=1").then(function(e){var a=e.data;t(a)})})},t.getTask=function(e){return new i.default(function(t,a){n.default.get("/H_roleplay-si/ds/getMyToDoTask",{headers:{authorization:e}}).then(function(e){console.log(e);var a=e;t(a)}).catch(function(e){t(e)})})},t.getDoneTask=function(e){return new i.default(function(t,a){n.default.get("/H_roleplay-si/ds/getMyDoneTask",{headers:{authorization:e}}).then(function(e){var a=e.data;t(a)})})},t.getListTask=function(e,t){return new i.default(function(a,i){n.default.get("/H_roleplay-si/ds/listTaskLogByTransCode",{headers:{authorization:t},params:{transCode:e}}).then(function(e){var t=e.data.tableContent;a(t)})})},t.getDetailInfo=function(e,t,a){return new i.default(function(i,l){n.default.get("/H_roleplay-si/ds/getJsonDataByReferenceId",{headers:{authorization:t},params:{_dc:e,referenceId:a}}).then(function(e){var t=e.data.tableContent;i(t)})})};var n=l(a("2sCs"));function l(e){return e&&e.__esModule?e:{default:e}}},nbp3:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0}),t.default={name:"icon",props:{type:String,isMsg:Boolean},computed:{className:function(){return"weui-icon weui_icon_"+this.type+" weui-icon-"+this.type.replace(/_/g,"-")}}}},oZKD:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=o(a("AoWc")),n=a("Wu8j"),l=o(a("ZZ/0")),s=o(a("cHyu")),r=o(a("TDgq"));function o(e){return e&&e.__esModule?e:{default:e}}t.default={name:"cell",components:{InlineDesc:i.default},props:(0,l.default)(),created:function(){0},beforeMount:function(){this.hasTitleSlot=!!this.$slots.title,this.$slots.value},computed:{labelStyles:function(){return(0,s.default)({width:(0,r.default)(this,"labelWidth"),textAlign:(0,r.default)(this,"labelAlign"),marginRight:(0,r.default)(this,"labelMarginRight")})},valueClass:function(){return{"vux-cell-primary":"content"===this.primary||"left"===this.valueAlign,"vux-cell-align-left":"left"===this.valueAlign,"vux-cell-arrow-transition":!!this.arrowDirection,"vux-cell-arrow-up":"up"===this.arrowDirection,"vux-cell-arrow-down":"down"===this.arrowDirection}},labelClass:function(){return{"vux-cell-justify":"justify"===(0,r.default)(this,"justify")}},style:function(){if(this.alignItems)return{alignItems:this.alignItems}}},methods:{onClick:function(){!this.disabled&&(0,n.go)(this.link,this.$router)}},data:function(){return{hasTitleSlot:!0,hasMounted:!1}}}},oexr:function(e,t,a){"use strict";var i={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"vux-x-dialog",class:{"vux-x-dialog-absolute":"VIEW_BOX"===e.layout}},[a("transition",{attrs:{name:e.maskTransition}},[a("div",{directives:[{name:"show",rawName:"v-show",value:e.show,expression:"show"}],staticClass:"weui-mask",style:e.maskStyle,on:{click:e.hide}})]),e._v(" "),a("transition",{attrs:{name:e.dialogTransition}},[a("div",{directives:[{name:"show",rawName:"v-show",value:e.show,expression:"show"}],class:e.dialogClass,style:e.dialogStyle},[e._t("default")],2)])],1)},staticRenderFns:[]};t.a=i},qXfr:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("KkqI"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("O/gm");var r=function(e){a("ib8q")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports},qplK:function(e,t){},rerI:function(e,t){},sAbS:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("nHSH");t.default={data:function(){return{}},created:function(){var e=localStorage.getItem("token"),t=this;setTimeout(function(){(0,i.getTask)(e).then(function(e){if(200==e.status)console.log(e.data),t.$router.replace("/to_do");else{console.log("进入了");var a=location.href;if(a.indexOf("code")>0){var n=a.split("?")[1].split("&")[0].split("=")[1];(0,i.getLogin)(n).then(function(e){localStorage.setItem("token",e.token),t.$router.replace("/to_do")})}else{window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=ww3c1aa17c16e380b7&redirect_uri=https%3a%2f%2frfd.roletask.com%2fRose%2f%23%2fto_do&response_type=code&scope=snsapi_base&agentid=1000017&state=1#wechat_redirect"}}})},0)}}},sVYj:function(e,t,a){"use strict";var i={render:function(){var e=this.$createElement;return(this._self._c||e)("span",{staticClass:"vux-label-desc"},[this._t("default")],2)},staticRenderFns:[]};t.a=i},sXkm:function(e,t,a){"use strict";var i={render:function(){var e=this.$createElement;return(this._self._c||e)("router-view")},staticRenderFns:[]};t.a=i},vHCn:function(e,t,a){"use strict";var i={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{staticClass:"weui-cell",class:{"vux-tap-active":e.isLink||!!e.link,"weui-cell_access":e.isLink||!!e.link,"vux-cell-no-border-intent":!e.borderIntent,"vux-cell-disabled":e.disabled},style:e.style,on:{click:e.onClick}},[a("div",{staticClass:"weui-cell__hd"},[e._t("icon")],2),e._v(" "),a("div",{staticClass:"vux-cell-bd",class:{"vux-cell-primary":"title"===e.primary&&"left"!==e.valueAlign}},[a("p",[e.title||e.hasTitleSlot?a("label",{staticClass:"vux-label",class:e.labelClass,style:e.labelStyles},[e._t("title",[e._v(e._s(e.title))])],2):e._e(),e._v(" "),e._t("after-title")],2),e._v(" "),a("inline-desc",[e._t("inline-desc",[e._v(e._s(e.inlineDesc))])],2)],1),e._v(" "),a("div",{staticClass:"weui-cell__ft",class:e.valueClass},[e._t("value"),e._v(" "),e._t("default",[e._v(e._s(e.value))]),e._v(" "),e.isLoading?a("i",{staticClass:"weui-loading"}):e._e()],2),e._v(" "),e._t("child")],2)},staticRenderFns:[]};t.a=i},zgKB:function(e,t,a){"use strict";var i={render:function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("div",{attrs:{id:"app"}},[a("keep-alive",[a("router-view",{directives:[{name:"wechat-title",rawName:"v-wechat-title",value:e.$route.meta.title,expression:"$route.meta.title"}]})],1),e._v(" "),a("nav",{staticClass:"navbar"},e._l(e.tablist,function(t,i){return a("router-link",{key:i,attrs:{to:t.path}},[a("span",{staticClass:"iconfont",class:t.icon}),e._v(" "),a("p",[e._v(e._s(t.title))]),e._v(" "),a("span",{staticClass:"weui-badge",staticStyle:{position:"absolute",top:"0",right:"40%"}},[e._v(e._s(e.num))])])}))],1)},staticRenderFns:[]};t.a=i},zjwm:function(e,t,a){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var i=a("nbp3"),n=a.n(i);for(var l in i)"default"!==l&&function(e){a.d(t,e,function(){return i[e]})}(l);var s=a("ZMnM");var r=function(e){a("IN7x")},o=a("X4nt")(n.a,s.a,!1,r,null,null);t.default=o.exports}},["NHnr"]);
//# sourceMappingURL=app.3ae631ee552f504bc9b7.js.map