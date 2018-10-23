<template>
  <div class="detail_wrapper xsbj-detail-container">
    <div class="basicPart" v-if='orderInfo'>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>   
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                :no-status="orderInfo.biStatus"></work-flow> 
      <div class="form_content">
        <div class="form_title">
          <span class="iconfont icon-mingxi1"></span>
          <span>工单信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='工单任务号' :cellContent="workInfo.transMatchedCode"></form-cell>
          <form-cell cellTitle='工序名称' :cellContent="workInfo.procedureName_proPointCode"></form-cell>
          <form-cell cellTitle='工序编码' :cellContent="workInfo.proPointCode"></form-cell>
          <form-cell cellTitle='可验收余额' :cellContent="workInfo.thenQtyBal"></form-cell>
          <form-cell cellTitle='本次验收' :cellContent="workInfo.tdQty"></form-cell>
          <form-cell cellTitle='后置工序' :cellContent="workInfo.procedureName_rearProPointCode"></form-cell>
          <form-cell cellTitle='验收员' :cellContent="workInfo.dealerName_dealerDebit"></form-cell>
        </div>
      </div>
      <div class="form_content has_margin">
        <div class="form_title">
          <span class="iconfont icon-mingxi1"></span>
          <span>加工订单信息</span>
        </div>
        <div class="main_content">
          <form-cell cellTitle='加工订单号' :cellContent="workInfo.processCode"></form-cell>
          <form-cell cellTitle='成品名称' :cellContent="workInfo.inventoryName_transObjCode"></form-cell>
          <form-cell cellTitle='备注' :cellContent="orderInfo.biComment"></form-cell>
        </div>
      </div>
      <!-- 审批操作 -->
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
    </div>
  </div>
</template>

<script>
// vux组件引入
import { Cell, Group,dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import { toFixed } from '@/plugins/calc'
import RAction from 'components/RAction'
import workFlow from 'components/workFlow'
import contactPart from 'components/detail/commonPart/ContactPart'


export default {
  data() {
    return {
      workInfo: {},       // 工单内容
      orderInfo: {},      // 表单内容
    }
  },
  mixins: [detailCommon],
  components: {
    Cell, Group, RAction, workFlow, contactPart
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
        this.orderInfo = data.formData;
        this.workInfo = data.formData.order.dataSet[0];
        this.workFlowInfoHandler();
      })
    },
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';
  .xsbj-detail-container{
    /deep/ .weui-cells {
      margin-top: 0;
      font-size: .16rem;
      &:before {
        border-top: none;
      }
      &:after {
        border-bottom: none;
      }
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }
</style>
