<template>
  <div class="detail_wrapper dzyhpcgysyzf-detail-container">
    <div class="basicPart" v-if='orderInfo && orderInfo.inPut'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <contact-part :contact-info="dealerInfo" :configs="dealerConfig"></contact-part>
      <!-- 物料列表 -->
      <matter-list :order-list='orderList' :order-title="orderTitle"></matter-list>
      <!-- 资金账户可编辑-->
      <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="3" :params="cashParams"
                     v-show="otherConfig.length &&  !isEditAdmout" required>
        <template slot="other">
          <div class='each_property vux-1px-t'>
            <label>支付金额：</label>
            <span class='property_val'>￥{{cashInfo.tdAmountCopy1 | numberComma(3)}}</span>
          </div>
        </template>
      </pop-cash-list>
      <!-- 资金账户不可编辑 -->
      <div class="form_content" v-show="otherConfig.length &&  isEditAdmout">
        <div class="main_content">
          <div :class="{'vux-1px-t': cIndex > 0}" v-for="(cItem, cIndex) in otherConfig" :key="cIndex">
            <template v-if="cItem.xtype === 'r2Permilfield'">
              <div class="each_info">
                <label>{{cItem.fieldLabel}}</label>
                <span class="field_value">￥{{cashInfo[cItem.fieldCode] | numberComma}}</span>
              </div>
            </template>
            <template v-else>
              <div class="each_info">
                <label>{{cItem.fieldLabel}}</label>
                <span class="field_value">{{cashInfo[cItem.fieldCode] || "无"}}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- 备注 -->
      <other-part :other-info="orderInfo" :amt="noTaxAmount" :tax-amt="taxAmount" :count="count"
                  :attachment="attachment"></other-part>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions" :agree-handler="agreeHandler"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'mixins/detailCommon'
  // 组件 引入
  import RAction from 'components/public/RAction'
  import workFlow from 'components/public/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  import MatterList from 'components/detail/commonPart/MatterList'
  import MatterItem from 'components/detail/commonPart/MatterItem'
  import FormCell from 'components/detail/commonPart/form-part/FormCell'
  import PopCashList from 'components/Popup/finance/PopCashList'
  //公共方法引入
  import {accAdd, accMul} from 'plugins/calc/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,           // 金额合计
        comment: '',        // 审批备注
        orderInfo: {},      // 表单内容
        formViewUniqueId: 'e76a8c6f-05cc-45ee-ba93-299fe6751856',
        orderList: {}, // 物料列表
        cashInfo: {},
        costList: [],
      }
    },
    computed: {
      // 合计金额
      noTaxAmount() {
        let total = 0;
        this.orderInfo.inPut.dataSet.forEach(item => {
          total = accAdd(total, item.noTaxAmount);
        });
        return total;
      },
      // 税金
      taxAmount() {
        let total = 0;
        this.orderInfo.inPut.dataSet.forEach(item => {
          total = accAdd(total, item.taxAmount);
        });
        return total;
      },
      // 是否为出纳
      isCashier() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'e185e706-5b21-4467-bbe9-cff1856873a7';
      },
      // 请求资金账户的参数
      cashParams() {
        return {
          transCode: this.transCode,
          fundType: '银行存款'
        }
      },
      // 判断纸巾账户的支付金额是否可编辑
      isEditAdmout() {
        let isEdit = false;
        this.otherConfig.forEach(item => {
          if (item.fieldCode === "fundName_cashOutCode"){
           isEdit = item.readOnly;
          }
        })
        if (!isEdit){
          this.cashInfo = {
            ...this.cashInfo,
            fundCode: this.cashInfo.fundCode || this.cashInfo.cashInCode,
            fundType: this.cashInfo.fundType || this.cashInfo.cashType_cashInCode,
            fundName: this.cashInfo.fundName || this.cashInfo.fundName_cashInCode,
            thenAmntBal: this.cashInfo.thenAmntBal || this.cashInfo.thenAmntBalCopy1,
          }
        }
        return isEdit
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, contactPart, MatterList, MatterItem, FormCell, PopCashList
    },
    methods: {
      checkAmt(item, key, val) {
        item[key] = Math.abs(toFixed(val)); 
      },
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(({success = true, formData = {}, attachment = []}) => {
          // http200时提示报错信息
          if (success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          let orderList = {};
          let {inPut = {}, outPut = {}} = formData;
          this.attachment = attachment;
          // 获取合计
          let {dataSet} = inPut;
          let {dataSet: outPutDataSet = []} = outPut;
          let [cashInfo = {}] = outPutDataSet;
          for (let item of dataSet) {
            item.noTaxAmount = accMul(item.price, item.tdQty);
            item.taxAmount = accMul(item.noTaxAmount, item.taxRate);
            item.tdAmount = toFixed(accAdd(item.noTaxAmount, item.taxAmount));
            this.count = accAdd(this.count, item.tdAmount)
            item.inventoryPic = item.inventoryPic_outPutMatCode
              ? `/H_roleplay-si/ds/download?url=${item.inventoryPic_outPutMatCode}&width=400&height=400`
              : this.getDefaultImg();
            if (!orderList[item.transMatchedCode]) {
              orderList[item.transMatchedCode] = [];
            }
            orderList[item.transMatchedCode].push(item);
          }
          this.orderList = orderList;
          this.dealerInfo = {
            creatorName: formData.dealerCreditContactPersonName, // 客户名
            dealerName: inPut.dealerName_dealerCodeCredit, // 公司名
            dealerMobilePhone: formData.dealerCreditContactInformation, // 手机
            dealerContactPersonName: formData.dealerCreditContactPersonName, // 联系人
            dealerCode: inPut.dealerCode_dealerCodeCredit, // 客户编码
            dealerLabelName: inPut.crDealerLabel, // 关系标签
            province: inPut.province_dealerCodeCredit, // 省份
            city: inPut.city_dealerCodeCredit, // 城市
            county: inPut.county_dealerCodeCredit, // 地区
            address: inPut.address_dealerCodeCredit, // 详细地址
            payment: inPut.crDealerPaymentTerm,//结算方式
            pamentDays: inPut.daysOfAccount,
            accountExpirationDate: inPut.accountExpirationDate,
          };
          this.cashInfo = cashInfo;
          this.orderInfo = {
            ...formData,
            ...inPut,
          };
          this.workFlowInfoHandler();
        })
      },
      // 同意的处理
      agreeHandler() {
        if (this.isCashier) {
          if (this.isCashier && !this.cashInfo.fundCode) {
            this.$vux.alert.show({
              content: '请选择资金账户',
            });
            return true
          }
          let orderInfo = this.orderInfo;
          let dataSet = []
          for (let items of Object.values(this.orderList)) {
            for (let item of items) {
              dataSet.push({
                tdId: item.tdId,
                transMatchedCode: item.transMatchedCode,
                transObjCode: item.transObjCode,
                tdProcessing: item.tdProcessing,
                assMeasureUnit: item.assMeasureUnit,
                expSubject: item.expSubject,
                thenTotalQtyBal: item.thenTotalQtyBal,
                thenLockQty: item.thenLockQty,
                thenQtyBal: item.thenQtyBal,
                tdQty: item.tdQty,
                assMeasureScale: item.assMeasureScale,
                assistQty: item.assistQty,
                price: item.price,
                taxRate: item.taxRate,
                taxAmount: item.taxAmount,
                tdAmount: item.tdAmount,
                processingStartDate: item.processingStartDate,
                keepingDays_transObjCode: item.keepingDays_transObjCode,
                productionDate: item.productionDate,
                validUntil: item.validUntil,
                comment: item.comment
              })
            }
          }
          let formData = {
            ...orderInfo,
            inPut: {
              dealerCodeCredit: this.orderInfo.inPut.dealerCodeCredit,
              crDealerLabel: this.orderInfo.inPut.crDealerLabel,
              crDealerPaymentTerm: this.orderInfo.inPut.crDealerPaymentTerm,
              daysOfAccount: this.orderInfo.inPut.daysOfAccount,
              accountExpirationDate: this.orderInfo.inPut.accountExpirationDate,
              containerCode: this.orderInfo.inPut.containerCode,
              dataSet,
            },
          };
          if (this.isCashier) {
            let cashInfo = this.cashInfo;
            formData.outPut.dataSet = [{
              fundName_cashInCode: cashInfo.fundName,
              cashOutCode: cashInfo.fundCode,
              cashType_cashOutCode: cashInfo.fundType,
              thenAmntBalCopy1: cashInfo.amntBal,
              tdAmountCopy1: cashInfo.tdAmountCopy1,
              tdIdCopy1: cashInfo.tdIdCopy1,
            }]
          }
          console.log(formData);
          this.saveData(formData);
          return true
        }
        return false
      },
      // 选中资金
      selCash(item) {
        this.cashInfo = {
          ...this.cashInfo,
          ...item,
        };
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
  .each_property {
    padding: .18rem 0;
    display: flex;
    /* justify-content: space-between; */
    line-height: .14rem;
    color: #696969;
    font-size: .14rem;
    input{  
      border: none;
      outline: none;
      font-size: .14rem;
    }
    label{
      color: #696969;
    }
  }
</style>

