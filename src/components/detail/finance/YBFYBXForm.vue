<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>

      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow>
      <!-- 物料列表 -->
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">费用列表</span>
        </div>
        <div class="form_content"
            :class="{ 'show_border' : index !== orderInfo.order.dataSet.length - 1}"
            v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
          <div class="main_content" >
              <form-cell cellTitle='名称' :cellContent="item.costName_expCode" :showTopBorder=false></form-cell>
              <form-cell cellTitle='科目' :cellContent="item.expSubject"></form-cell>
              <form-cell cellTitle='费用类型' :cellContent="item.costType_expCode"></form-cell>
              <form-cell cellTitle='发票类型' :cellContent="item.tdInvoiceType"></form-cell>
              <form-cell cellTitle='申请金额' showSymbol :cellContent="item.tdAmount | toFixed | numberComma(3)"></form-cell>
              <form-cell cellTitle='不含税金额' showSymbol :cellContent="item.noTaxAmount | toFixed | numberComma(3)"></form-cell>
              <form-cell cellTitle='税率' :cellContent="item.taxRate | toFixed"></form-cell>
              <form-cell cellTitle='税金' showSymbol :cellContent="item.taxAmount | toFixed | numberComma(3)"></form-cell>
              <form-cell cellTitle='报销事由' :cellContent="item.expCause"></form-cell>
          </div>
        </div>
      </div>
      <div class="price_cell vux-1px-t">
        <div class="price_title">
          <span>报销人: </span>
          <span class="people_name">{{orderInfo.creatorName }}</span>
        </div>
        <div>
          <span class='title'>合计:</span>
          <span class="num"><span style="fontSize:.12rem;">￥</span>{{count | toFixed | numberComma(3)}}</span>
        </div>
      </div>
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
//公共方法引入
import {accAdd} from 'plugins/calc/decimalsAdd'
export default {
  data() {
    return {
      count: 0,          // 金额合计
      formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70'
    }
  },
  mixins: [detailCommon],
  components: {
    workFlow,RAction
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
        this.workFlowInfoHandler();
      })
    }
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
  .form_part .form_title .iconfont {
    font-size: .14rem;
    margin-right: .04rem;
  }
</style>
