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
          <span class="iconfont icon-mingxi1"></span>
          <span>往来信息</span>
        </div>
        <div class="main_content">
           <form-cell cellTitle='往来名称' :cellContent="dealerInfo.dealerName_dealerCodeCredit"></form-cell>
            <form-cell cellTitle='往来编码' :cellContent="dealerInfo.dealerCodeCredit" ></form-cell>
            <form-cell cellTitle='往来关系标签' :cellContent="dealerInfo.crDealerLabel"></form-cell>
            <form-cell cellTitle='类型' showSymbol :cellContent="dealerInfo.applicationType | toFixed | numberComma(3)"></form-cell>
            <form-cell cellTitle='信用额度' showSymbol :cellContent="dealerInfo.tdCreditLine | toFixed | numberComma(3)"></form-cell>
            <form-cell cellTitle='往来余额' showSymbol :cellContent="dealerInfo.thenAmntBalCopy1 | toFixed | numberComma(3)"></form-cell>
            <form-cell cellTitle='申请金额' showSymbol :cellContent="dealerInfo.thenTotalAmntBal | toFixed | numberComma(3)"></form-cell>
            <form-cell cellTitle='本次支付' showSymbol :cellContent="dealerInfo.tdAmountCopy1 | toFixed | numberComma(3)"></form-cell>
            <form-cell cellTitle='本次支付后余额' showSymbol :cellContent="dealerInfo.differenceAmount | toFixed | numberComma(3)"></form-cell>
        </div>
      </div>
      <div class="form_content" style="margin-top:0.1rem;">
        <div class="form_title">
          <span class="iconfont icon-baoxiao"></span>
          <span class="title">资金账户信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='资金账户' :cellContent="cashInfo.fundName_cashInCode"></form-cell>
          <form-cell cellTitle='资金编码' :cellContent="cashInfo.cashInCode" ></form-cell>
          <form-cell cellTitle='资金账户类型' :cellContent="cashInfo.cashType_cashInCode"></form-cell>
          <form-cell cellTitle='账户余额' showSymbol :cellContent="cashInfo.thenAmntBal | toFixed | numberComma(3)"></form-cell>
          <form-cell cellTitle='本次支付' showSymbol :cellContent="cashInfo.tdAmount | toFixed | numberComma(3)"></form-cell>
        </div>
      </div>
      <!-- <div class="price_cell vux-1px-t">
        <div class="price_title">
          <span>报销人：</span>
          <span class="people_name">{{orderInfo.creatorName }}</span>
        </div>
        <div>
          <span class='title'>合计:</span>
          <span class="num"><span style="fontSize:.12rem;">￥</span>{{count | toFixed | numberComma(3)}}</span>
        </div>
      </div> -->
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件引入
// 组件 引入
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import contactPart from 'components/detail/commonPart/ContactPart'
//公共方法引入
import {accAdd} from '@/home/pages/maps/decimalsAdd.js'
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
  mixins: [detailCommon],
  components: {
    workFlow, RAction, contactPart
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
              onHide:()=>{
              this.$router.back();
            }
          });
          return;
        }
        this.attachment = data.attachment;
        this.orderInfo = data.formData;
        this.dealerInfo = data.formData.order.dataSet[0];
        this.cashInfo = data.formData.outPut.dataSet[0]
        this.workFlowInfoHandler();
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
  .form_part .form_title .iconfont {
    font-size: .14rem;
    margin-right: .04rem;
  }
</style>
