<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false"></pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" :defaultValue="dealerInfo" :defaultContact="contact" :dealer-params="dealerParams"
                         dealerTitle="供应商" @sel-contact="selContact"></pop-dealer-list>
        <!-- 结算方式 -->
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
         <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" :default-value="[]"
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="consumables" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
        </apply-matter-part>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !consumableList.length}">
          <p class="commit-label vux-1px-b">备注栏</p>
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="checkList.length === consumableList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux插件引入
import {XTextarea, dateFormat} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {saveAndStartWf, saveAndCommitTask, submitAndCalc} from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import PopDealerList from 'components/Popup/PopDealerList'
import OpButton from 'components/apply/commonPart/OpButton'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 方法引入
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'
const DRAFT_KEY = 'DZYHPCGDD_DATA';

export default {
  components: {
    RNumber, XTextarea, OpButton,
    PopBaseinfo, PopDealerList, DealerOtherPart, ApplyMatterPart
  },
  data() {
    return {
      taxRate: 0.16, // 税率
      listId: '1d52d5ce-d05e-4987-a023-3f4dba68cad9',
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '物料编码',
          value: 'inventoryCode',
        }, {
          name: '申请号',
          value: 'transCode',
        },
      ],
      numMap: {},
      dealer: {}, // 往来信息
      contact: {},
      formData: {},
      orderList: {}, // 订单列表
      dealerInfo: {},
      consumables: {},
      modifyKey: null,
      modifyIndex: null,
      showDealerPop: false, // 是否显示供应商的popup
      showMaterielPop: false, // 是否显示物料的popup
    }
  },
  mixins: [common],
  computed: {
    // 基于 orderList 此处重组 consumableList 数据
    consumableList() {
      let arr = [];
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          arr.push(item);
        }
      }
      return arr;
    }
  },
  watch:{
    //修改的物料
    consumables:{
      handler(val){
        this.simpleCalcMatter(val)
      },
      deep:true
    },
    consumableList: {
      handler(val) {
        let tdAmount = 0, taxAmount = 0;
        for (let item of val) {
          this.simpleCalcMatter(item);
          tdAmount = toFixed(accAdd(tdAmount, item.tdAmount));
          taxAmount = toFixed(accAdd(taxAmount, item.taxAmount));
        }
        this.tdAmount = tdAmount;
        this.taxAmount = taxAmount;
      },
      deep: true
    }
  },
  methods: {
    // 选中的供应商
    selDealer(val) {
      this.dealerInfo = JSON.parse(val)[0];
      this.dealerInfo = {
        ...this.dealerInfo,
        daysOfAccount: this.dealerInfo.pamentDays,
        crDealerLabel: this.dealerInfo.dealerLabelName,
        crDealerPaymentTerm: this.dealerInfo.paymentTerm,
        dealerName_dealerCodeCredit: this.dealerInfo.dealerName,
      }
    },
    // 选中联系人
    selContact(val) {
      this.formData.dealerCreditContactPersonName = val.dealerName;
      this.formData.dealerCreditContactInformation = val.dealerMobilePhone;
      this.contact = val;
    },
    // 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      let orderList = JSON.parse(JSON.stringify(this.orderList));
      sels.forEach(item => {
        let orderListKey = item.transCode ? item.transCode : 'noCode';
        item.tdQty = item.qtyBal || '';
        item.taxRate = 0.16;
        // 如果有销售合同号
        if (item.transCode){
          if (!orderList[orderListKey]) {
            orderList[orderListKey] = [];
          }
          orderList[orderListKey].push(item);
        }
        else {
          if (!orderList['noCode']) {
            orderList['noCode'] = []
          }
          orderList['noCode'].push(item);
        }
      });
      this.orderList = orderList;
    },
    // 更新修改后的物料信息
    selConfirm(val){
      let modMatter = JSON.parse(val);
      this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
    },
    // 选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 显示物料修改的pop
    getMatterModify(item, index, key) {
      this.consumables = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // 展开可删除状态
    showDelete(){
      this.matterModifyClass = ! this.matterModifyClass;
      this.selItems = {};
    },
    // 选择要删除的物料
    delClick(sItem, index, key) {
      if (this.selItems[key]){
        let arr = this.selItems[key];
        let delIndex = arr.findIndex(item => item === index);
        if (delIndex !== -1) {
          arr.splice(delIndex, 1);
          if (!arr.length) delete this.selItems[key]
          return;
        }
        arr.push(index);
      }
      else {
        this.$set(this.selItems, key, [index])
      }
    },
    // 判断是否展示选中图标
    showSelIcon(sItem, index) {
      return this.selItems[sItem.transCode] && this.selItems[sItem.transCode].length
            && this.selItems[sItem.transCode].findIndex(item => item === index) !== -1;
    },
    // 全选
    checkAll() {
      // 要删除的物料数量等于当前物料数量
      if (this.checkList.length === this.consumableList.length){
        this.selItems = {};
        return
      }
      let obj = {};
      for (let key in this.orderList){
        this.orderList[key].forEach((item, index) => {
          if (!obj[item.transCode]){
            obj[item.transCode] = [];
          }
          obj[item.transCode].push(index)
        })
      }
      this.selItems = obj;
    },
    // 删除选中的
    deleteCheckd() {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          for (let key in this.selItems){
            let newIndexs = this.selItems[key].map((val, idx) => {return val - idx});
            // 将orderList中对应交易号的物料列表按照selItems中的索引删除
            newIndexs.forEach((sItem, sIndex) => {
              this.orderList[key].splice(sItem, 1)
              if (!this.orderList[key].length){
                delete this.orderList[key]
              }  
            }) 
          }
          this.selItems = {};
          this.matterModifyClass = false;
        }
      })
    },
    // 新增更多物料
    addMatter() {
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 提价订单
    submitOrder() {
      /** 
     * @warn    提示文字
     * @dateSet   提交数据
     * 
     * @baseinfoExtConfig  <往来部分> 配置
     * @dealerInfo  <往来部分> 信息
     * 
     */ 
    
    let warn = '', dataSet = [], 
        isSubmitOk = this.isSubmitOk,
        dealerInfo = this.dealerInfo, 
        baseinfoExtConfig = this.baseinfoExtConfig;
    
      // 校验 <往来部分> 必填字段
      warn = this.verifyData(baseinfoExtConfig, dealerInfo);

      // 校验 <物料部分> 必填字段 同时动态组装dateSet
      if (!warn) {
        // 校验 是否已选择 <物料部分>
        let [ matterPart = {} ] = this.submitMatterField;
        if (!Object.keys(this.orderList).length) warn = `请选择${matterPart.text}`;

        // 动态组装 dataSet
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            let oItem = {};
            for (let sItem of this.submitMatterField){
              let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
              if (!sItem.hidden && !sItem.allowBlank && !val && val !== undefined){
                if (sItem.text) warn = `${sItem.text}不为空`;
                break;
              }
              oItem[sItem.fieldCode] = val !== undefined ? val : '';
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
          let wfPara = {
            [this.processCode]: {businessKey: this.businessKey, createdBy: ""}
          }
          if (this.isResubmit) {
            wfPara = {
              businessKey: this.transCode,
              createdBy: this.formData.handler,
              transCode: this.transCode,
              result: 3,
              taskId: this.taskId,
              comment: ""
            }
          }
          let submitData = {
            listId: this.listId,
            biComment: this.biComment,
            formData: JSON.stringify({
              ...this.formData,
              ...this.dealer,
              handlerEntity: this.entity.dealerName,
              inPut: {
                dealerCodeCredit: this.dealerInfo.dealerCode,
                crDealerLabel: this.dealerInfo.dealerLabelName || '',  // 往来关系标签
                crDealerPaymentTerm: this.dealerInfo.crDealerPaymentTerm,  // 结算方式
                daysOfAccount: this.dealerInfo.daysOfAccount,
                dataSet
              },
            }),
            wfPara: JSON.stringify(wfPara)
          }
          // 重新提交
          if (this.isResubmit) {
            operation = saveAndCommitTask
            submitData.biReferenceId = this.biReferenceId;
          }
          // 没有工作流
          if (!this.processCode.length) {
            operation = submitAndCalc;
            delete submitData.wfPara;
            delete submitData.biReferenceId;
          }
          if (this.biReferenceId) {
            submitData.biReferenceId = this.biReferenceId
          }
          this.saveData(operation, submitData);
        }
      })
    },
    // 获取订单信息用于重新提交
    getFormData() {
      return getSOList({
        formViewUniqueId: this.uniqueId,
        transCode: this.transCode
      }).then((data) => {
        this.listId = data.listId;
        this.biComment = data.biComment;
        this.biReferenceId = data.biReferenceId;
        let {formData} = data;
        this.attachment = data.attachment;
        let orderList = {};
        formData.inPut.dataSet.map(item => {
          item = {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing || '商品',
            measureUnit: item.measureUnit_transObjCode,
            qtyBal: item.thenQtyBal,
            transCode: item.transMatchedCode,
          }
          if (!orderList[item.transCode]) {
            orderList[item.transCode] = [];
          }
          orderList[item.transCode].push(item);
          this.consumableList.push(item);
        })
        this.orderList = orderList;
        this.handlerDefault = {
          handler: formData.handler,
          handlerName: formData.handlerName,
          handlerUnit: formData.handlerUnit,
          handlerUnitName: formData.handlerUnitName,
          handlerRole: formData.handlerRole,
          handlerRoleName: formData.handlerRoleName,
        };
        // 基本信息
        this.formData = {
          ...this.formData,
          ...this.handlerDefault,
          biComment: formData.biComment,
          biId: formData.biId,
          biProcessStatus: formData.biProcessStatus,
          creator: formData.creator,
          modifer: formData.modifer,
        }
        // 供应商信息展示
        this.dealerInfo = {
          dealerMobilePhone: formData.dealerCreditContactInformation,
          dealerCode: formData.inPut.dealerCodeCredit,
          dealerSubclass: formData.inPut.drAccountSub,
          dealerName: formData.inPut.dealerName_dealerCodeCredit,
          dealerLabelName: formData.inPut.crDealerLabel,
          province: formData.inPut.province_dealerCodeCredit,
          city: formData.inPut.city_dealerCodeCredit,
          county: formData.inPut.county_dealerCodeCredit,
          address: formData.inPut.address_dealerCodeCredit,
          dealerCreditContactPersonName: formData.dealerCreditContactPersonName,
          dealerCreditContactInformation: formData.dealerCreditContactInformation,
          crDealerPaymentTerm: formData.inPut.crDealerPaymentTerm,
          daysOfAccount: formData.inPut.daysOfAccount,
          dealerName_dealerCodeCredit: formData.inPut.dealerName_dealerCodeCredit
        }
        this.contact = {
          dealerMobilePhone: formData.dealerCreditContactInformation,
          dealerName: formData.dealerCreditContactPersonName
        }
        this.$loading.hide();
      })
    },
    // 是否保存草稿
    hasDraftData() {
      if (!this.consumableList.length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          orderList : this.orderList,
          dealerInfo: this.dealerInfo,
          formData: this.formData,
          dealer: this.dealer,
          contact: this.contact
        }
      };
    },
    // 获取关联数据
    getRelationData() {

    },
  },
  created() {
    let data = sessionStorage.getItem(DRAFT_KEY),
        draft = JSON.parse(data);
    if (data) {
      this.orderList = draft.orderList;
      this.dealerInfo = draft.dealerInfo;
      this.dealer = draft.dealer;
      this.formData = draft.formData;
      this.contact = draft.contact;
      sessionStorage.removeItem(DRAFT_KEY);
    }

  },
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';

  .pages {
    /deep/ .vux-no-group-title {
      margin-top: 0;
    }
    /deep/ .weui-cells {
      font-size: .14rem;
      &:before {
        border-top: none;
        left: 0;
      }
    }
    .pament-days {
      margin: 0 auto;
      padding: .05rem .1rem;
      width: 95%;
      background-color: #fff;
      box-sizing: border-box;
      /deep/ .vux-label {
        color: #757575;
        font-size: .14rem;
      }
    }
  }
</style>

