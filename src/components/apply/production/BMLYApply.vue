<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
          :handle-org-list="handleORG" :user-role-list="userRoleList"></pop-baseinfo>
          <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
          <template slot="rNumber" slot-scope="{item}">
            <r-number :num="item.qualityQty" :max="Number(item.qtyBal)" v-model="item.qualityQty"></r-number>
          </template>
        </apply-matter-part>
        <div class="project_part">
          <div :class="{'vux-1px-t': dIndex>0}" v-for="(dItem,dIndex) in baseinfoExtConfig" :key="dIndex">
            <!-- 可编辑的字段 -->
            <template v-if="!dItem.readOnly">
              <!-- 下拉框 -->
              <r-picker :title="dItem.fieldLabel" :data="dItem.remoteData" :value="project[dItem.fieldCode]"
                      v-model="project[dItem.fieldCode]" :required="!dItem.allowBlank"
                      v-if="dItem.xtype === 'r2Selector'"></r-picker>
            </template>
            <!--不可编辑的字段 -->
            <template  v-else>
              <div class='each_property readOnly'>
                <label :class="{required: !dItem.allowBlank}">{{dItem.fieldLabel}}</label>
                <span class='property_val'>{{project[dItem.fieldCode]}}</span>
              </div>
            </template>
          </div>
        </div>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部操作栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
      :all-check="checkList.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
      @on-delete="deleteCheckd">
    </op-button>
  </div>
</template>

<script>
// vux插件引入
import { dateFormat, XTextarea } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { getObjInvMoreUnitByInvCode } from 'service/materService'
import { updateData, submitAndCalc, saveAndStartWf, saveAndCommitTask } from 'service/commonService'
// mixins 引入
import applyCommon from 'mixins/applyCommon'
// 组件引入
import RPicker from 'components/public/basicPicker'
import RNumber from 'components/public/RNumber'
import OpButton from 'components/apply/commonPart/OpButton'
import PopDealerList from 'components/Popup/PopDealerList'
import PopWarehouseList from 'components/Popup/PopWarehouseList'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 公共方法
import {toFixed} from '@/plugins/calc'
import {accAdd, accMul, accDiv, accSub} from 'plugins/calc/decimalsAdd'

const DRAFT_KEY = 'BMLY_DATA';

export default {
  name: 'ApplyBMLYForm',
  data() {
    return {
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, 
        {
          name: '物料编码',
          value: 'inventoryCode',
        }
      ],
      taskId: '',
      transCode: '',
      biReferenceId: '',
      matter: {},
      numMap: {},
      formData: {},
      orderList: {},
      dealerInfo: {}, // 供应商客户信息
      contactInfo: {},
      warehouseStoreInfo: {}, // 库位信息
      actions: [],
      modifyKey: null,
      modifyIndex: null,
      showMatterPop: false,
      project: {}
    }
  },
  mixins: [applyCommon],
  components: {
    XTextarea, RNumber,
    OpButton, PopBaseinfo, DealerOtherPart, 
    PopDealerList, PopWarehouseList, ApplyMatterPart,RPicker
  },
  computed: {
    // 将orderList转为数组
    matterList() {
      let arr = [];
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          arr.push(item);
        }
      }
      return arr;
    },
  },
  watch: {
    project: {
      handler(val) {
        // 修改项目名称，获取对应的项目类型
        if (val.project) {
          for (let item of this.baseinfoExtConfig) {
            if (item.fieldCode === 'project'){
              for (let dItem of item.remoteData){
                if (dItem.name === val.project){
                  this.project.projectType_project = dItem.PROJECT_TYPE;
                  this.project.dealerName_projectManager = dItem.projectManagerName;
                  this.project.expectStartDate_project = dItem.expectStartDate;
                  this.project.expectEndDate_project = dItem.expectEndDate;
                  this.project.projectAddress_project = dItem.address;
                  this.project.budgetIncome_project = dItem.budgetIncome;
                  break
                }
              }
              break
            }
          }
        }
      },
      deep: true
    },
  },
  methods: {
    // 新增更多订单
    addMatter() {
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          // 存储已输入的价格
          this.numMap[`${item.transCode}_${item.inventoryCode}`] = {...item};
        }
      }
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      let orderList = JSON.parse(JSON.stringify(this.orderList));
      sels.forEach(item => {
        let key = `${item.transCode}_${item.inventoryCode}`;
        let orderListKey = item.transCode ? item.transCode : 'noCode';
        let {
          price = item.price,
          taxRate = item.taxRate,
          qualityQty = item.qtyBal,
          validUntil = item.validUntil,
          thenQtyBal = item.salesOutQty,
          productionDate = dateFormat(item.productionDate, 'YYYY-MM-DD'),
        } = this.numMap[key] || {};

        item.tdQty = qualityQty; // 合格数
        item.price = price;
        item.qualityQty = qualityQty; // 送货数
        item.samplesQty = 0; // 取样数
        item.checkLossQty = 0; // 检损数
        item.lockQty = qualityQty; // 净入库数
        item.differenceNum = 0; // 退货数，送货数 - 合格数
        item.taxRate = taxRate;
        item.productionDate = productionDate;
        item.validUntil = validUntil;
        item.tdProcessing = item.processing;
        item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        item.assMeasureDescription = item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
        
        if (!orderList[orderListKey]) {
          orderList[orderListKey] = [];
        }
        orderList[orderListKey].push(item);
      });
      this.orderList = orderList;
    },
    // 删除的选中状态
    showSelIcon(sItem, index) {
      if (sItem.transCode) {
        return this.selItems[sItem.transCode] && this.selItems[sItem.transCode].findIndex(item => item === index) !== -1;
      }
      else {
        return this.checkList.includes(index);
      }
    },
    // 选择要删除的物料
    delClick(sItem, index, key) {
      let arr = this.selItems[key];
      if (arr){
        let delIndex = arr.findIndex(item => item === index);
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          if (!arr.length) delete this.selItems[key];
          return;
        }
        arr.push(index);
      }
      else {
        this.$set(this.selItems, key, [index])
      }
    },
    // 提价订单
    submitOrder() {
      /** 
       * @warn    提示文字
       * @dateSet   提交数据
       * 
       * @baseinfoExtConfig  <往来部分> 配置
       * @dealerInfo  <往来部分> 信息
       * @validateMap <仓库 库位> 校验字段
       * 
       */ 
      
      let warn = '', dataSet = [], 
          dealerInfo = this.dealerInfo, 
          baseinfoExtConfig = this.baseinfoExtConfig;
      let validateMap = [
        {
          key: 'warehouse',
          message: '仓库'
        }, 
        {
          key: 'warehouseStoreInfo',
          childKey: 'warehouseCode',
          message: '库位'
        },
      ];

      // 校验 <往来部分> 必填字段
      warn = this.verifyData(baseinfoExtConfig, dealerInfo);

      // 校验 仓库/库位 必填字段
      if (!warn) {
        warn = this.validateSubmitVal(validateMap);
      }
            
      if (!warn) {
        let submitMatterField = this.submitMatterField;

        // 校验 物料列表
        if (!this.matterList.length) warn = '请选择物料';

        // 组装dataSet
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            let oItem = {};
            for (let sItem of submitMatterField) {
              let val = this.getMatterItemVal(item, sItem);
              if (!sItem.hidden && !sItem.allowBlank && !val) {
                if (sItem.text) warn = `${sItem.text}不为空`;
                break;
              }
              oItem[sItem.fieldCode] = val !== null ? val !== undefined ? val : '' : null;
            }
            dataSet.push(oItem);
          }
        }
      }

      if (warn) {
        this.$vux.alert.show({
          content: warn
        });
        return
      }
      
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          this.$HandleLoad.show();
          let operation = saveAndStartWf;
          let formData = {};
          let wfPara = {
            [this.processCode]: {
              businessKey: this.businessKey,
              createdBy: ''
            }
          };

          formData = {
            ...this.formData,
            handlerEntity: this.entity.dealerName,
            creator: this.formData.handler,
            modifer: this.formData.handler,
            dealerCreditContactPersonName: this.contactInfo.dealerName || '', // 联系人姓名
            dealerCreditContactInformation: this.contactInfo.dealerMobilePhone || '', // 联系人手机
            containerInWarehouseManager: this.warehouse.containerInWarehouseManager || null,
            inPut: {
              containerCode: this.warehouse.warehouseCode, // 仓库编码
              dealerCodeCredit: this.dealerInfo.dealerCode, // 供应商编码
              daysOfAccount: this.dealerInfo.daysOfAccount, // 账期天数
              crDealerLabel: this.dealerInfo.dealerLabelName || '供应商', // 供应商页签
              storehouseInCode: this.warehouseStoreInfo.warehouseCode, // 库位编码
              crDealerPaymentTerm: this.dealerInfo.crDealerPaymentTerm,
              accountExpirationDate: this.dealerInfo.accountExpirationDate, // 账期到期日
              dataSet
            }
          };
          // 重新提交
          if (this.transCode && !this.isModify) {
            operation = saveAndCommitTask;
            wfPara = {
              businessKey: this.transCode,
              createdBy: this.formData.handler,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: ''
            };
          }
          let submitData = {
            listId: this.listId,
            biComment: '',
            biReferenceId: this.biReferenceId,
            formData: JSON.stringify(formData),
            wfPara: JSON.stringify(wfPara)
          };
          // 新增
          if (!this.transCode) {
            delete submitData.biReferenceId
          }
          // 无工作流
          if (!this.processCode.length) {
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          if (this.biReferenceId) {
            submitData.biReferenceId = this.biReferenceId
          }
          if (this.isModify) {
            operation = updateData;
          }
          this.saveData(operation, submitData);
        }
      })
    },
    // 全选
    checkAll() {
      // 如果已全部选中 则清除所有选中状态
      if (this.checkList.length === this.matterList.length) {
        this.selItems = {};
        return
      }
      // 针对物料列表中的数据进行处理
      let selItems = {};
      for (let key in this.orderList){
        this.orderList[key].forEach((item, index) => {
          // 存在交易号时 key等于交易号
          if (item.transCode) {
            if (!selItems[item.transCode]){
              selItems[item.transCode] = [];
            }
            selItems[item.transCode].push(index)
          }
          // 不存在时 key为 'noCode'
          else {
            if (!selItems['noCode']) {
              selItems['noCode'] = []
            }
            selItems['noCode'].push(index);
          }
        })
      }
      this.selItems = selItems;
    },
    // 删除选中的
    deleteCheckd() {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          /** 
           *  @selItems {String} 被选中删除的物料对象（当有交易号时 key为交易号 反之 key为noCode）
           *  @checkList {Array} 被选中删除的物料数组 (存储被删除物料的下标)
           *  @matterList {Array} 物料列表
           */ 

          // 被选中删除的物料
          let selItems = this.selItems, checkList = this.checkList;
          
          for (let key in this.selItems) {
            // 当没有对应的交易单号
            if (key === 'noCode') {
              let orderList = {};
              let remainder = this.matterList.filter((item, index) => !checkList.includes(index));
              remainder.forEach(item => {
                if (!orderList[key]) {
                  orderList[key] = []
                }
                orderList[key].push(item);
              });
              this.orderList = orderList;
            }
            // 当存在对应的交易单号
            else {
              // 将orderList中对应交易号的物料 按照selItems中的索引删除
              let newIndexs = this.selItems[key].map((val, idx) => val - idx);              
              newIndexs.forEach((sItem, sIndex) => {
                this.orderList[key].splice(sItem, 1);
              }) 
              if (!this.orderList[key].length){
                delete this.orderList[key]
              }
            }
          }
          this.selItems = {};
          this.matterModifyClass = false;
        }
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizApply';
    .project_part{
    margin-top: .1rem;
    background: #fff;
    padding: 0 .15rem;
    margin-bottom: .1rem;
  }
  .fill_wrapper{
    padding-bottom: .1rem;
    font-size: .14rem;
    
  }
  .each-info{
    background-color: #fff;
    padding: 0 .15rem;
  }
  .each_property {
    padding: .18rem 0;
    display: flex;
    justify-content: space-between;
    line-height: .14rem;
    label{
      color: #696969;
    }
    .add{
      color: #3296FA;
    }
    .required {
      color: #3296FA;
      font-weight: bold;
    }
    .property_val {
      text-align: right;
    }
    .readonly {
      color: #999;
    }
    .picker {
      display: flex;
      align-items: center;
      .icon-right{
        width: .08rem;
        height: .14rem;
        margin-left: .1rem;
      }
    }
  }
</style>
