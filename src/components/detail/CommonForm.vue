<template>
  <!--通用form组件-->
  <div class="detail_wrapper">
    <div class="basicPart">
      <!-- 经办信息 （订单、主体等）TransactorView -->
      <transactor-view :values="transactor"></transactor-view>
      <matter-list-view :matterList="matterList" :matterConfig="matterConfig"></matter-list-view>
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
  saveAndCommitTask
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
      matterList: [],           //物料列表
      matterConfig: [],         //物料配置
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
      await this.getMatterConfig(this.config);
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
      return getFormConfig(this.formViewUniqueId).then(data => {
        let { config = [], dataSource = "[]", reconfig = {} } = data;
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
        this.config = data;
        console.log('config',config)
        this.fieldSets = config;
      });
    },
    //获取物料配置
    getMatterConfig(data) {
        let {config = [], dataSource = '[]', reconfig = {}} = data;
        let [matterData = {}] = JSON.parse(dataSource);
        let matterSource = matterData.dataSource && JSON.parse(matterData.dataSource.source) || {};
        let matterCols = matterSource.cols || []; // 数据源列
        let dataIndexMap = {}; // 映射表
        let hasDataIndexMap = false; // 是否存在映射表
        let matterConfig = [];

        config.forEach(item => {
            if (!item.hiddenInRun && item.isMultiple) {
                if (item.name === 'order' || item.name === 'outPut' || item.name === 'inPut') {
                    if (item.r2GridXtype) {
                        item.items.forEach(each => {
                        each['r2GridXtype'] = item.r2GridXtype;
                        })
                    }
                    if (item.xtype === 'r2BomGridWTSK') {
                        item.items.forEach(each => {
                        each['isBomGrid'] = true;
                        })
                    }
                    matterConfig = item.items;
                    dataIndexMap = item.dataIndexMap || {};
                    hasDataIndexMap = !!Object.keys(dataIndexMap).length;
                    this.matterList = this.formData[item.name];
                }
                matterConfig = matterConfig.reduce((arr, item, index) => {
                    // 匹配 *映射表字段*
                    let key = dataIndexMap[item.fieldCode];
                    // 根据 *数据源* 查询映射表中存在字段 
                    let matchedCol = matterCols.find(col => col.k === key);
                    // 判断是否存在映射关系，若有映射关系，则判断是否有该字段且判断字段是否隐藏，没有映射关系则直接展示
                    let needShow = key ? (matchedCol ? !item.hidden : false) : true;
                    if (matterCols.length) {
                        if (!item.hidden && needShow) {
                        arr.push(item);
                        }
                    }
                    else {
                        if (!item.hidden) {
                            arr.push(item) 
                        }
                    }          
                    return arr
                }, []);
                this.matterConfig = matterConfig;
                this.setMatterConfig(this.matterList);
            }
        });
    },
    //设置物料的动态渲染部分
    setMatterConfig(arr) {
      let numTypeList = ['r2Numberfield', 'r2Percentfield', 'r2Permilfield'];
      let matterConfig = this.matterConfig;
      arr.forEach(matter => {
        let others = [];
        let dates = [];
        let matterComment = {};
        matterConfig.forEach(item => {
          item = {...item};

          item.value = numTypeList.includes(item.editorType) 
            ? numberComma(matter[item.fieldCode]) || '0' 
            : matter[item.fieldCode] || '无';

          if (item.editorType === 'r2Datefield') {
            dates.push(item);
          } 
          else if (item.fieldCode === 'comment') {
            matterComment = item;
          } 
          else {
            others.push(item);
          }
        });
        matter.others = others;
        matter.dates = dates;
        matter.matterComment = matterComment;
      });
    }
  },
  created() {
    this.loadPage();
  }
};
</script>