<template>
  <!--通用form组件-->
  <div class="detail_wrapper" :class="{pages:model != 'view'}">
    <div class="form" :class="{scrollCt:model != 'view'}" ref="fill">
      <div class='fill_wrapper'>
        <!-- 工作流组件 -->
        <w-flow :formData="formData" :full-work-flow="workflows"  v-if = "transCode"/>
        <!-- 表单渲染 -->
        <r-fieldset-ct :cfg="fieldSets" :values="formData" v-if="fieldSets.length" ref="fieldsetCt"/>
        <!-- 附件组件 -->
        <fileupload :cfg="fieldSets" :values="attachment" :biReferenceId="biReferenceId" />
        <!-- 审批组件 -->
        <r2-action v-if="showAction" :myFlow="taskInfo" :workFlow="workflows" :formStatus="formStatus"/>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class="count_mode vux-1px-t" v-if="model != 'view'">
      <span class="count_num" v-if="false">
        <!-- <span style="fontSize:.14rem">￥</span>{{totalAmount | numberComma(3)}} -->
      </span>
      <span class="count_btn stop" @click="stopOrder"
            v-if='btnInfo.isMyTask === 1 && btnInfo.actions.indexOf("stop")>=0'>终止</span>
      <span class="count_btn" @click="addFormData">提交</span>
    </div>
  </div>
</template>
<script>
// 请求 引入
import platfrom from '@/plugins/platform/index'
import submitMethod  from 'mixins/formSubmit'
// 插件 引入
import Bscroll from 'better-scroll'
import {
  isMyflow,
  getListId,
  getSOList,
  getWorkFlow,
  getFromStatus,
  getAppExampleDetails
} from "service/detailService";
import {
  WebContext,
  initWebContext,
  getFormViews,
  loadModelCfg,
  getFormViewByUniqueId,
  saveAndCommitTask,
  getBasicInfo
} from "service/commonService";
export default {
  mixins:[submitMethod],
  data() {
    return {
      transCode: null,
      listId: null,
      viewId: null,
      model: null,
      fieldSets: [],
      formData: {},
      //经过处理的经办人信息
      transactor: {},
      biReferenceId: null,
      //经过处理的基本信息
      baseinfo: {},
      attachment:[],
      basicInfo: {},
      myFlow: [],
      taskInfo:null,
      showAction:false,
      userName: '',
      btnInfo:{},
      workflows: [],
      formStatus: [],
    };
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
    async getViewIdByListId() {
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
    //工作流信息
    getWorkFlow() {
      getWorkFlow({
        _dc: Date.now(),
        transCode: this.transCode
      }).then((data) => {
        this.workflows = data.tableContent || [];
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
        if (item && "object" == typeof(item)) {
          if("dataSet" in item){
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
    initScroll(){
      if(this.model == 'view'){
        // 触发父组件的scroll刷新
        this.$emit("refresh-scroll");
        return;
      }
      this.$nextTick(() => {
        this.fillBscroll = new Bscroll(this.$refs.fill, {
          click: true
        })
      })
      //解决android键盘收起input没有失去焦点，底部按钮遮挡输入框
      if (platfrom.isAndroid) {
        window.onresize= () => {
          if (this.clientHeight > document.documentElement.clientHeight) {
            //底部按钮隐藏
              this.btnIsHide  = true;
          }else {
              this.btnIsHide = false;
              if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
                document.activeElement.blur();
              }
          }
        }
      }
    },
    async loadPage() {
      let { transCode, listId, viewId, model} = this.$route.query;
      this.$loading.show();
      /**获取视图信息**/
      if (transCode) {
        if(listId){
          this.listId = listId;
        }
        this.transCode = transCode;
        if (viewId) {//编辑或修改会指定视图
          this.viewId = viewId;
          this.model = model || "edit";
        } else { //查看或审批
          await this.loadWorkFlowNodeInfo();//获取流程节点信息，如果当前用户是流程节点审批人，则加载审批视图。

          if(this.viewId == null){//如果没有审批视图，则加载查看视图
            //加载查看视图
            await this.getViewIdByTransCode(transCode);
          }
          await this.getFromStatus(); 
        }
        await this.getWorkFlow();
      } else if (listId) {
        //没有transCode,获取新建视图。
        this.listId = listId;
        await this.getViewIdByListId();
      }
      //加载视图信息
      if (this.viewId) {
        await this.loadFormCfg();
        if(this.model != 'new')this.showAction = true;
        if(this.model != 'view'){
          this.loadModelCfg(this.listId);
        }
        if (transCode) {
          await this.loadFormData(transCode);
          //await this.workFlowInfoHandler();
        }
        this.$loading.hide();
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
        api = config.isBaseObject
          ? config.baseObjectKey
          : "formAPI";
      return getSOList(params, api).then(
        ({ formData = {}, attachment = [], biReferenceId }) => {
          this.handlerFormData(formData);
          this.attachment = attachment;
          this.biReferenceId = biReferenceId;
        }
      );
    },
    loadWorkFlowNodeInfo(){
       return new Promise((resolve,reject)=>{
           isMyflow({transCode:this.transCode}).then(rs=>{
              var l = rs.dataCount,
                  nodes = rs.tableContent,
                  task;

              while(l--){
                  task = nodes[l];
                  if (task.ASSIGNEE_ === WebContext.currentUser.userId.toString()
                      || task.isMyTask  //当前节点是我的任务
                      || (task.allowRecall && task.actions && task.actions.indexOf('recall') > -1)) { //当前节点允许撤回

                      this.taskInfo = task;
                      this.viewId = this.taskInfo.viewId;
                      break;
                  }
              }
              resolve();
           })
       })
    },
    loadFormCfg() {
      return getFormViewByUniqueId(this.viewId).then(data => {
        let { appName, config, dataSource,listInfo,formKey} = data;

        window.document.title = appName;
        WebContext.listInfo = listInfo;

        try {
          config = JSON.parse(config);
          data.config = config;
        } catch (e) {
          config = null;
        }

        if (config) {
          let fieldSets = config.items,
            singleFieldCts = [],
            reconfig = config.reconfig;

          if (reconfig)
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
          this.viewInfo = data;
          this.formKey = formKey;
          console.log("this.config", data);
          this.fieldSets = fieldSets;
        }
      });
    },
    loadModelCfg(listId){
        var me =this;
        loadModelCfg(listId).then((rs)=>{
            var row,
                apiCfgStr,
                apiCfg = null;
            if (rs.dataCount) {
                row = rs.tableContent[0];
                apiCfgStr = row && row.MODEL_CONFIG;
                if (apiCfgStr) try {
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
    isValid(){
       var invalid = false,
           fieldMap = this.fieldMap,
           fieldCode,field;
       
       for(fieldCode in fieldMap){
           field = fieldMap[fieldCode];
           if(!field.isValid()){
             invalid = true;
             break;
           }
       }
       return !invalid;
    },
    stopOrder(){},
    getFromStatus() {
      var data = {
          _dc: Date.now(),
          transCode: this.transCode
        };
      return getFromStatus(data).then(
        ({ tableContent = []}) => {
          this.formStatus = tableContent;
        }
      );  
    }
  },
  created() {
    this.fieldMap = {};
    this.wfParamFieldMap = {};
    this.loadPage();
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
  background: #F8F8F8;
  height: calc(100% - .44rem);
  -webkit-overflow-scrolling: touch;
  .fill_wrapper{
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
  height: .44rem;
  position: absolute;
  line-height: .44rem;
  background: #fff;
  .count_num {
    flex: 2.5;
    color: #5077aa;
    font-size: .24rem;
    padding-left: .1rem;
    position: relative;
    &.nine_up {
      font-size: .2rem;
    }
    &.ten_up {
      font-size: .16rem;
    }
    &.ele_up {
      font-size: .12rem;
      .taxAmount {
        font-size: .1rem;
      }
    }
    .total_price {
      display: inline-block;
      .symbol {
        font-size: .14rem;
      }
    }
    .taxAmount, .total-num {
      color: #757575;
      font-size: .1rem;
      display: inline-block;
    }
  }
  //全选
  .all_checked{
    font-size:0.16rem;
    position: relative;
    padding-left: 0.35rem;
    box-sizing: border-box;
    .vux-x-icon{
      left:0.1rem;
      top:50%;
      position: absolute;
      transform: translateY(-50%);
      fill: #999;
    }
    .checked{
      fill:#ea5455;
    }

  }
  .count_btn {
    flex: 1.5;
    color: #fff;
    text-align: center;
    background: #3296FA;
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
  height: .44rem;
  position: absolute;
  line-height: .44rem;
  background: #fff;
  display: flex;
  .btn-item{
    flex: 1;
    background: #3296FA;
    color: #fff;
    text-align: center;
    &.stop{
      color: #a1a1a1;
      background: #dfdfdf;
    }
  }
}
.vux-1px-t:before {
  border-top: 1px solid #e8e8e8;
}
</style>