<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"
                      :status-data="currentStage" v-model="formData.biProcessStatus">
        </pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo" :dealer-params="dealerParams"
                         :defaultContact="contactInfo"></pop-dealer-list>
        <dealer-other-part :dealer-config="dealerConfig" :dealer-info="dealerInfo" v-model="dealerInfo"></dealer-other-part>
        <!-- 物料列表 -->
        <apply-matter-part v-model="showMaterielPop" :show-materiel-pop="showMaterielPop" :filter-list="filterList"
          :actions="actions" :btnInfo="btnInfo" :matter-list="orderList" :default-value="matterList" 
          :matter-pop-config="matterPopConfig" :matter-edit-config="matterEditConfig" :order-list-title="orderListTitle" :matter-params="matterParams"
          :addMatter="addMatter" :sel-matter="selMatter" :sel-items="selItems" :matter-modify-class="matterModifyClass"
          :stop-order="stopOrder" :modify-matter="modifyMatter" :show-delete="showDelete" :show-sel-icon="showSelIcon" :del-click="delClick">
        </apply-matter-part>
        <!--物料编辑pop-->
        <pop-matter :modify-matter='matter' :show-pop="showMatterPop" @sel-confirm='selConfirm'
                    v-model='showMatterPop' :btn-is-hide="btnIsHide" :config="matterEditConfig">
        </pop-matter>
        <!--备注-->
        <div class='comment vux-1px-t' :class="{no_margin : !matterList.length}">
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部提交确认栏 -->
    <div class="count_mode vux-1px-t" :class="{btn_hide : btnIsHide}" v-if="!matterModifyClass">
      <span class="count_num"
            :class="{nine_up : tdAmount.length  > 8 ,
          ten_up : tdAmount.length  > 9,
          ele_up : tdAmount.length  > 10}"
      >
        <span class="total_price">
          <span class="symbol">￥</span>{{tdAmount | numberComma(3)}}
        </span>
        <span class="taxAmount">[含税: ￥{{taxAmount | numberComma(3)}}]</span>
      </span>
      <span class="count_btn" @click="submitOrder">提交</span>
    </div>
    <!-- 底部删除确认栏 -->
    <div class="count_mode vux-1px-t delete_mode" :class="{btn_hide : btnIsHide}" v-else>
      <div class='count_num all_checked' @click="checkAll">
        <x-icon type="ios-circle-outline" size="20" class='outline'
                v-show="selItems.length !== matterList.length"></x-icon>
        <x-icon type="ios-checkmark" size="20" class="checked" v-show="selItems.length === matterList.length"></x-icon>
        全选
      </div>
      <div class='delete_btn' @click="deleteCheckd">删除</div>
    </div>
  </div>
</template>

<script>
// vux组件引入
import {Popup, TransferDom, Group, Cell, numberComma, Datetime, XInput, XTextarea, dateFormat} from 'vux'
// 请求 引入
import {getSOList} from 'service/detailService'
import {getBaseInfoData, saveAndStartWf, saveAndCommitTask, getDictByType, submitAndCalc, getPriceFromSalesContractAndPrice} from 'service/commonService'
// mixins 引入
import common from 'components/mixins/applyCommon'
// 组件引入
import RNumber from 'components/RNumber'
import PopMatterList from 'components/Popup/PopMatterListTest'
import PopDealerList from 'components/Popup/PopDealerList'
import DealerOtherPart from 'components/apply/commonPart/dealerOtherPart'
import PopSingleSelect from 'components/Popup/PopSingleSelect'
import PopMatter from 'components/apply/commonPart/MatterPop'
import RPicker from 'components/basicPicker'
import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
import ApplyMatterPart from 'components/apply/commonPart/applyMatterPart'
// 方法引入
import {accAdd, accMul, accDiv, accSub} from '@/home/pages/maps/decimalsAdd'
import { toFixed } from '@/plugins/calc'
const DRAFT_KEY = 'XSDD_DATA';

export default {
  data() {
    return {
      filterList: [
        {
          name: '物料名称',
          value: 'inventoryName',
        }, {
          name: '物料编码',
          value: 'inventoryCode',
        }, {
          name: '合同号',
          value: 'transCode',
        }
      ],        
      showMatterPop: false,
      showMaterielPop: false, // 是否显示物料的popup
      transMode: [], // 结算方式 数组
      matterList: [], // 物料列表
      numMap: {}, // 用于记录订单物料的数量和价格
      formData: {},
      dealerInfo: {},
      orderList: {},
      modifyKey: null,
      contactInfo: {},
    }
  },
  directives: {
    TransferDom
  },
  components: {
    ApplyMatterPart,
    XInput, XTextarea, Group, Cell, Popup,
    PopMatter, RNumber, PopMatterList, PopDealerList,
    PopSingleSelect, Datetime, RPicker, PopBaseinfo, DealerOtherPart
  },
  mixins: [common],
  filters: {
    numberComma,
  },
  methods: {
    // 选中的客户
    selDealer(val) {
      if(JSON.parse(val)[0].dealerCode !== this.dealerInfo.dealerCode){
        this.dealerInfo = JSON.parse(val)[0];
        this.dealerInfo.drDealerPaymentTerm = this.dealerInfo.paymentTerm;
        this.dealerInfo.daysOfAccount= this.dealerInfo.pamentDays;
        this.dealerInfo.drDealerLogisticsTerms = this.dealerInfo.dealerLogisticsTerms;
        if(this.matterParams.data && this.matterParams.data.dealerCode != null){
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
          this.matterList = [];
          this.orderList = {};
        }
        // 重新选择客户时，需要重新请求物料是否有上下线
        if(Object.values(this.orderList).length){
          for(let key in this.orderList){
            for(let item of this.orderList[key]){
              this.getQtyRange(item)
              delete item.qtyDownline
              delete item.qtyDownline
              delete item.otherField
              item.price = '';
              item.tdQty = '';
              item.taxRate = 0.16;
              item.dealerInventoryName = '';
              item.dealerInventoryCode = '';               
            }
          }
        }  
      }  
    },
    selContact(val) {
      this.contactInfo = {...val};
    },
    // TODO 显示物料修改的pop
    modifyMatter(item, index, key) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
      this.modifyKey = key;
    },
    // TODO 更新修改后的物料信息
    selConfirm(val) {
      let modMatter = JSON.parse(val);
      this.matterList.every((item, index) => {
        // 修改matterList，触发合计金额计算
        if (modMatter.transCode === item.transCode && modMatter.inventoryCode === item.inventoryCode) {
          this.$set(this.matterList, index, modMatter);
          return false
        }
        return true
      });
      this.$set(this.orderList[this.modifyKey], this.modifyIndex, modMatter);
    },
    // 选择物料，显示物料pop
    getMatter() {
      if(!this.dealerInfo.dealerCode){
        this.$vux.alert.show({
          content: '请选择客户'
        })
        return
      }
      this.showMaterielPop = !this.showMaterielPop;
    },
    checkAmt(item) {
      let {tdQty, tdAmountCopy1} = item;
      if(tdQty) {
        item.tdQty = Math.abs(toFixed(tdQty));
      }
      if(tdAmountCopy1) {
        item.tdAmountCopy1 = Math.abs(toFixed(tdAmountCopy1));
      }
    },
    // 请求数量上线,下线
    getQtyRange(item){
      return getPriceFromSalesContractAndPrice({
        matCodes: item.inventoryCode,
        dealerCode: this.dealerInfo.dealerCode
      }).then(({ data = [] }) => {
        if(data.length){
          let [priceTag = {}] = data;
          let defaultKey = ['qtyOnline', 'qtyDownline'];
          // 动态添加字段
          for(let key in priceTag) {
            if(defaultKey.includes(key)) {
              item[key] = priceTag[key];
              delete priceTag[key];
            }
            else if(!item.hasOwnProperty(key)){
              this.$set(item, key, priceTag[key]);
            }
          }
          item.otherField = {...priceTag};
        } 
      })
    },
    // TODO 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      let orderList = {};
      sels.forEach(item => {
        if(this.dealerInfo.dealerCode){
          this.getQtyRange(item);
        }
        let key = `${item.transCode}_${item.inventoryCode}`;
        let {
          tdQty = item.qtyBal,
          price = item.price,
          taxRate = this.taxRate,
          promDeliTime = '',
        } = this.numMap[key] || {};
        item.tdQty = tdQty || '';
        item.price = price || '';
        item.taxRate = taxRate;
        item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
        item.promDeliTime = promDeliTime;
        item.dateActivation = dateFormat(item.dateActivation, 'YYYY-MM-DD');
        item.executionDate = dateFormat(item.executionDate, 'YYYY-MM-DD');
        // 如果有销售合同号
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
      });
      this.numMap = {};
      this.matterList = sels;
      this.orderList = orderList;
    },
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 滑动删除
    delClick(index, sItem, key) {
      let arr = this.selItems;
      let delIndex = null;
      if(sItem.transCode){
        delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode);
      }
      else{
        delIndex = arr.findIndex(item => item.inventoryCode === sItem.inventoryCode);
      }
      
      //若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(sItem);
    },
    // TODO 判断是否展示选中图标
    showSelIcon(sItem) {
      if(sItem.transCode){
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode && item.transCode === sItem.transCode) !== -1;
      }
      else{
        return this.selItems.findIndex(item => item.inventoryCode === sItem.inventoryCode) !== -1;
      }
      
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
          let newArr = [];
          let keys = Object.keys(this.orderList);
          keys.forEach(item => {
            newArr = [...newArr, ...this.orderList[item]];
          });
          this.selItems.forEach(SItem => {
            newArr.forEach(OItem => {
              if(SItem.transCode){
                if (OItem.inventoryCode === SItem.inventoryCode && OItem.transCode === SItem.transCode) {
                  let delArr = this.orderList[OItem.transCode];
                  let delIndex = delArr.findIndex(item => item.inventoryCode === OItem.inventoryCode);
                  if (delIndex >= 0) {
                    delArr.splice(delIndex, 1);
                  }
                  if (!delArr.length) {
                    delete this.orderList[OItem.transCode];
                  }
                }
              }
              else{
                if (OItem.inventoryCode === SItem.inventoryCode) {
                  let delArr = this.orderList['noCode'];
                  let delIndex = delArr.findIndex(item => item.inventoryCode === OItem.inventoryCode);
                  if (delIndex >= 0) {
                    delArr.splice(delIndex, 1);
                  }
                  if (!delArr.length) {
                    delete this.orderList['noCode'];
                  }
                }
              }
            });
            this.matterList.forEach((item, index) => {
              if (item.inventoryCode === SItem.inventoryCode) {
                this.matterList.splice(index, 1);
                index--;
              }
            })
          });
          this.selItems = [];
          this.matterModifyClass = false;
        }
      })
    },
    // TODO 新增更多物料
    addMatter() {
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          // 存储已输入的价格
          this.numMap[`${item.transCode}_${item.inventoryCode}`] = {...item};
        }
      }
      this.showMaterielPop = !this.showMaterielPop;
    },
    // TODO 展示时间选择器
    dateSelect(key = '') {
      this.$vux.datetime.show({
        confirmText: '确定',
        cancelText: '取消',
        value: this.dealerInfo[key],
        onConfirm: (value) => {
          this.$set(this.dealerInfo, key, value)
        }
      })
    },
    // 提价订单
    submitOrder() {
      let warn = '', dataSet = [];
      for(let item of this.dealerConfig){
        if(!item.hiddenInRun && !item.allowBlank){
          if(item.fieldCode === 'dealerName_dealerDebit' && !this.dealerInfo.dealerName){
            warn = '请选择客户';
            break
          }
          else if(item.fieldCode !== 'dealerName_dealerDebit' && !this.dealerInfo[item.fieldCode]){
            warn = `${item.fieldLabel}不能为空`;
            break
          }
          
        }
      }
      if (!warn && !Object.keys(this.orderList).length) {
        warn =  '请选择物料'
      }
      if(!warn){
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            if (!item.tdQty) {
              warn = '请填写数量';
              break
            }
            if (!item.price) {
              warn = '请填写单价';
              break
            }
            if (!item.promDeliTime) {
              warn = '请选择预期交货日';
              break
            }
            let taxRate = item.taxRate || this.taxRate;
            let taxAmount = toFixed(accMul(item.assistQty, taxRate, item.noTaxPrice));
            let obj = {
              tdId: item.tdId || '',
              transMatchedCode: item.transCode,
              inventoryName_transObjCode: item.inventoryName, // 物料名称
              transObjCode: item.inventoryCode, // 物料编码
              tdProcessing: item.processing, // 加工属性
              assMeasureUnit: item.assMeasureUnit || null, // 辅助计量
              assMeasureDescription: item.assMeasureDescription || null,
              assMeasureScale: item.assMeasureScale || null, // 与单位倍数
              dealerInventoryName: item.dealerInventoryName,
              dealerInventoryCode: item.dealerInventoryCode,
              thenTotalQtyBal: item.qty,
              thenLockQty: item.stockQty,
              thenQtyBal: item.qtyBal,
              tdQty: item.tdQty, // 数量
              assistQty: item.assistQty || 0, // 辅计数量
              price: item.price, // 单价
              tdAmount: toFixed(accMul(item.price, item.assistQty)), // 价税小计
              taxRate: taxRate, // 税金
              noTaxPrice: item.noTaxPrice,
              taxAmount: taxAmount, // 税金
              noTaxAmount: accSub(item.tdAmount, item.taxAmount),
              dateActivation: item.dateActivation, // 交付开始日
              promDeliTime: item.promDeliTime || null, // 预期交货日
              executionDate: item.executionDate, // 交付截止日
              comment: item.comment || '', // 说明
            }
            dataSet.push(obj);
          }
        }
      }
      if (warn) {
        this.$vux.alert.show({
          content: warn
        })
        return
      }
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          this.$HandleLoad.show();
          let operation = saveAndStartWf; // 默认有工作流
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
            biComment: this.formData.biComment,
            formData: JSON.stringify({
              ...this.formData,
              handlerEntity: this.entity.dealerName,
              dealerDebitContactPersonName: this.contactInfo.dealerName || '',
              dealerDebitContactInformation: this.contactInfo.dealerMobilePhone || '',
              drDealerLogisticsTerms: this.dealerInfo.drDealerLogisticsTerms,
              order: {
                dealerDebit: this.dealerInfo.dealerCode,
                drDealerLabel: this.dealerInfo.dealerLabelName,
                drDealerPaymentTerm: this.dealerInfo.paymentTerm,
                daysOfAccount: this.dealerInfo.pamentDays,
                dataSet
              },
              inPut: {
                dataSet: [{
                  dealerDebit: this.dealerInfo.dealerCode,
                  drDealerLabel: this.dealerInfo.dealerLabelName,
                  tdAmountCopy1: this.dealerInfo.tdAmountCopy1,
                  advancePaymentDueDate: this.dealerInfo.advancePaymentDueDate,
                  customerOrderNumber: this.dealerInfo.customerOrderNumber,
                  orderDate: this.dealerInfo.orderDate
                }]
              },
            }),
            wfPara: JSON.stringify(wfPara)
          }
          if (this.isResubmit) { // 重新提交
            operation = saveAndCommitTask;
            submitData.biReferenceId = this.biReferenceId;
          }
          if (!this.processCode.length) { // 无工作流
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
        this.attachment = data.attachment;
        let orderList = {};
        let {formData} = data;
        let {order = {}} = formData;
        let dealer = formData.inPut.dataSet[0]
        // 客户信息展示
        this.dealerInfo = {
          ...dealer,
          dealerCode: dealer.dealerDebit,
          dealerLabelName: dealer.drDealerLabel,
          dealerName: dealer.dealerName_dealerDebit,
          province: dealer.province_dealerDebit,
          city: dealer.city_dealerDebit,
          county: dealer.county_dealerDebit,
          address: dealer.address_dealerDebit,
          drDealerPaymentTerm: formData.order.drDealerPaymentTerm, // 结算方式
          drDealerLogisticsTerms: formData.drDealerLogisticsTerms, //物流条件
          daysOfAccount: formData.order.daysOfAccount,
        };
        // let [dealerInfo = {}] = order.dataSet;
        order.dataSet.map(item => {
          item = {
            ...item,
            inventoryPic: item.inventoryPic_transObjCode ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_transObjCode}&width=400&height=400` : this.getDefaultImg(),
            inventoryName: item.inventoryName_transObjCode,
            inventoryCode: item.inventoryCode_transObjCode,
            specification: item.specification_transObjCode,
            processing: item.tdProcessing || '商品',
            measureUnit: item.measureUnit_transObjCode,
            clientInventoryName: item.dealerInventoryName,
            clientInventoryCode: item.dealerInventoryCode,
            qty: item.thenTotalQtyBal,
            stockQty: item.thenLockQty,
            qtyBal: item.thenQtyBal,
            transCode: item.transMatchedCode,
            invSubUnitMulti: item.assMeasureScale,
          };
          this.getQtyRange(item)
          this.matterList.push(item);
          if(item.transCode){
            if (!orderList[item.transCode]) {
              orderList[item.transCode] = [];
            }
            orderList[item.transCode].push(item);
          }
          else{
            if(!orderList.noCode) {
              orderList.noCode = [];
            }
            orderList.noCode.push(item);
          }
        });
        console.log(orderList);
        this.handlerDefault = {
          handler: formData.handler,
          handlerName: formData.handlerName,
          handlerUnit: formData.handlerUnit,
          handlerUnitName: formData.handlerUnitName,
          handlerRole: formData.handlerRole,
          handlerRoleName: formData.handlerRoleName,
        };
        this.orderList = orderList;
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
        // 订单信息
        this.contactInfo = {
          dealerName: formData.dealerDebitContactPersonName, //联系人
          dealerMobilePhone: formData.dealerDebitContactInformation,//电话
        };
        // 物料列表请求参数
        if(this.matterParams.data && this.matterParams.data.dealerCode) {
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
        }
        this.$loading.hide();
      })
    },
    // TODO 是否保存草稿
    hasDraftData() {
      if (!Object.values(this.orderList).length) {
        return false
      }
      return {
        [DRAFT_KEY]: {
          dealerInfo: this.dealerInfo,
          formData: this.formData,
          contactInfo: this.contactInfo,
          orderList: this.orderList,
        }
      };
    },
  },
  created() {
    let data = sessionStorage.getItem(DRAFT_KEY);
    if (data) {
      let draft = JSON.parse(data);
      this.dealerInfo = draft.dealerInfo;
      this.formData = draft.formData;
      this.contactInfo = draft.contactInfo;
      this.orderList = draft.orderList;
      for (let items of Object.values(this.orderList)) {
        for (let item of items) {
          this.matterList.push(item)
        }
      }
      // 物料列表请求参数
      if(this.matterParams.data && this.matterParams.data.dealerCode){
        this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
      }
      sessionStorage.removeItem(DRAFT_KEY);
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizApply';
  .no_margin {
    margin-top: 0;
  }

</style>
