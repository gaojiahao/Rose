<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_content">
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
      </div>
      <!-- 资金 -->
      <pop-cash-list :default-value="cashInfo" @sel-item="selCash" request="0" :params="cashParams"
                     v-if="isCashier" required>
        <template slot="other">
          <form-cell cellTitle='本次支付' :cellContent="cashInfo.tdAmount | toFixed | numberComma(3)"
                     showSymbol></form-cell>
        </template>
      </pop-cash-list>
      <div class="form_content" style="margin-top:0.1rem;"
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
  // 组件 引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import contactPart from 'components/detail/commonPart/ContactPart'
  import PopCashList from 'components/Popup/finance/PopCashList'
  //公共方法引入
  import {accAdd} from '@/home/pages/maps/decimalsAdd'
  import {toFixed} from '@/plugins/calc'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
        contactInfo: {}, // 客户、付款方式、物流条款的值
        dealerInfo: {},
        cashInfo: {}
      }
    },
    computed: {
      // TODO 是否为部门负责人、财务总监
      isInCharge(){
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'd7ef0729-4a55-46fe-a750-e5298042c5bc';
      },
      // TODO 是否为采购总监、财务经理/总监、总经理
      isApproval() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '65afdac2-db7d-42d1-a059-7fdb98892134';
      },
      // TODO 是否为出纳
      isCashier() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === '14128204-e4ee-4688-98c7-9d3c03e7a3ad';
      },
      // TODO 是否为会计
      isAccount() {
        let {viewId = ''} = this.currentWL;
        return this.isMyTask && viewId === 'b8490da9-513f-408b-8974-83998188bf6a';
      },
      cashParams() {
        return {
          transCode: this.transCode
        }
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, contactPart, PopCashList, XInput,
    },
    methods: {
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
      // TODO 同意的处理
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
      // TODO 选中资金
      selCash(item) {
        this.cashInfo = {
          ...this.cashInfo,
          ...item,
        };
      },
      // TODO 计算支付后余额
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
