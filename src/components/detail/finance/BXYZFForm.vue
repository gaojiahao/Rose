<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_content">
        <div class="form_title">
          <span class="iconfont icon-baoxiao"></span>
          <span class="title">费用信息</span>
        </div>
        <div class="main_content" v-for="(item, index) in costList" :key="index">
          <form-cell cellTitle='费用名称' :cellContent="item.costName_expCode"></form-cell>
          <form-cell cellTitle='费用科目' :cellContent="item.expSubject"></form-cell>
          <form-cell cellTitle='费用类型' :cellContent="item.costType_expCode"></form-cell>
          <form-cell cellTitle='申请金额' showSymbol
                     :cellContent="item.tdAmount | toFixed | numberComma(3)"></form-cell>
          <x-input type="number" title="可抵扣税金" :value="item.taxAmount" text-align="right" @on-focus="getFocus"
                   @on-blur="calcTax(item)" v-model.number="item.taxAmount" v-if="isAccountingReview"></x-input>
          <form-cell cellTitle='可抵扣税金' showSymbol
                     :cellContent="item.taxAmount | toFixed | numberComma(3)" v-else></form-cell>
          <form-cell cellTitle='抵扣后金额' showSymbol
                     :cellContent="item.noTaxAmount | toFixed | numberComma(3)"></form-cell>
        </div>
      </div>
      <div class="form_content" style="margin-top:0.1rem;">
        <div class="form_title">
          <span class="iconfont icon-mingxi1"></span>
          <span>往来信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='往来名称' :cellContent="dealerInfo.dealerName_dealerCodeCredit"></form-cell>
          <!-- <form-cell cellTitle='往来编码' :cellContent="dealerInfo.dealerCodeCredit" ></form-cell> -->
          <form-cell cellTitle='往来关系标签' :cellContent="dealerInfo.crDealerLabel"></form-cell>
          <form-cell cellTitle='信用额度' showSymbol
                     :cellContent="dealerInfo.tdCreditLine | toFixed | numberComma(3)"></form-cell>
          <form-cell cellTitle='往来余额' showSymbol
                     :cellContent="dealerInfo.thenAmntBal | toFixed | numberComma(3)"></form-cell>
          <form-cell cellTitle='本次贷方增加' showSymbol
                     :cellContent="dealerInfo.thenAlreadyAmnt | toFixed | numberComma(3)"></form-cell>
          <x-input type="number" title="本次支付" :value="dealerInfo.thenTotalAmntBal" text-align="right"
                   @on-focus="getFocus" @on-blur="calcPayment(dealerInfo)" v-model.number="dealerInfo.thenTotalAmntBal"
                   v-if="isAccountingReview"></x-input>
          <form-cell cellTitle='本次支付' showSymbol
                     :cellContent="dealerInfo.thenTotalAmntBal | toFixed | numberComma(3)" v-else></form-cell>
          <form-cell cellTitle='本次报销与支付后余额' showSymbol
                     :cellContent="dealerInfo.differenceAmount | toFixed | numberComma(3)"></form-cell>
        </div>
      </div>
      <!-- 资金 -->
      <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="4" :params="cashParams"
                     v-if="isCashier" required>
        <template slot="other">
          <form-cell cellTitle='支付金额' showSymbol
                     :cellContent="cashInfo.tdAmountCopy1 | toFixed | numberComma(3)"></form-cell>
        </template>
      </pop-cash-list>
      <div class="form_content" style="margin-top:0.1rem;" v-else-if="!isCashier && !isAccountingReview">
        <div class="form_title">
          <span class="iconfont icon-baoxiao"></span>
          <span class="title">资金账户信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='资金账户' :cellContent="cashInfo.fundName_cashInCode"></form-cell>
          <!-- <form-cell cellTitle='资金编码' :cellContent="cashInfo.cashInCode" ></form-cell> -->
          <form-cell cellTitle='资金账户类型' :cellContent="cashInfo.cashType_cashInCode"></form-cell>
          <form-cell cellTitle='账户余额' showSymbol
                     :cellContent="cashInfo.thenAmntBalCopy1 | toFixed | numberComma(3)"></form-cell>
          <form-cell cellTitle='支付金额' showSymbol
                     :cellContent="cashInfo.tdAmountCopy1 | toFixed | numberComma(3)"></form-cell>
        </div>
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
  import detailCommon from 'components/mixins/detailCommon'
  // 组件引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  import PopCashList from 'components/Popup/finance/PopCashList'
  //公共方法引入
  import {accAdd, accSub} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
        dealerInfo: {},
        cashInfo: {},
        costList: [],
      }
    },
    computed: {
      // TODO 是否为采购总监
      isApproval(){
        let {nodeName = '',viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '7d18cfc2-475f-44c5-ae12-a723d6234253';
      },
      // TODO 是否为会计复核
      isAccountingReview() {
        let {nodeName = ''} = this.currentWL;
        return this.isMyTask && nodeName === '会计复核';
      },
      // TODO 是否为出纳
      isCashier() {
        let {nodeName = ''} = this.currentWL;
        return this.isMyTask && nodeName === '出纳支付';
      },
      cashParams() {
        return {
          transCode: this.transCode
        }
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, contactPart, XInput, PopCashList
    },
    methods: {
      // 获取详情
      getOrderList(transCode = '') {
        return getSOList({
          formViewUniqueId: this.formViewUniqueId,
          transCode
        }).then(data => {
          let {success, formData, attachment} = data;
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
          let {dataSet = []} = formData.order;
          this.attachment = attachment;
          this.orderInfo = formData;
          this.dealerInfo = formData.inPut.dataSet[0];
          this.cashInfo = formData.outPut.dataSet[0];
          this.costList = dataSet;

          // 当前审批人为会计时，自动赋值本次支付金额
          if (this.isAccountingReview) {
            let {thenAmntBal = 0, thenAlreadyAmnt = 0} = this.dealerInfo;
            this.dealerInfo.thenTotalAmntBal = thenAlreadyAmnt;
            // 往来余额 - 本次贷方增加 + 本次支付
            this.dealerInfo.differenceAmount = thenAmntBal;
          }

          this.workFlowInfoHandler();
        })
      },
      // TODO 同意的处理
      agreeHandler() {
        if (this.isAccountingReview || this.isCashier) {
          if (this.isCashier && !this.cashInfo.fundCode) {
            this.$vux.alert.show({
              content: '请选择资金账户',
            });
            return
          }
          let orderInfo = this.orderInfo;
          let dataSet = this.costList.map(item => {
            return {
              tdId: item.tdId,
              expCode: item.expCode,
              expSubject: item.expSubject,
              costType_expCode: item.costType_expCode,
              tdAmount: item.tdAmount,
              expCause: item.expCause,
              taxAmount: item.taxAmount,
              noTaxAmount: item.noTaxAmount,
            };
          });
          let formData = {
            ...orderInfo,
            order: {
              departmentName: orderInfo.order.departmentName,
              dataSet,
            },
          };
          if (this.isCashier) {
            let cashInfo = this.cashInfo;
            formData.outPut = {
              dataSet: [{
                fundName_cashInCode: cashInfo.fundName,
                cashInCode: cashInfo.fundCode,
                cashType_cashInCode: cashInfo.fundType,
                thenAmntBalCopy1: cashInfo.thenAmntBal,
                tdAmountCopy1: cashInfo.tdAmountCopy1,
                tdIdCopy1: cashInfo.tdIdCopy1,
              }],
            }
          }

          this.saveData(formData);
          return true
        }
        return false
      },
      // TODO 计算抵扣后金额
      calcTax(item) {
        let {taxAmount = 0, noTaxAmount = 0} = item;
        if (!taxAmount) {
          taxAmount = 0;
          item.taxAmount = 0;
        }
        item.noTaxAmount = accSub(noTaxAmount, taxAmount);
      },
      // TODO 计算本次报销与支付后余额
      calcPayment(item) {
        let {thenAmntBal = 0, thenAlreadyAmnt = 0, thenTotalAmntBal = 0} = item;
        if (!thenTotalAmntBal) {
          thenTotalAmntBal = 0;
        }
        thenTotalAmntBal = toFixed(thenTotalAmntBal);
        item.thenTotalAmntBal = thenTotalAmntBal;
        item.tdAmount = toFixed(accSub(thenAlreadyAmnt, thenTotalAmntBal));
        item.differenceAmount = toFixed(accAdd(accSub(thenAmntBal, thenAlreadyAmnt), thenTotalAmntBal));
        this.cashInfo.tdAmountCopy1 = thenTotalAmntBal;
      },
      // TODO 选中资金
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
  @import './../../scss/bizDetail';

  .detail_wrapper {
    .pop_dealer_list {
      width: 100%;
    }
  }

  .form_content {
    .main_content {
      /deep/ .weui-cell {
        padding: .08rem 0;
        &:before {
          left: 0;
        }
      }
      /deep/ .weui-label {
        color: #757575;
        font-size: .14rem;
      }
    }
  }

  .form_part .form_title .iconfont {
    font-size: .14rem;
    margin-right: .04rem;
  }
</style>
