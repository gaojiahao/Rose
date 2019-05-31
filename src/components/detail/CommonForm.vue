<template>
  <!--通用form组件-->
  <div class="detail_wrapper">
    <div class="basicPart">
      <!-- <baseinfo-view :values="baseinfo"></baseinfo-view> -->
      <!-- 经办信息 （订单、主体等）TransactorView -->
      <!-- <transactor-view :values="transactor"></transactor-view> -->
      <r-fieldset-ct
        :cfg="fieldSets"
        :values="formData"
        v-if="fieldSets.length"
      />
      <!-- 工作流 -->
      <w-flow
          :work-flow-info="workFlowInfo"
          :full-work-flow="fullWL"
          :userName="userName"
          :is-my-task="isMyTask"
          :no-status="formData.biStatus"
      ></w-flow>
      <!-- 备注 -->
      <!-- <other-part :other-info="formData" :attachment="attachment"></other-part> -->
    </div>
  </div>
</template>
<script>
import OtherPart from 'components/detail/commonPart/OtherPart'
import { numberComma } from 'vux'
// 请求 引入
import {
  isMyflow,
  getListId,
  getListById,
  getSOList,
  getWorkFlow,
  currentUser,
  getFromStatus,
  getAppExampleDetails
} from "service/detailService";
import {
  getFormViews,
  getFormViewByUniqueId,
  saveAndCommitTask,
  getBasicInfo
} from "service/common/commonService";
export default {
  components: {
    OtherPart
  },
  data() {
    return {
      transCode: "",
      listId: "",
      formViewUniqueId: "",
      fieldSets: [],
      formData: {},
      //经过处理的经办人信息
      transactor: {},
      config:{},
      //经过处理的基本信息
      baseinfo: {},
      attachment:[],
      workFlowInfo: {},
      fullWL: [],
      userName: '',
      isMyTask: false,
    };
  },
  methods: {
    // 获取listid
    getListId(transCode) {
      return new Promise((resolve, reject) => {
        getListId(transCode).then(data => {
          if (data.length) {
            this.formViewUniqueId = data[0].uniqueId;
            this.listId = data[0].listId;
            resolve();
          } else {
            this.$vux.alert.show({
              content: "抱歉，交易号有误，没有数据可以查看"
            });
          }
        });
      });
    },
    handlerFormData(formData) {
      var key, key1, item, list;

      for (key in formData) {
        item = formData[key];
        if (item && "object" === typeof item && "dataSet" in item) {
          list = item.dataSet;
          delete item.dataSet;
          for (key1 in item) {
            formData[key1] = item[key1];
            delete item[key1];
          }
          formData[key] = list;
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
        effectiveTime:formData.effectiveTime
      };
      //mapping 经办人信息
      this.transactor = {
        name: formData.handlerName,
        position: formData.handlerRoleName,
        unit: formData.handlerUnitName,
        entity: formData.handlerEntityName
      };
    },
    async loadPage() {
      let { transCode } = this.$route.query;
      if (!transCode) {
        this.$vux.alert.show({
          content: "抱歉，交易号有误，请尝试刷新之后再次进入"
        });
        return;
      }
      this.transCode = transCode;
      await this.getListId(transCode);
      await this.loadFormCfg();
      await this.loadFormData(transCode);
      await this.getFlowAndActions();
      await this.getBasicInfo();
      await this.workFlowInfoHandler();
      // 触发父组件的scroll刷新
      this.$emit('refresh-scroll');
    },
    loadFormData(transCode) {
      return getSOList({
        formViewUniqueId: this.formViewUniqueId,
        transCode
      }).then(({ formData = {}, attachment = [] }) => {
        this.handlerFormData(formData);
      });
    },
    loadFormCfg() {
      return getFormViewByUniqueId(this.formViewUniqueId).then(data => {
        let { appName,config, dataSource} = data;
        try{
          config = JSON.parse(config);
          data.config = config;
        }catch(e){
          config = null;
        }
        if(config){
          let fieldSets = config.items,
              reconfig = config.reconfig;

          if (reconfig) fieldSets.forEach(item => {
            if (item.formViewPartId) {
              let reconfigData = reconfig[`_${item.formViewPartId}`];

              if(reconfigData){
                item.items =
                  item.items &&
                  item.items.map(cItem => {
                    let matched = reconfigData[cItem.fieldCode] || {};
                    return { ...cItem, ...matched };
                });
                if(reconfigData._prop){
                  item = {...item,...reconfigData._prop}
                }
              }
            }
          });
          this.config = data;
          console.log('this.config',this.config)
          this.fieldSets = fieldSets;
      } 
      });
    },
    isMyflow() {
      return isMyflow({
        _dc: Date.now(),
        transCode: this.transCode
      });
    },
    getWorkFlow() {
      return getWorkFlow({
        _dc: Date.now(),
        transCode: this.transCode
      })
    },
    // 处理简易版工作流数据
    workFlowInfoHandler() {
        this.workFlowInfo = {
            biStatus: this.formData.biStatus,
            transCode: this.formData.transCode,
        };
        switch (this.formData.biStatus) {
            case '进行中':
                let newkey = 'dyClass',
                cokey = 'coClass';
                this.workFlowInfo[newkey] = 'doing_work';
                this.workFlowInfo[cokey] = 'doing_code';
                break;
            case '草稿':
                newkey = 'dyClass';
                this.workFlowInfo[newkey] = 'invalid_work';
                break;
            case '已失效':
                newkey = 'dyClass';
                this.workFlowInfo[newkey] = 'invalid_work';
                break;
        }
    },
    getBasicInfo() {
      return getBasicInfo().then(data => {
        let {currentUser} = data;
        // this.baseinfoConfig = data;
        // this.userId = `${currentUser.userId}`;
        this.userName = `${currentUser.nickname}-${currentUser.userCode}`;
      });  
    },
    getFlowAndActions() {
        return Promise.all([this.isMyflow(), this.getWorkFlow()]).then(([data = {}, data2 = {}]) => {
            this.myFlow = data.tableContent || [];
            this.workFlow = data2.tableContent || [];
            let [flow = {}] = this.myFlow;
            let {isMyTask = 0, actions = '', taskId, viewId} = flow;
            // 赋值 完整版工作流
            this.fullWL = this.workFlow;
        });
    }
  },
  created() {
    this.loadPage();
  }
};
</script>