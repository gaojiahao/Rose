<template>
  <!--通用form组件-->
  <div class="detail_wrapper">
    <div class="basicPart">
      <!-- 工作流组件 -->
      <w-flow :formData="formData" @getMyFlow="getMyFlow" @getWorkFlow="getWorkFlow" @getBasicInfo="getBasicInfo" />
      <!-- 表单渲染 -->
      <r-fieldset-ct :cfg="fieldSets" :values="formData" v-if="fieldSets.length"/>
      <!-- 附件组件 -->
      <fileupload :cfg="fieldSets" :values="attachment" :biReferenceId="biReferenceId" />
      <!-- 审批组件 -->
      <r2-action :code="transCode" :myFlow="myFlow" :workFlow="workFlow" :basicInfo="basicInfo" :agree-handler="agreeHandler"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback" />
    </div>
  </div>
</template>
<script>
import OtherPart from "components/detail/commonPart/OtherPart";
import { numberComma } from "vux";
// 请求 引入
import {
  getListId,
  getSOList,
  getFromStatus,
  getAppExampleDetails
} from "service/detailService";
import {
  initWebContext,
  getFormViews,
  getFormViewByUniqueId,
  saveAndCommitTask
} from "service/commonService";
export default {
  components: {
    OtherPart
  },
  data() {
    return {
      transCode: "",
      listId: "",
      viewId: "",
      model: null,
      fieldSets: [],
      formData: {},
      //经过处理的经办人信息
      transactor: {},
      config: {},
      biReferenceId: null,
      //经过处理的基本信息
      baseinfo: {},
      attachment:[],
      myFlow: [],
      workFlow: [],
      basicInfo: {},
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
    handlerFormData(formData) {
      var key,
        key1,
        item,
        list,
        singleFieldCts = this.singleFieldCts;

      for (key in formData) {
        item = formData[key];
        if (item && "object" === typeof item && "dataSet" in item) {
          list = item.dataSet;
          delete item.dataSet;
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
    async loadPage() {
      let { transCode, listId, viewId, model } = this.$route.query;

      if (transCode) {
        this.transCode = transCode;
        if (viewId) {
          this.viewId = viewId;
          this.model = model || "edit";
        } else {
          //加载查看视图
          await this.getViewIdByTransCode(transCode);
        }
      } else if (listId) {
        //没有transCode,获取新建视图。
        this.listId = listId;
        await this.getViewIdByListId();
      }

      if (this.viewId) {
        await this.loadFormCfg();
        if (transCode) {
          await this.loadFormData(transCode);
        }
        this.$loading.hide();
        // 触发父组件的scroll刷新
        this.$emit("refresh-scroll");
      } else {
        this.$vux.alert.show({
          content: "抱歉，无法支持该应用的查看",
          onHide: () => {
            this.$router.go(-1);
          }
        });
      }
      // 触发父组件的scroll刷新
      this.$emit("refresh-scroll");
    },
    loadFormData(transCode) {
      var params = {
          formViewUniqueId: this.viewId,
          transCode
        },
        api = this.config.config.isBaseObject
          ? this.config.config.baseObjectKey
          : "formAPI";
      return getSOList(params, api).then(
        ({ formData = {}, attachment = [], biReferenceId }) => {
          this.handlerFormData(formData);
          this.attachment = attachment;
          this.biReferenceId = biReferenceId;
        }
      );
    },
    loadFormCfg() {
      return getFormViewByUniqueId(this.viewId).then(data => {
        let { appName, config, dataSource } = data;
        window.document.title = appName;
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
          this.config = data;
          console.log("this.config", this.config);
          this.fieldSets = fieldSets;
        }
      });
    },
    getMyFlow(data) {
      this.myFlow = data;
    },
    getWorkFlow(data) {
      this.workFlow = data;
    },
    getBasicInfo(data) {
      this.basicInfo = data;
    },
    // 同意的处理,提交数据校验
    agreeHandler() {

    },
    // 同意、拒绝、撤回成功时的回调
    submitSuccessCallback(val) {
      let type = JSON.parse(val).type;
      if (type !== 'revoke') {
        this.$emit('change', true);
      }
    },
  },
  created() {
    initWebContext().then(()=>{
        this.loadPage();
    })
    this.fieldMap = {};
  }
};
</script>
<style>
.fieldSets {
  background: #f8f8f8;
}
</style>