<template>
  <div class="detail_wrapper">
    <div class="basicPart" v-if='orderInfo && orderInfo.order'>
      <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div>
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="workFlowInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目信息 -->
      <project-part :project-info="orderInfo.order"></project-part>
      <!-- 工作流 -->
      <work-flow :work-flow-info="workFlowInfo" :full-work-flow="fullWL" :userName="userName" :is-my-task="isMyTask"
                 :no-status="orderInfo.biStatus"></work-flow>
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">往来详情</span>
        </div>
        <div class="form_content">
          <div class="main_content">
            <form-cell cellTitle='往来名称' :cellContent="dealerInfo.dealerName" :showTopBorder=false></form-cell>
            <form-cell cellTitle='往来编码' :cellContent="dealerInfo.dealerCode"></form-cell>
            <form-cell cellTitle='往来关系标签' :cellContent="dealerInfo.dealerLabelName"></form-cell>
            <form-cell cellTitle='往来余额' :cellContent="dealerInfo.amntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
            <form-cell cellTitle='本次收汇票' :cellContent="dealerInfo.thenTotalAmntBal | toFixed | numberComma(3)"
                       showSymbol></form-cell>
          </div>
        </div>
      </div>
      <!-- 采购费用列表 -->
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-baoxiao"></span><span class="title">汇票列表</span>
        </div>
        <div class="form_content"
             :class="{ 'show_border' : index !== orderInfo.order.dataSet.length - 1}"
             v-for="(item, index) in orderInfo.order.dataSet" :key='index'>
          <div class="main_content">
            <form-cell cellTitle='汇票号' :cellContent="item.draftNumber" :showTopBorder=false></form-cell>
            <form-cell cellTitle='类型' :cellContent="item.draftType"></form-cell>
            <form-cell cellTitle='承兑人' :cellContent="item.accepter"></form-cell>
            <form-cell cellTitle='金额' :cellContent="item.tdAmount | toFixed | numberComma(3)" showSymbol></form-cell>
            <form-cell cellTitle='出票日' :cellContent="item.draftDate"></form-cell>
            <form-cell cellTitle='到期日' :cellContent="item.draftDueDate"></form-cell>
            <form-cell cellTitle='说明' :cellContent="item.comment"></form-cell>
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
  import {accAdd} from '@/home/pages/maps/decimalsAdd.js'

  export default {
    data() {
      return {
        count: 0,          // 金额合计
        formViewUniqueId: '7aa1ae41-77a0-4905-84b4-9fa09926be70',
        dealerInfo: {},
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
          let {attachment, formData} = data;
          let {order = {}} = formData;
          this.attachment = attachment;
          this.dealerInfo = {
            dealerName: order.dealerName_dealerCodeCredit,
            dealerCode: order.dealerCodeCredit,
            dealerLabelName: order.crDealerLabel,
            amntBal: order.thenAmntBalCopy2,
            thenTotalAmntBal: order.thenAlreadyAmnt,
          };
          // 获取合计
          let {dataSet} = formData.order;
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
