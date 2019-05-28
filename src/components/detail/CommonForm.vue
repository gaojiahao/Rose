<template>
  <!--通用form组件-->
  <div class="detail_wrapper">
    <div class="basicPart">
      <baseinfo-view :values="baseinfo"></baseinfo-view>
      <!-- 经办信息 （订单、主体等）TransactorView -->
      <transactor-view :values="transactor"></transactor-view>
      <!-- 工作流 -->
      <!-- <work-flow
          :work-flow-info="workFlowInfo"
          :full-work-flow="fullWL"
          :userName="userName"
          :is-my-task="isMyTask"
          :no-status="orderInfo.biStatus"
      ></work-flow>-->
      <div v-for="(fieldSet,index) in fieldSets" :key="index">
        <r-fieldset
          :cfg="fieldSet"
          v-if="fieldSet.hiddenInRun == false && 'r2FieldSet' == fieldSet.xtype && fieldSet.isMultiple == false"
          :values="formData"
        />
        <r-fieldset
          :cfg="{items:[fieldSet]}"
          :values="formData"
          v-if="fieldSet.xtype.indexOf('Grid') != -1 || fieldSet.isMultiple == true"
        />
        <matter-list-view :cfg="{items:[fieldSet]}" :values="formData" :name="fieldSet.name" 
            v-if="('r2FieldSet' == fieldSet.xtype && fieldSet.isMultiple == true) || 
            (fieldSet.xtype.indexOf('Grid') != -1 && fieldSet.isMultiple == true)" 
        />
      </div>
    </div>
  </div>
</template>
<script>
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
  getFormConfig,
  saveAndCommitTask,
  getNewFormConfig
} from "service/common/commonService";
export default {
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
      return getNewFormConfig(this.formViewUniqueId).then(data => {
        let obj = JSON.parse(data.config);
        let config = obj.items;
        let reconfig = obj.reconfig;
        config.forEach(item => {
          if (item.formViewPartId) {
            let reconfigData = reconfig[`_${item.formViewPartId}`] || {};
            item.items =
              item.items &&
              item.items.map(cItem => {
                let matched = reconfigData[cItem.fieldCode] || {};
                return { ...cItem, ...matched };
              });
          }
        });
        console.log('config',config);
        this.config = {
            config: config,
            dataSource: data.dataSource,
            reconfig: reconfig,
        }
        this.fieldSets = config;
      });
    },
  },
  created() {
    this.loadPage();
  }
};
</script>