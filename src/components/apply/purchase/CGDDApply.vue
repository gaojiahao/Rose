<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
          :handle-org-list="handleORG" :user-role-list="userRoleList"
          :status-data="currentStage" v-model="formData.biProcessStatus" :showStatus="false">
        </pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list  @sel-dealer="selDealer" :defaultValue="dealerInfo" :defaultContact="contact"
                          dealerTitle="供应商" @sel-contact="selContact" :dealer-params="dealerParams"></pop-dealer-list>
        <!-- 结算方式 -->
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :show-matter-pop="showMatterPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" :default-value="[]"
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
        </apply-matter-part>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="请输入"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
              :all-check="checkList.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
              @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux插件引入
import { XTextarea, dateFormat,} from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { 
  updateData, 
  submitAndCalc, 
  saveAndStartWf, 
  saveAndCommitTask, 
  getPriceFromProcurementContract
} from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import PopDealerList from 'components/Popup/PopDealerList'
import OpButton from 'components/apply/commonPart/OpButton'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 方法引入
import { accAdd, accMul, accDiv } from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'
const DRAFT_KEY = 'CGDD_DATA';

export default {
  components: {
    XTextarea,
    PopDealerList,PopBaseinfo, DealerOtherPart, ApplyMatterPart, OpButton
  },
  data () {
    return {
      taxRate: 0.16, // 税率
      showMaterielPop: false, // 是否显示物料的popup
      dealer: {}, // 往来信息
      contact: {},
      selItems: {},
      formData: {}, // 表单提交内容
      orderList: {},
      dealerInfo: {},
    }
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
  mixins: [common],
  filters: {
    dateFormat,
  },
  watch:{
    orderListTitle(val) {
      if (!val.includes('物料')){
        this.filterList = [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          },
          {
            name: val,
            value: 'transCode',
          }
        ]
      }
      else {
         this.filterList = [
          {
            name: '物料名称',
            value: 'inventoryName',
          }, {
            name: '物料编码',
            value: 'inventoryCode',
          }
        ]
      }
    }
  },
  methods: {
    // 选中的供应商
    selDealer (val) {
      let [chosenDealer = {}] = JSON.parse(val);

      // 为了提交时校验字段 此处重组部分数据
      chosenDealer.daysOfAccount= chosenDealer.pamentDays;
      chosenDealer.drDealerPaymentTerm = chosenDealer.paymentTerm;
      chosenDealer.dealerName_dealerDebit = chosenDealer.dealerName;

      // 选中赋值
      this.dealerInfo = chosenDealer;

      // 根据客户 重新匹配<物料列表>的请求参数
      if (this.matterParams.data && this.matterParams.data.dealerCode != null){
        this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
        this.orderList = {};
      }
      // 修改往来时候，若有物料需要重新请物料的价格和税率
      if (this.matterList.length) {
        this.matterList.forEach(item => {
          this.getPrice(item)
        })
      }
    },
    // 选中联系人
    selContact (val) {
      this.dealer.dealerDebitContactPersonName = val.dealerName;
      this.dealer.dealerDebitContactInformation = val.dealerMobilePhone;
      this.contact = {
        ...this.contact,
        ...val
      }
    },
    // 根据往来，物料编码，物料包装数量获取物料单价和税率
    getPrice(item){
      let params = {
        dealerCode: this.dealerInfo.dealerCode,
        matCodes: [
          {
            qty: item.assistQty,
            matCode: item.inventoryCode
          }
        ]
      }
      getPriceFromProcurementContract(params).then(({data = {}}) => {
        if (Object.keys(data).length){
          // 有值则不修改
          !item.price && item.price !== 0 && this.$set(item, 'price', Object.values(data)[0].price);
          !item.taxRate && item.taxRate !== 0 && this.$set(item, 'taxRate', Object.values(data)[0].taxRate)
        }
      })
    },
    // 选中物料项
    selMatter (val) {
      let sels = JSON.parse(val);
      let orderList = JSON.parse(JSON.stringify(this.orderList));
      let matCodes = [];
      sels.map(item => {
        let orderListKey = item.transCode ? item.transCode : 'noCode';
        matCodes.push(item.inventoryCode);
        for (let key in this.dataIndexMap){
          // 格式化日期
          if (key === 'promDeliTime' || key === 'shippingTime'){
            item[key] = dateFormat(item[this.dataIndexMap[key]], 'YYYY-MM-DD') || "";
          }
          else {
            item[key] = item[key] || item[this.dataIndexMap[key]];
          }
        }
        item.tdQty = item.tdQty || item.qtyBal;
        item.assistQty = toFixed(accDiv(item.tdQty, item.assMeasureScale))
        // 根据往来，物料编码获取物料的单价和税率
        if (this.dealerInfo.dealerCode){
          this.getPrice(item)
        }
        if (!orderList[orderListKey]) {
          orderList[orderListKey] = [];
        }
        orderList[orderListKey].push(item);
      });
      this.dealerParams.data = {
        ...this.dealerParams.data,
        matCodes: matCodes.join(','),
      };
      this.numMap = {};
      this.orderList = orderList;
    },
    // 选择默认图片
    getDefaultImg (item) {
      let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
    },
    // 显示物料修改的pop
    getMatterModify(item, index, key) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // 更新修改后的物料信息
    selConfirm(val) {
      let modMatter = JSON.parse(val);
      this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
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
    // 删除的选中状态
    showSelIcon(sItem, index) {
      if (sItem.transCode) {
        return this.selItems[sItem.transCode] && this.selItems[sItem.transCode].findIndex(item => item === index) !== -1;
      }
      else {
        return this.checkList.includes(index);
      }
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
    // 新增更多物料
    addMatter () {
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 校验数字
    checkAmt(item, key, val) {
      item[key] = Math.abs(toFixed(val));
      if (key === 'tdQty'){
        if (val > item.thenQtyBal){
          item[key] = item.thenQtyBal;
        }
      }
    },
    // 提价订单
    submitOrder () {
      /** 
       * @warn    提示文字
       * @dateSet   提交数据
       * 
       * @dealerConfig  <往来部分> 配置
       * @dealerInfo  <往来部分> 信息
       * 
       */ 
      
      let warn = '', dataSet = [], 
          dealerInfo = this.dealerInfo, 
          dealerConfig = this.dealerConfig;
      
      // 校验 <往来部分> 必填字段
      warn = this.verifyData(dealerConfig, dealerInfo);

      if (!warn) {
        // 校验 是否已选择 <物料部分>
        if (!this.matterList.length) warn = '请选择物料';
        
        // 校验
        for (let item of this.matterList) {
          let oItem = {};
          for (let sItem of this.submitMatterField){
            if (!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode]){
              warn = `${sItem.text}不为空`
              break;
            }
            oItem[sItem.fieldCode] = item[sItem.fieldCode] != null ? item[sItem.fieldCode] : null
          }
          oItem.dealerDebit = this.dealerInfo.dealerCode;
          oItem.drDealerLabel = this.dealerInfo.dealerLabelName || ''
          dataSet.push(oItem);
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
            [this.processCode]: {businessKey:this.businessKey,createdBy:""}
          }
          if (this.isResubmit && !this.isModify) {
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
              handlerEntity: this.entity.dealerName,
              dealerDebitContactPersonName: this.contact.dealerName || null,
              dealerDebitContactInformation: this.contact.dealerMobilePhone || '',
              order: {
                drDealerPaymentTerm: this.dealerInfo.drDealerPaymentTerm,  // 结算方式
                daysOfAccount: this.dealerInfo.daysOfAccount,
                dataSet
              },
              inPut:{
                dataSet:[
                  {
                    dealerDebit: this.dealerInfo.dealerCode,
                    drDealerLabel: this.dealerInfo.dealerLabelName || '',
                    tdAmountCopy1: this.dealerInfo.tdAmountCopy1 || null,
                    prepaymentDueDate: this.dealerInfo.prepaymentDueDate || ''
                  }
                ]
              }
            }),
            wfPara: JSON.stringify(wfPara)
          }
          // 重新提交
          if (this.isResubmit){
            operation = saveAndCommitTask
            submitData.biReferenceId = this.biReferenceId;
          }
          // 没有工作流
          if (!this.processCode.length){
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
          this.saveData(operation,submitData);
        }
      })
    },
    // 获取订单信息用于重新提交
    async getFormData () {
      await getSOList({
        formViewUniqueId: this.uniqueId,
        transCode: this.transCode
      }).then( (data) => {
        this.listId = data.listId;
        this.biComment = data.biComment;
        this.biReferenceId = data.biReferenceId;
        let {formData} = data;
        let{inPut = {}, order = {}} = formData;
        this.attachment = data.attachment;
        let orderList = {}, dataSet = [];
        let matCodes = [];
        dataSet = order.dataSet.map(item=> {
          matCodes.push(item.inventoryCode_transObjCode);
          item = {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing || '商品',
            measureUnit: item.measureUnit_transObjCode,
            safeStock: item.safeStock_transObjCode,
            qtyBal: item.thenQtyBal,
            moq: item.moq_transObjCode,
            leadTime: item.leadTime_transObjCode,
          }
          if (item.transCode){
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          }
          else {
            if (!orderList['noCode']) {
              orderList['noCode'] = []
            }
            orderList['noCode'].push(item);
          }
          return item
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
          ...this.handlerDefault,
          creator: formData.creator,
          modifer: formData.modifer,
          biComment: formData.biComment, // 备注
          biProcessStatus: formData.biProcessStatus,
          biId: formData.biId,
        }
        // 供应商信息展示
        this.dealerInfo = {
          dealerCode: inPut.dataSet[0].dealerDebit,
          dealerSubclass: inPut.dataSet[0].drAccountSub,
          dealerName: inPut.dataSet[0].dealerName_dealerDebit,
          province: inPut.dataSet[0].province_dealerDebit,
          city: inPut.dataSet[0].city_dealerDebit,
          county: inPut.dataSet[0].county_dealerDebit,
          address: inPut.dataSet[0].address_dealerDebit,
          drDealerPaymentTerm: order.drDealerPaymentTerm,
          daysOfAccount: order.daysOfAccount,
          dealerLabelName: inPut.dataSet[0].drDealerLabel,
          tdAmountCopy1: inPut.dataSet[0].tdAmountCopy1,
          prepaymentDueDate: inPut.dataSet[0].prepaymentDueDate
        }
        this.contact = {
          dealerName: formData.dealerDebitContactPersonName,
          dealerMobilePhone: formData.dealerDebitContactInformation,
        }
        this.dealerParams.data = {
          ...this.dealerParams.data,
          matCodes: matCodes.join(','),
        };
        this.$loading.hide();
      })
    },
    // 是否保存草稿
    hasDraftData () {
      if (!this.matterList.length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          orderList: this.orderList,
          dealerInfo: this.dealerInfo,
          formData: this.formData,
          contact: this.contact,
        }
      };

    },
  },
  created () {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      this.orderList = JSON.parse(data).orderList;
      this.dealerInfo = JSON.parse(data).dealerInfo;
      this.formData = JSON.parse(data).formData;
      this.contact = JSON.parse(data).contact;
      sessionStorage.removeItem(DRAFT_KEY);
    }

  },
}
</script>

<style lang='scss' scoped>
@import './../../scss/bizApply';
.pages {
  /deep/ .vux-no-group-title{
    margin-top: 0;
  }
  /deep/ .weui-cells {
    font-size: .14rem;
    &:before {
      border-top: none;
      left: 0;
    }
  }
  .other_info{
    width: 95%;
    margin: 0 auto;
    background: #fff;
    box-sizing: border-box;
    padding: .08rem .1rem;
    display: flex;
    font-size: .14rem;
    align-items: center;
    justify-content: space-between;
    .title{
      color: #757575;
    }
    .mode{
      color: #111;
      font-weight: 500;
    }
  }
  .tdAmount {
    margin: 0 auto;
    padding: .07rem .1rem;
    width: 95%;
    background-color: #fff;
    color: #757575;
    font-size: .14rem;
    box-sizing: border-box;
    &:before {
      display: none;
    }
    /deep/ .weui-input {
      color: #111;
    }
  }
}
</style>

