<template>
  <div class="pages">
    <div class="basicPart" ref='fill'>
      <div class='fill_wrapper'>
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList"
                      :status-data="currentStage" v-model="formData.biProcessStatus">
        </pop-baseinfo>
        <!-- 用户地址和基本信息-->
        <pop-dealer-list @sel-dealer="selDealer" @sel-contact="selContact" :defaultValue="dealerInfo" 
                         :dealer-params="dealerParams" :defaultContact="contactInfo"></pop-dealer-list>
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
          <x-textarea v-model="formData.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
      </div>
    </div>
    <!-- 底部按钮 -->
    <op-button :is-modify="matterModifyClass" :hide="btnIsHide" :td-amount="tdAmount" :tax-amount="taxAmount"
               :all-check="selItems.length === matterList.length" @on-submit="submitOrder" @on-check-all="checkAll"
               @on-delete="deleteCheckd"></op-button>
  </div>
</template>

<script>
// vux组件引入
import { dateFormat, numberComma, XTextarea } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { saveAndStartWf, saveAndCommitTask, submitAndCalc, getPriceFromSalesContractAndPrice} from 'service/commonService'
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
import { accMul, accSub  } from '@/home/pages/maps/decimalsAdd'
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
        }
      ],
      showMatterPop: false,
      showMaterielPop: false, // 是否显示物料的popup
      numMap: {}, // 用于记录订单物料的数量和价格
      formData: {},
      orderList: {},
      dealerInfo: {},
      modifyKey: null,
      contactInfo: {},
    }
  },
  computed: {
    // 基于 orderList 此处重组 matterList 数据
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
    orderList: {
      handler(list) {
        for(let arr of Object.values(list)) {
          for(let item of arr) {
            /** 
             *  此处设置监听 是为了根据数量 实时显示或隐藏 *客户物料名称/编码*
             * 
             *  @tdQty 数量
             *  @otherField 存在价格区间
             *  @qtyOnline  数量上限
             *  @qtyDownline  数量下限
             *  @dealerInventoryCode 客户物料编码
             *  @dealerInventoryName 客户物料名称
             * 
             */ 
            let { tdQty, otherField, qtyOnline, qtyDownline, 
                  dealerInventoryCode, dealerInventoryName } = item;
            if(otherField) {
              if(tdQty > qtyOnline || tdQty < qtyDownline) {
                this.tdAmount = 0;
                item.dealerInventoryCode = item.dealerInventoryName = '';
                item.price = '请重新输入单价';
              }
              else {
                item.price = otherField.price;
                item.dealerInventoryCode = otherField.dealerInventoryCode;
                item.dealerInventoryName = otherField.dealerInventoryName;
              }
            }
            
          }
        }
      },
      deep: true
    }
  },
  components: {
    RNumber, XTextarea, OpButton,
    PopBaseinfo, PopDealerList, DealerOtherPart, ApplyMatterPart
  },
  mixins: [common],
  filters: { numberComma },
  methods: {
    // 选中的客户
    selDealer(val) {
      let [chosenDealer = {}] = JSON.parse(val);
      if(chosenDealer.dealerCode !== this.dealerInfo.dealerCode){

        // 为了提交时校验字段 此处重组部分数据
        chosenDealer.daysOfAccount= chosenDealer.pamentDays;
        chosenDealer.drDealerPaymentTerm = chosenDealer.paymentTerm;
        chosenDealer.dealerName_dealerDebit = chosenDealer.dealerName;
        chosenDealer.drDealerLogisticsTerms = chosenDealer.dealerLogisticsTerms;

        // 选中赋值
        this.dealerInfo = chosenDealer;

        // 根据客户 重新匹配<物料列表>的请求参数
        if(this.matterParams.data && this.matterParams.data.dealerCode != null){
          this.matterParams.data.dealerCode = this.dealerInfo.dealerCode;
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
    // 选择联系人
    selContact(val) {
      this.contactInfo = {...val};
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
    // 请求数量上线,下线
    getQtyRange(item){
      return getPriceFromSalesContractAndPrice({
        matCodes: item.inventoryCode,
        dealerCode: this.dealerInfo.dealerCode
      }).then(({ data = [] }) => {
          let [priceTag = {}] = data;
          // 为了在<MatterPop>组件中提供必要的提示 <数量上限、下限为默认需要字段> 
          let defaultKey = ['qtyOnline', 'qtyDownline'];
          // 动态添加字段
          for(let key in priceTag) {
            if(defaultKey.includes(key)) {
              item[key] = priceTag[key];
              delete priceTag[key];
            }
          }
          item.otherField = {...priceTag};
      })
    },
    // 选中物料项
    selMatter(val) {
      let sels = JSON.parse(val);
      let orderList = JSON.parse(JSON.stringify(this.orderList));
      sels.forEach(item => {
        let orderListKey = item.transCode ? item.transCode : 'noCode';
        item.taxRate = this.taxRate;
        item.tdQty = item.qtyBal || '';
        item.assMeasureUnit = item.assMeasureUnit || item.invSubUnitName || null; // 辅助计量
        item.assMeasureScale = item.assMeasureScale || item.invSubUnitMulti || null; // 与单位倍数
        item.assMeasureDescription =  item.assMeasureDescription || item.invSubUnitComment || null; // 辅助计量说明
        item.promDeliTime = '';
        item.dateActivation = dateFormat(item.dateActivation, 'YYYY-MM-DD');
        item.executionDate = dateFormat(item.executionDate, 'YYYY-MM-DD');
        // 此处请求 <数量上限、下限>
        if(this.dealerInfo.dealerCode){
          this.getQtyRange(item);
        }
        // 如果有销售合同号
        if(item.transCode){
          if (!orderList[orderListKey]) {
            orderList[orderListKey] = [];
          }
          orderList[orderListKey].push(item);
        }
        else {
          if(!orderList['noCode']) {
            orderList['noCode'] = []
          }
          orderList['noCode'].push(item);

        }
      });
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
    // 选择要删除的物料
    delClick(sItem, index, key) {
      let arr = this.selItems;
      let delIndex = arr.findIndex(item => item === index);
      //若存在重复的 则清除
      if (delIndex !== -1) {
        arr.splice(delIndex, 1);
        return;
      }
      arr.push(index);
    },
    // 判断是否展示选中图标
    showSelIcon(sItem, index) {
      return this.selItems.includes(index);
    },
    // 全选
    checkAll() {
      if (this.selItems.length === this.matterList.length) {
        this.selItems = [];
        return
      }
      this.selItems = this.matterList.map((item, index) => index);
    },
    // 删除选中的
    deleteCheckd() {
      this.$vux.confirm.show({
        content: '确认删除?',
        // 确定回调
        onConfirm: () => {
          let orderList = {};
          let selItems = this.selItems;
          // 没被删除的
          let remainder = this.matterList.filter((item, index) => !selItems.includes(index)); 
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
    // 新增更多物料
    addMatter() {
      this.showMaterielPop = !this.showMaterielPop;
    },
    // 展示时间选择器
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
      /** 
       * @warn    提示文字
       * @dateSet   提交数据
       * 
       * @dealerConfig  <往来部分> 配置
       * @dealerInfo  <往来部分> 信息
       * 
       */ 
      
      let warn = '', dataSet = [], 
          isSubmitOk = this.isSubmitOk,
          dealerInfo = this.dealerInfo, 
          dealerConfig = this.dealerConfig;
      
      // 校验 <往来部分> 必填字段
      warn = this.verifyData(dealerConfig, dealerInfo);

      // 校验 <物料部分> 必填字段 同时动态组装dateSet
      if(!warn) {
        // 校验 是否已选择 <物料部分>
        let [ matterPart = {} ] = this.submitMatterField;
        if(!Object.keys(this.orderList).length) warn = `请选择${matterPart.text}`;

        // 动态组装 dataSet
        for (let items of Object.values(this.orderList)) {
          for (let item of items) {
            let oItem = {};
            for(let sItem of this.submitMatterField){
              let val = item[sItem.fieldCode] || item[sItem.displayField] || item[sItem.showFieldCode];
              if(!sItem.hidden && !sItem.allowBlank && !val){
                warn = `${sItem.text}不为空`
                break;
              }
              oItem[sItem.fieldCode] = val !== null ? val : null;
            }
            dataSet.push(oItem);
          }
        }
      }

      // 弹窗提醒
      if(warn) {
        this.$vux.alert.show({
          content: warn,
        });
        return;
      }
      
      // 准备提交
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
                drDealerPaymentTerm: this.dealerInfo.drDealerPaymentTerm,
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
        order.dataSet.map(item => {
          let orderListKey = item.transCode ? item.transCode : 'noCode';
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
          this.getQtyRange(item);
          if (!orderList[orderListKey]) {
            orderList[orderListKey] = [];
          }
          orderList[orderListKey].push(item);
        });
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
    // 是否保存草稿
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
