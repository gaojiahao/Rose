<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目信息 -->
      <project-part :project-info="orderInfo.order"></project-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">供应商详情</span>
        </div>
        <div class="form_content" v-for="(item, index) in orderInfo.inPut.dataSet" :key='index'>
          <div class="main_content">
            <form-cell cellTitle='供应商名称' :cellContent="item.dealerName_dealerDebit" :showTopBorder=false></form-cell>
            <form-cell cellTitle='供应商编码' :cellContent="item.dealerCode_dealerDebit"></form-cell>
            <form-cell cellTitle='往来关系标签' :cellContent="item.drDealerLabel"></form-cell>
            <form-cell cellTitle='往来余额' :cellContent="item.thenAmntBalCopy1 | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='申请金额' :cellContent="item.applicationAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付' :cellContent="item.tdAmountCopy1 | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付后余额' :cellContent="item.differenceAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
          </div>
        </div>
      </div>
      <!-- 采购费用列表 -->
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">采购费用列表</span>
        </div>
        <div class="form_content"
             :class="{ 'show_border' : index !== orderInfo.order.dataSet.length - 1}"
             v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
          <div class="main_content">
            <form-cell cellTitle='采购入库号' :cellContent="item.transMatchedCode" :showTopBorder=false></form-cell>
            <form-cell cellTitle='采购订单号' :cellContent="item.orderCode"></form-cell>
            <form-cell cellTitle='价税合计' :cellContent="item.thenTotalAmntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='已核销' :cellContent="item.thenAlreadyAmnt | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='待核销' :cellContent="item.thenAmntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='账期到期日' :cellContent="item.accountExpirationDate"></form-cell>
            <form-cell cellTitle='账期天数' :cellContent="`${item.daysOfAccount}`"></form-cell>
            <form-cell cellTitle='帐龄天数' :cellContent="`${item.ageOfAging}`"></form-cell>
            <form-cell cellTitle='账期剩余天数' :cellContent="`${item.accountRemaingDays}`"></form-cell>
            <form-cell cellTitle='已收票' :cellContent="item.invoiced | toFixed | numberComma(3)" showSymbol></form-cell>
            <form-cell cellTitle='待收票' :cellContent="item.pendingTicket | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次申请支付' :cellContent="item.applicationAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付' :cellContent="item.tdAmount | toFixed | numberComma(3)" showSymbol></form-cell>
            <form-cell cellTitle='本次支付后余额' :cellContent="item.differenceAmount | toFixed | numberComma(3)"
                       showSymbol></form-cell>
          </div>
        </div>
      </div>
      <!-- 资金列表 -->
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">供资金详情</span>
        </div>
        <div class="form_content" v-for="(item, index) in orderInfo.outPut.dataSet" :key='index'>
          <div class="main_content">
            <form-cell cellTitle='资金账户' :cellContent="item.fundName_cashOutCode" :showTopBorder=false></form-cell>
            <form-cell cellTitle='资金编码' :cellContent="item.cashOutCode"></form-cell>
            <form-cell cellTitle='资金账户类型' :cellContent="item.cashType_cashOutCode"></form-cell>
            <form-cell cellTitle='账户余额' :cellContent="item.thenAmntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次支付' :cellContent="item.tdAmount | toFixed | numberComma(3)" showSymbol></form-cell>
          </div>
        </div>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle"
                   :title-style="uploadTitleStyle"></upload-file>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {dateFormat} from 'vux'
  // 请求 引入
  import {getSOList} from 'service/detailService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  // 组件引入
  // 组件 引入
  import RAction from 'components/RAction'
  import workFlow from 'components/workFlow'
  import ProjectPart from 'components/detail/commonPart/Project'
  //公共方法引入
  import {accAdd} from '@/home/pages/maps/decimalsAdd'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70'
      }
    },
    mixins: [detailCommon],
    components: {
      workFlow, RAction, ProjectPart
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
          // 获取合计
          let {dataSet} = data.formData.order;
          for (let val of dataSet) {
            this.count = accAdd(this.count, val.tdAmount);
          }
          data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
          this.orderInfo = data.formData;
          this.workFlowInfoHandler();
        })
      }
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

  .form_part {
    margin-bottom: .1rem;
    .form_title .iconfont {
      margin-right: .04rem;
      font-size: .14rem;
    }
  }
</style>
