<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 往来联系部分 交易基本信息-->
      <contact-part :contact-info="contactInfo"></contact-part>
      <div class="form_content">
        <div class="main_content" >
          <form-cell cellTitle='收款类型' :cellContent="orderInfo.order.receiptType"></form-cell>
        </div>
      </div>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">账户列表</span>
        </div>
        <div class="form_content"
            :class="{ 'show_border' : index !== orderInfo.order.dataSet.length - 1}"
            v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
          <div class="main_content" >
              <form-cell cellTitle='资金账户名称' :cellContent="item.fundName_cashInCode" :showTopBorder=false></form-cell>
              <form-cell cellTitle='资金账户大类' :cellContent="item.cashType_cashInCode"></form-cell>
              <form-cell cellTitle='余额' showSymbol :cellContent="item.thenAmntBal | toFixed | numberComma(3)"></form-cell>
              <form-cell cellTitle='收款金额' showSymbol :cellContent="item.tdAmount | toFixed | numberComma(3)"></form-cell>
              <form-cell cellTitle='手续费' showSymbol :cellContent="item.brokerage | toFixed | numberComma(3)"></form-cell>
              <form-cell cellTitle='净收款金额' showSymbol :cellContent="item.bookValue | toFixed | numberComma(3)"></form-cell>
          </div>
        </div>
      </div>
      <!-- <div class="price_cell vux-1px-t">
        <div class="price_title">
          <span>报销人: </span>
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
import detailCommon from 'mixins/detailCommon'
// 组件引入
// 组件 引入
import RAction from 'components/public/RAction'
import workFlow from 'components/public/workFlow'
import contactPart from 'components/detail/commonPart/ContactPart'
//公共方法引入
import {accAdd} from 'plugins/calc/decimalsAdd'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
      contactInfo: {}, // 客户、付款方式、物流条款的值
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
              onHide:() => {
              this.$router.back();
            }
          });
          return;
        }
        this.attachment = data.attachment;
        // 获取合计
        let {dataSet} = data.formData.order;
        for (let val of dataSet) {
          this.count = accAdd(this.count,val.tdAmount);
        }
        data.formData.validUntil = dateFormat(data.formData.validUntil, 'YYYY-MM-DD');
        this.orderInfo = data.formData;
        let {order} = this.orderInfo;
        this.contactInfo = {
          creatorName: order.dealerDebitContactPersonName, // 客户名
          dealerName: order.dealerName_dealerCodeCredit, // 公司名
          dealerMobilePhone: data.formData.dealerCreditContactInformation, // 手机
          dealerContactPersonName: data.formData.dealerCreditContactPersonName, // 联系人
          dealerCode: order.dealerCodeCredit, // 客户编码
          dealerLabelName: order.crDealerLabel, // 关系标签
          province: order.province_dealerCodeCredit, // 省份
          city: order.city_dealerCodeCredit, // 城市
          county: order.county_dealerCodeCredit, // 地区
          address: order.address_dealerCodeCredit, // 详细地址
          thenTotalAmntBal:order.thenTotalAmntBal,    //往来余额
          thenAmntBal:order.thenTotalAmntBal,    //往来余额
          applicationAmount:order.thenAlreadyAmnt,   //申请金额
          crDealerPaymentTerm: order.crDealerPaymentTerm,            //结算方式
          thenAlreadyAmnt: order.thenAlreadyAmnt,                    //本次收款
          differenceAmount: order.differenceAmount                   //本次收款后余额
        };
        this.workFlowInfoHandler();
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
  .form_part {
    .form_title {
      margin: .1rem .1rem .1rem;
    }
  }
  .form_part .form_title .iconfont {
    font-size: .14rem;
    margin-right: .04rem;
  }
</style>
