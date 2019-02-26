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
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" :default-value="matterList"
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :add-matter-fn="addMatter" :sel-matter-fn="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order-fn="stopOrder" :get-matter-modify-fn="getMatterModify" :show-delete-fn="showDelete" :show-sel-icon-fn="showSelIcon" :del-click-fn="delClick"
          :chosen-matter="matter" :check-amt-fn="checkAmt" :sel-confirm-fn="selConfirm" :btn-is-hide="btnIsHide" @show-down-modify-pop="shutDownModify">
        </apply-matter-part>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
              :all-check="selItems.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
              @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux插件引入
import { XTextarea, dateFormat,} from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc, getPriceFromProcurementContract, updateData } from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import PopDealerList from 'components/Popup/PopDealerList'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
import OpButton from 'components/apply/commonPart/OpButton'
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
      dealer: {}, // 往来信息
      formData: { // 表单提交内容
        creator: '',
        modifer: '',
        biId: '',
        biComment: ''
      },
      dealerInfo: {},
      contact: {},
      orderList: {},
      showMaterielPop: false, // 是否显示物料的popup
      showDealerPop: false, // 是否显示供应商的popup
    }
  },
  computed: {
    // TODO 将orderList转为数组
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
      if(!val.includes('物料')){
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
      else{
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
      this.dealerInfo = JSON.parse(val)[0];
      this.dealerInfo.drDealerPaymentTerm = this.dealerInfo.paymentTerm;
      this.dealerInfo.daysOfAccount= this.dealerInfo.pamentDays;
      if(this.matterParams.data && this.matterParams.data.dealerCode != null){
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
      getPriceFromProcurementContract(params).then(({data = {}}) =>{
        if(Object.keys(data).length){
          // 有值则不修改
          !item.price && item.price !== 0 && this.$set(item, 'price', Object.values(data)[0].price);
          !item.taxRate && item.taxRate !== 0 && this.$set(item, 'taxRate', Object.values(data)[0].taxRate)
        }
      })
    },
    // TODO 选中物料项
    selMatter (val) {
      let sels = JSON.parse(val);
      let orderList = {};
      let matCodes = [];
      sels.map(item => {
        let orderListKey = item.transCode ? item.transCode : 'noCode';
        matCodes.push(item.inventoryCode);
        for(let key in this.dataIndexMap){
          // 格式化日期
          if(key === 'promDeliTime' || key === 'shippingTime'){
            item[key] = dateFormat(item[this.dataIndexMap[key]], 'YYYY-MM-DD') || "";
          }
          else{
            item[key] = item[key] || item[this.dataIndexMap[key]];
          }

        }
        item.tdQty = item.tdQty || item.qtyBal;
        item.assistQty = toFixed(accDiv(item.tdQty, item.assMeasureScale))
        // 根据往来，物料编码获取物料的单价和税率
        if(this.dealerInfo.dealerCode){
          this.getPrice(item)
        }
        if (!orderList[orderListKey]) {
          orderList[orderListKey] = [];
        }
        orderList[orderListKey].push(item);
        // let defaultTime = item.processingStartDate ? dateFormat(item.processingStartDate, 'YYYY-MM-DD') : '';
        // let defaultTdQty = item.qtyBal < item.qty ? item.qty : item.qtyBal;
        // item.tdQty = item.tdQty || defaultTdQty;
        // item.price = item.price || ''
        // item.taxRate = item.taxRate || 0.16;
        // item.shippingTime = dateFormat(item.shippingTime, 'YYYY-MM-DD');
        // item.tdLeadTime = item.leadTime;
        // item.processingStartDate = item.processingStartDate || defaultTime;
        // item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        // item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        // item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
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
    // TODO 显示物料修改的pop
    getMatterModify(item, index, key) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // TODO 更新修改后的物料信息
    selConfirm(val) {
      let modMatter = JSON.parse(val);
      this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
    },
    // TODO 匹配相同项的索引
    findIndex (arr, sItem) {
      return arr.findIndex(item => item.transCode === sItem.transCode && item.inventoryCode === sItem.inventoryCode);
    },
    // 选择要删除的物料
    delClick(sItem, index, key) {
      let arr = this.selItems;
      let delIndex = this.findIndex(arr, sItem);
      /*if(sItem.transCode){
        delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
      }
      else{
        delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
      }*/
      //若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // TODO 判断是否展示选中图标
    showSelIcon(sItem) {
      /*if(sItem.transCode){
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
      }
      else{
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
      }*/
      return this.findIndex(this.selItems, sItem) !== -1;
    },
    // 全选
    checkAll() {
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = JSON.parse(JSON.stringify(this.matterList));
    },
    // 删除选中的
    deleteCheckd() {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          let orderList = {};
          let selItems = this.selItems;
          let remainder = this.matterList.filter((item, index) => this.findIndex(selItems, item) === -1); // 没被删除的
          remainder.forEach(item => {
            let orderListKey = item.transCode ? item.transCode : 'noCode';
            if (!orderList[orderListKey]) {
              orderList[orderListKey] = []
            }
            orderList[orderListKey].push(item);
          });
          this.orderList = orderList;
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })

    },
    // TODO 新增更多物料
    addMatter () {
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 校验数字
    checkAmt(item, key, val) {
      item[key] = Math.abs(toFixed(val));
      if(key === 'tdQty'){
        if(val > item.thenQtyBal){
          item[key] = item.thenQtyBal;
        }
      }
    },
    // 提价订单
    submitOrder () {
      let warn = '';
      let dataSet = [];
      let validateMap = [
        {
          key: 'dealerInfo',
          childKey: 'dealerCode',
          message: '供应商信息'
        },
        {
          key: 'dealerInfo',
          childKey: 'drDealerPaymentTerm',
          message: '结算方式'
        },
        {
          key: 'matterList',
          childKey: 'length',
          message: '物料'
        },
      ];
      validateMap.every(item => {
        if (item.childKey && !this[item.key][item.childKey]) {
          warn = `请选择${item.message}`;
          return false
        }
        else if(!this[item.key]) {
          warn = `请选择${item.message}`;
          return false
        }
        return true
      });
      if (!warn) {
        // 校验
        for (let item of this.matterList) {
          let oItem = {};
          for(let sItem of this.submitMatterField){
            if(!sItem.hidden && !sItem.allowBlank && !item[sItem.fieldCode]){
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
          if(this.isModify) {
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
      }).then( (data)=>{
        this.listId = data.listId;
        this.biComment = data.biComment;
        this.biReferenceId = data.biReferenceId;
        let {formData} = data;
        let{inPut = {}, order = {}} = formData;
        this.attachment = data.attachment;
        let orderList = {}, dataSet = [];
        let matCodes = [];
        dataSet = order.dataSet.map(item=>{
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
          if(item.transCode){
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          }
          else {
            if(!orderList['noCode']) {
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
    // TODO 是否保存草稿
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

