<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <!-- 费用列表 -->
      <div class="form_content">
        <div class="main_content">
          <div :class="{'vux-1px-t': cIndex > 0}" v-for="(cItem, cIndex) in fundConfig" :key="cIndex">
            <template v-if="cItem.fieldCode === 'tdAmount'">
              <div class="each_info">
                <label>{{cItem.fieldLabel}}</label>
                <span class="field_value">￥{{dealerInfo[cItem.fieldCode] | numberComma}}</span>
              </div>
            </template>
            <template v-else-if="cItem.xtype === 'r2Numberfield' || cItem.xtype === 'r2Permilfield'">
              <div class="each_info">
                <label>{{cItem.fieldLabel}}</label>
                <span class="field_value">{{dealerInfo[cItem.fieldCode] | numberComma}}</span>
              </div>
            </template>
            <template v-else>
              <div class="each_info">
                <label>{{cItem.fieldLabel}}</label>
                <span class="field_value">{{dealerInfo[cItem.fieldCode] || "无"}}</span>
              </div>
            </template>
          </div>
        </div>
      </div>
      <!-- <div class="form_content">
        <div class="form_title">
          <span class="iconfont icon-mingxi1"></span>
          <span>往来信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='往来名称' :cellContent="dealerInfo.dealerName_dealerCodeCredit"></form-cell>
          <form-cell cellTitle='往来编码' :cellContent="dealerInfo.dealerCodeCredit"></form-cell>
          <form-cell cellTitle='往来关系标签' :cellContent="dealerInfo.crDealerLabel"></form-cell>
          <form-cell cellTitle='类型' :cellContent="dealerInfo.applicationType"></form-cell>
          <form-cell cellTitle='信用额度' :cellContent="dealerInfo.tdCreditLine | toFixed | numberComma(3)"
                     showSymbol></form-cell>
          <form-cell cellTitle='往来余额' :cellContent="dealerInfo.thenAmntBalCopy1 | toFixed | numberComma(3)"
                     showSymbol></form-cell>
          <form-cell cellTitle='申请金额' :cellContent="dealerInfo.thenTotalAmntBal | toFixed | numberComma(3)"
                     showSymbol></form-cell>
          <x-input type="number" title="本次支付" :value="dealerInfo.tdAmountCopy1" text-align="right"
                   @on-focus="getFocus" @on-blur="calcPayment(dealerInfo)" v-model.number="dealerInfo.tdAmountCopy1"
                   v-if="isAccount">
            <span class="required" slot="title">本次支付</span>
          </x-input>
          <form-cell cellTitle='本次支付' :cellContent="dealerInfo.tdAmountCopy1 | toFixed | numberComma(3)"
                     showSymbol v-else></form-cell>
          <form-cell cellTitle='本次支付后余额' :cellContent="dealerInfo.differenceAmount | toFixed | numberComma(3)"
                     v-if="!isApproval" showSymbol></form-cell>
        </div>
      </div> -->
      <!-- 资金账户可编辑 -->
      <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="0" :params="cashParams"
                      required v-show="otherConfig.length &&  !isEditAdmout">
        <template slot="other">
          <div class='each_property vux-1px-t'>
            <label>本次支付</label>
            <input type='number' v-model.number="cashInfo.tdAmount" placeholder="请输入" class='property_val' @blur="checkAmt"/>
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
      <!-- <div class="form_content" style="margin-top:0.1rem;"
           v-else-if="!isApproval && !isAccount">
        <div class="form_title">
          <span class="iconfont icon-baoxiao"></span>
          <span class="title">资金账户信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='资金账户' :cellContent="cashInfo.fundName_cashInCode"></form-cell>
          <form-cell cellTitle='资金编码' :cellContent="cashInfo.cashInCode"></form-cell>
          <form-cell cellTitle='资金账户类型' :cellContent="cashInfo.cashType_cashInCode"></form-cell>
          <form-cell cellTitle='账户余额' :cellContent="cashInfo.thenAmntBal | toFixed | numberComma(3)"
                     showSymbol></form-cell>
          <form-cell cellTitle='本次支付' :cellContent="cashInfo.tdAmount | toFixed | numberComma(3)"
                     showSymbol></form-cell>
        </div>
      </div> -->
       <!-- 备注 -->
      <div class="comment">
        <form-cell cellTitle='备注' :cellContent="orderInfo.biComment"></form-cell>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle"
                   :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions" :agree-handler="agreeHandler"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {dateFormat, XInput} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'mixins/detailCommon'
  // 组件引入
  // 组件 引入
  import RAction from 'components/public/RAction'
  import workFlow from 'components/public/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  
  import PopCashList from 'components/Popup/finance/PopCashList'
  //公共方法引入
  import {accAdd} from 'plugins/calc/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
        contactInfo: {}, // 客户、付款方式、物流条款的值
        dealerInfo: {},
        cashInfo: {},
      }
    },
    computed: {
      // 是否为部门负责人、财务总监
      isInCharge(){
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'd7ef0729-4a55-46fe-a750-e5298042c5bc';
      },
      // 是否为采购总监、财务经理/总监、总经理
      isApproval() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '65afdac2-db7d-42d1-a059-7fdb98892134';
      },
      // 是否为出纳
      isCashier() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '14128204-e4ee-4688-98c7-9d3c03e7a3ad';
      },
      // 是否为会计
      isAccount() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'b8490da9-513f-408b-8974-83998188bf6a';
      },
      cashParams() {
        return {
          transCode: this.transCode
        }
      },
      // 判断纸巾账户的支付金额是否可编辑
      isEditAdmout() {
        let isEdit = false;
        this.otherConfig.forEach(item => {
          if (item.fieldCode === "tdAmount"){
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
      workFlow, RAction, contactPart, PopCashList, XInput,
    },
    methods: {
      checkAmt() {
        let { tdAmount } = this.cashInfo;
        if (tdAmount) this.cashInfo.tdAmount =  Math.abs(toFixed(tdAmount));
      },
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(data => {
          // http200时提示报错信息
          if (data.success === false) {
            this.$vux.alert.show({
              content: '抱歉，数据有误，暂无法查看',
              onHide: () => {
                this.$router.back();
              }
            });
            return;
          }
          this.attachment = data.attachment;
          this.orderInfo = data.formData;
          this.dealerInfo = data.formData.order.dataSet[0];
          this.cashInfo = data.formData.outPut.dataSet[0];
          this.workFlowInfoHandler();
        })
      },
      // 同意的处理
      agreeHandler() {
        if (this.isApproval || this.isCashier || this.isAccount) {
          if (this.isCashier && !this.cashInfo.fundCode) {
            this.$vux.alert.show({
              content: '请选择资金账户',
            });
            return true
          }
          let orderInfo = this.orderInfo;
          let dealerInfo = this.dealerInfo;
          let cashInfo = this.cashInfo;
          let formData = {
            ...orderInfo,
            order: {
              dataSet: [{
                tdIdCopy1: dealerInfo.tdIdCopy1,
                dealerCodeCredit: dealerInfo.dealerCodeCredit,
                crDealerLabel: dealerInfo.crDealerLabel,
                applicationType: dealerInfo.applicationType,
                tdCreditLine: dealerInfo.tdCreditLine,
                thenAmntBalCopy1: dealerInfo.thenAmntBalCopy1,
                thenTotalAmntBal: dealerInfo.thenTotalAmntBal,
                tdAmountCopy1: dealerInfo.tdAmountCopy1,
                differenceAmount: dealerInfo.differenceAmount,
                expCause: dealerInfo.expCause,
              }],
            },
            outPut: {
              dataSet: [{
                cashInCode: cashInfo.fundCode || cashInfo.cashInCode,
                cashType_cashInCode: cashInfo.fundType || cashInfo.cashType_cashInCode,
                thenAmntBal: cashInfo.thenAmntBal,
                tdAmount: cashInfo.tdAmount,
                tdId: cashInfo.tdId,
              }],
            },
          };
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
      // 计算支付后余额
      calcPayment(item) {
        let {thenAmntBalCopy1 = 0, tdAmountCopy1 = 0} = item;
        if (!tdAmountCopy1) {
          tdAmountCopy1 = 0;
        }
        tdAmountCopy1 = toFixed(tdAmountCopy1)
        item.tdAmountCopy1 = tdAmountCopy1;
        item.differenceAmount = toFixed(accAdd(thenAmntBalCopy1, tdAmountCopy1));
        // this.cashInfo.tdAmount = tdAmountCopy1;
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';

  .each_property {
    padding: .18rem 0;
    display: flex;
    justify-content: space-between;
    line-height: .14rem;
    input{  
      border: none;
      outline: none;
      font-size: .14rem;
    }
    label{
      color: #696969;
    }
    .property_val {
      text-align: right;
    }
  }
</style>
