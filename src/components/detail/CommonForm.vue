<template>
  <!--通用form组件-->
  <div class="detail_wrapper" :class="{pages:scrollCt}" v-show="showTab">
    <div class="form" :class="{scrollCt:scrollCt,'has-bbar':hasBbar}" ref="fill">
      <div class="fill_wrapper">
        <!-- 工作流组件 -->
        <w-flow :formData="formData" :full-work-flow="workflowLogs" v-if="transCode && loaded"/>
        <!-- 表单渲染 -->
        <r-fieldset-ct
          :cfg="fieldSets"
          :values="formData"
          v-show="loaded"
          ref="fieldsetCt"
        />
        <!-- 附件组件 -->
        <!-- <fileupload :cfg="fieldSets" :values="attachment" :biReferenceId="biReferenceId" @on-upload='onUpload' v-if="loaded"/> -->
        <!-- 审批组件 -->
        <r2-action
          v-if="showAction"
          :workFlowLogs="workflowLogs"
          :formStatus="formStatus"
        />
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" v-if="hasBbar" v-show="showKeyboard == false">
      <span class="count_num" v-if="false">
        <!-- <span style="fontSize:.14rem">￥</span>{{totalAmount | numberComma(3)}} -->
      </span>
      <!--span
        class="count_btn stop"
        @click="stopOrder"
        v-if="taskInfo.isMyTask === 1 && taskInfo.actions.indexOf('stop')>=0"
      >终止</span-->
      <span class="count_btn" @click="submit">提交</span>
    </div>
  </div>
</template>
<script>
// 请求 引入
import platfrom from "@/plugins/platform/index";
import submitMethod from "mixins/formSubmit";
import secondConfig from 'mixins/secondConfig';
import {findConfigInfo} from 'service/commonService'
// 插件 引入
import Bscroll from "better-scroll";
/* 引入微信相关 */
import {register} from 'plugins/wx'
import { corpid, secret, agentid, redirect_uri,redirect_uri_share } from '@/plugins/ajax/conf'
import {shareContent } from 'plugins/wx/api'
import {
  isMyflow,
  getListId,
  getSOList,
  listTaskLogByTransCode,
  getWorkFlowByListId,
  getFromStatus,
  getAppExampleDetails
} from "service/detailService";
import {
  WebContext,
  initWebContext,
  getFormViews,
  loadModelCfg,
  getFormViewByUniqueId
} from "service/commonService";

export default {
  props: {
    showTab: {
      type: Boolean,
      default: true,
    },
  },
  mixins: [submitMethod, secondConfig],
  data() {
    return {
      transCode: null,
      listId: null,
      viewId: null,
      model: null,
      loaded:false,
      fieldSets: [],
      showKeyboard:false,
      formData: {},
      //经过处理的经办人信息
      transactor: {},
      biReferenceId: null,
      //经过处理的基本信息
      baseinfo: {},
      attachment: [],
      taskInfo: {},
      showAction: false,
      scrollCt:false,
      workflows: [],
      workflowLogs:[],
      baseinfoConfig: {},
      formStatus: []//表单状态,是否草稿
    };
  },
  computed:{
    hasBbar:function(){
       return this.model!='view' && this.model!='flowNode'
    }
  },
  methods: {
    // 获取查看视图的listId
    getViewIdByTransCode(transCode) {
      return new Promise((resolve, reject) => {
        getListId(transCode).then(data => {
          if (data.length) {
            this.viewId = data[0].uniqueId;
            this.listId = data[0].listId;
            this.model = "view"; //查看视图
            resolve();
          } else {
            this.$vux.alert.show({
              content: "抱歉，交易号有误，没有数据可以查看"
            });
          }
        });
      });
    },
    //获取新建视图
    async getNewViewIdByListId() {
      await getFormViews(this.listId).then(data => {
        for (let item of data) {
          if (item.viewType === "submit") {
            this.viewId = item.uniqueId;
            this.model = "new";
            break;
          }
        }
      });
    },
    //工作流日志信息
    getWorkFlowLogs() {
      listTaskLogByTransCode({
        _dc: Date.now(),
        transCode: this.transCode
      }).then(data => {
        this.workflowLogs = data.tableContent || [];
      });
    },
    getWorkFlowByListId(){
      getWorkFlowByListId(this.listId).then(data => {
        this.workflows = data || [];
      })
    },
    handlerFormData(formData) {
      var key,
        key1,
        item,
        list,
        singleFieldCts = this.singleFieldCts;

      for (key in formData) {
        item = formData[key];
        if (item && "object" == typeof item) {
          if ("dataSet" in item) {
            list = item.dataSet;
            delete item.dataSet;
          } else {
            list = [];
          }
          for (key1 in item) {
            formData[key1] = item[key1];
            delete item[key1];
          }

          if (singleFieldCts.indexOf(key) != -1) {
            item = list[0];
            for (key1 in item) {
              formData[key1] = item[key1];
              delete item[key1];
            }
            delete formData[key];
          } else {
            formData[key] = list;
          }
        }
      }
      // for(item in formData){
      //   this.$set(this.formData,item,formData[item]);
      // }
      // this.$nextTick(function(){
      //   this.formData= formData;
      // });
      this.formData = formData;
      //预估以下mapping在未来业务上是确定的所以可以通过以下代码进行固化
      //mapping 基本信息
      this.baseinfo = {
        createBy: formData.creatorName,
        createAt: formData.crtTime,
        modifyBy: formData.modiferName,
        modifyAt: formData.modTime,
        status: formData.biStatus,
        effectiveTime: formData.effectiveTime
      };
      //mapping 经办人信息
      this.transactor = {
        name: formData.handlerName,
        position: formData.handlerRoleName,
        unit: formData.handlerUnitName,
        entity: formData.handlerEntityName
      };
    },
    initScroll() {
      var originHeight = document.documentElement.clientHeight;
        
      if (this.scrollCt){
        this.$nextTick(() => {
          this.fillBscroll = new Bscroll(this.$refs.fill, {
            click: true
          });
        });
      } else {
        // 触发父组件的scroll刷新
        this.$emit("refresh-scroll",this.model);
      }
      
      //解决android键盘收起input没有失去焦点，底部按钮遮挡输入框
      if (platfrom.isAndroid) {
        window.onresize = () => {
          var activeElement = document.activeElement,
              showKeyboard = originHeight > document.documentElement.clientHeight;
 
          this.showKeyboard = showKeyboard;
          this.$emit('keyboardToggle',showKeyboard);
          if (showKeyboard == false) {
            //底部按钮隐藏
            if (~["INPUT", "TEXTAREA"].indexOf(activeElement.tagName)) {
               activeElement.blur();
            }
          }
        };
      }
    },
    async loadPage() {
      let { model, debug,transCode} = this.$route.query,
          { listId, viewId} = this.$route.params;
      
      viewId = viewId == '0' ? null : viewId;
      listId =  ~['undefined','0'].indexOf(listId) ? null :listId;

      this.$loading.show();
      /**获取视图信息**/
      if (transCode) {
        if (listId) {
          this.listId = listId;
        }
        this.transCode = transCode;
        if (viewId) {
          //编辑或修改会指定视图
          this.viewId = viewId;
          this.model = model || "edit";
        } else {
          //查看或审批
          await this.loadWorkFlowNodeInfo(); //获取流程节点信息，如果当前用户是流程节点审批人，则加载审批视图。

          if (this.viewId == null) {
            //如果没有审批视图，则加载查看视图
            //加载查看视图
            await this.getViewIdByTransCode(transCode);
          }
          await this.getFromStatus();
        }
        await this.getWorkFlowLogs(); //工作流日志
        
      } else if (listId) {
        //没有transCode,获取新建视图。
        this.listId = listId;
        await this.getNewViewIdByListId();
      }
      //加载工作流信息
      await this.getWorkFlowByListId();
      //加载视图信息
      if (this.viewId) {
        await this.getBasicInfo();
        await this.loadFormCfg();
        if (this.model != "new") this.showAction = true;
        if (this.model != "view") {
          //加载数据模型
          this.loadModelCfg(this.listId);
        }
        if (transCode) {
          await this.loadFormData(transCode);
        }
        this.$loading.hide();
        this.loaded = true;
        this.initScroll();
      } else {
        this.$vux.alert.show({
          content: "抱歉，无法支持该应用的查看",
          onHide: () => {
            this.$router.go(-1);
          }
        });
      }
    },
    loadFormData(transCode) {
      var params = {
            formViewUniqueId: this.viewId,
            transCode
          },
          config = this.viewInfo.config,
          api = config.isBaseObject ? config.baseObjectKey : "formAPI";

      return getSOList(params, api).then(
        ({ formData = {}, attachment = [], biReferenceId }) => {
          this.handlerFormData(formData);
          this.attachment = attachment;
          this.biReferenceId = formData.biReferenceId;
        }
      );
    },
    loadWorkFlowNodeInfo() {
      return new Promise((resolve, reject) => {
        isMyflow({ transCode: this.transCode }).then(rs => {
          var l = rs.dataCount,
              task = l && rs.tableContent[0];

          if (task &&
            task.ASSIGNEE_ === WebContext.currentUser.userId.toString() ||
            task.isMyTask || //当前节点是我的任务
            (task.allowRecall &&
              task.actions &&
              task.actions.indexOf("recall") > -1)
          ) {
            //当前节点允许撤回
            this.taskInfo = task;
            this.viewId = this.taskInfo.viewId;
            this.model = 'flowNode';
          }
          resolve();
        });
      });
    },
    loadFormCfg() {
      return getFormViewByUniqueId(this.viewId).then(data => {
        let { appName, config, dataSource, listInfo, formKey } = data;

        window.document.title = appName;
        listInfo.uniqueId = this.listId;
        WebContext.listInfo = listInfo;
        
        try {
          config = JSON.parse(config);
        } catch (e) {
          config = null;
        }
        if(this.baseinfoConfig.clientFlag){
          findConfigInfo(this.viewId).then(res => {
            if (dataSource) {
              try {
                dataSource = JSON.parse(dataSource);
                data.dataSource = dataSource;
              } catch (e) {
                dataSource = null;
              }
            }

            if (config) {
              //适配表单级数据源，PC目前应用于r2AccountGrid表格
              dataSource && this.setAccountDataSource(config, dataSource);

              let fieldSets = config.items,
                  singleFieldCts = [],
                  reconfig = config.reconfig||{};

              fieldSets.forEach(item => {
                if (item.formViewPartId) {
                  let reconfigData = reconfig[`_${item.formViewPartId}`];

                  if (reconfigData) {
                    item.items =
                      item.items &&
                      item.items.map(cItem => {
                        let matched = reconfigData[cItem.fieldCode] || {};
                        return { ...cItem, ...matched };
                      });
                    if (reconfigData._prop) {
                      item = { ...item, ...reconfigData._prop };
                    }
                  }
                }
                if (item.isMultiple == false && item.name) {
                  singleFieldCts.push(item.name);
                }
              });
              this.singleFieldCts = singleFieldCts;
              this.initComputed(JSON.parse(data.config).formComputed);
              console.log("this.config", data);
              this.getNewFormConfig(config,res.data);
              this.viewInfo = config;
              this.fieldSets = fieldSets;
              // for(var i = 0;i<fieldSets.length;i++){
              //   this.$set(this.fieldSets,i,fieldSets[i]);
              // }
              // this.$nextTick(function(){
              //   this.fieldSets= fieldSets;
              // });
            }
          });
        }
        this.viewInfo = data;
        this.formKey = formKey;
      });
    },
    setAccountDataSource: function(config, dataSource) {
      var dsMap = {};
      dataSource.forEach(function(item) {
        dsMap[item.dataSet] = item.dataSource.source;
      });
      config.items.map(function(fieldSet) {
        var grid;
        if (fieldSet.isMultiple && fieldSet.xtype == "r2FieldSet") {
          grid = fieldSet.items[0];
          if (grid && grid.xtype == "r2AccountGrid" && dsMap[fieldSet.name]) {
            grid.dataSource = initHFields(JSON.parse(dsMap[fieldSet.name]));
            grid.columns = initCols(grid);
          }
        }
      });
      function initCols(item) {
        var columns = item.columns,
            dataIndxMap = item.dataIndexMap,
            arr = [],
            hFields = item.dataSource.hFields,
            cols = item.dataSource.cols;

        for(var i=0;i<columns.length;i++) {
          var flag =false;
          for(var j=0;j<cols.length;j++) {
            var field = dataIndxMap[columns[i].fieldCode];
            //if((!field) || cols[j].k == field && !cols[j].h) {
            if((!field) || cols[j].k == field) {
              flag = true;
              break;
            }
          }
          if(flag) {
            arr.push(columns[i]);
          }
        }
        return arr;
      }
      function initHFields(item) {
        var data = item,
            arr = '',
            harr = [];

        for(var i=0;i<data.cols.length;i++) {
          if(data.cols[i].h) {
            harr.push(data.cols[i].k);
          }
        }
        data.hFields = harr.join(",");
        return data;
      }
    },
    loadModelCfg(listId) {
      var me = this;
      loadModelCfg(listId).then(rs => {
        var row,
          apiCfgStr,
          apiCfg = null;
        if (rs.dataCount) {
          row = rs.tableContent[0];
          apiCfgStr = row && row.MODEL_CONFIG;
          if (apiCfgStr)
            try {
              apiCfg = JSON.parse(apiCfgStr);
            } catch (e) {
              apiCfg = null;
            }
          me.apiCfg = apiCfg;
        }
      });
    },
    //是否我的工作流信息
    isMyflow() {
      return isMyflow({
        _dc: Date.now(),
        transCode: this.transCode
      });
    },
    isValid() {
      var invalid = false,
        fieldMap = this.fieldMap,
        fieldCode,
        field;

      for (fieldCode in fieldMap) {
        field = fieldMap[fieldCode];
        if (!field.isValid()) {
          invalid = true;
          break;
        }
      }
      return !invalid;
    },
    initNumberVerSel() {
      var invalid = true,
        fieldMap = this.fieldMap,
        fieldCode,
        field;

      for (fieldCode in fieldMap) {
        field = fieldMap[fieldCode];
        if (!field.initNumberVerSel()) {
          invalid = false;
          break;
        }
      }
      return invalid;  
    },
    stopOrder() {},
    getFromStatus() {
      var data = {
        _dc: Date.now(),
        transCode: this.transCode
      };
      return getFromStatus(data).then(({ tableContent = [] }) => {
        this.formStatus = tableContent;
      });
    },
    init(){
         var isScrollCt = this.$parent.$options.name != 'v-touch';//fillform
         /* 引入微信相关 */
         register();
         this.scrollCt = isScrollCt;
         this.fieldMap = {}; //id;
         this.fields = {}; //fieldCode
         this.wfParamFieldMap = {};
         this.initItemsEvents = true;
         this.loadPage();
    },
    reload(){
      this.loaded = this.showAction =  false;
      this.transCode = this.listId = this.viewId = this.model = null;
      this.formData = {};
      this.init();
    },
    onUpload(data) {
      this.biReferenceId = data.biReferenceId;
    },
    delParam(fullPath) {
      var url = fullPath;    //页面url
      var urlParam = fullPath.substr(1);   //页面参数
      var beforeUrl = url.substr(0, url.indexOf("?"));   //页面主地址（参数之前地址）
      var nextUrl = "";

      var arr = new Array();
      if (urlParam != "") {
        var urlParamArr = urlParam.split("&"); //将参数按照&符分成数组
        for (var i = 0; i < urlParamArr.length; i++) {
          var paramArr = urlParamArr[i].split("="); //将参数键，值拆开
          //如果键雨要删除的不一致，则加入到参数中
          if (('code,state,tag').indexOf(paramArr[0]) == -1) {
              arr.push(urlParamArr[i]);
          }
        }
      }
      if (arr.length > 0) {
        nextUrl = "?" + arr.join("&");
      }
      url = beforeUrl + nextUrl;
      return url;
    }
  },
  created() {
    this.init();
    let { query,meta,path,fullPath} = this.$route;
    wx.ready(() => {
        let { query,meta,path,fullPath} = this.$route;
        // 分享
        let shareInfo = {
          title: query.name,
          desc: meta.title,
          imgUrl: '',
          link: redirect_uri_share+'/Hermes'+this.delParam(fullPath)+'&tag=share',
        }
        shareContent(shareInfo);
      })
    if(query.tag&&query.tag=='share'){
      window.sessionStorage.removeItem('shareUrl');
    }
    this.$on('on-upload',this.onUpload);
  }
};
</script>
<style lang="scss">
.fieldSets {
  background: #f8f8f8;
}
.scrollCt {
  z-index: 1;
  overflow: hidden;
  position: relative;
  background: #f8f8f8;
  height: 100%;
  -webkit-overflow-scrolling: touch;
  &.has-bbar{
     height: calc(100% - 0.44rem);
  }
  .fill_wrapper {
    overflow: hidden;
  }
}
// 底部栏
.count_mode {
  // left: 0;
  z-index: 99;
  bottom: 0;
  width: 100%;
  display: flex;
  height: 0.44rem;
  position: absolute;
  line-height: 0.44rem;
  background: #fff;
  .count_num {
    flex: 2.5;
    color: #5077aa;
    font-size: 0.24rem;
    padding-left: 0.1rem;
    position: relative;
    &.nine_up {
      font-size: 0.2rem;
    }
    &.ten_up {
      font-size: 0.16rem;
    }
    &.ele_up {
      font-size: 0.12rem;
      .taxAmount {
        font-size: 0.1rem;
      }
    }
    .total_price {
      display: inline-block;
      .symbol {
        font-size: 0.14rem;
      }
    }
    .taxAmount,
    .total-num {
      color: #757575;
      font-size: 0.1rem;
      display: inline-block;
    }
  }
  //全选
  .all_checked {
    font-size: 0.16rem;
    position: relative;
    padding-left: 0.35rem;
    box-sizing: border-box;
    .vux-x-icon {
      left: 0.1rem;
      top: 50%;
      position: absolute;
      transform: translateY(-50%);
      fill: #999;
    }
    .checked {
      fill: #ea5455;
    }
  }
  .count_btn {
    flex: 1.5;
    color: #fff;
    text-align: center;
    background: #3296fa;
    &.stop {
      color: #a1a1a1;
      background: #dfdfdf;
    }
  }
  .delete_btn {
    @extend .count_btn;
    background: #ea5455;
  }
}
/* 没有金额的提交和终止按钮 */
.btn-no-amt {
  z-index: 99;
  bottom: 0;
  width: 100%;
  display: flex;
  height: 0.44rem;
  position: absolute;
  line-height: 0.44rem;
  background: #fff;
  display: flex;
  .btn-item {
    flex: 1;
    background: #3296fa;
    color: #fff;
    text-align: center;
    &.stop {
      color: #a1a1a1;
      background: #dfdfdf;
    }
  }
}
.vux-1px-t:before {
  border-top: 1px solid #e8e8e8;
}
</style>