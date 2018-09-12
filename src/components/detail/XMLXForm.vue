<template>
  <div class="detail_wrapper xmlw-detail-container">
    <div class="basicPart">
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目信息 -->
      <div class="project_info">
        <div class="info_title vux-1px-b"><span class="iconfont icon-xiangmu"></span>项目信息</div>
        <div class="project_content">
          <form-cell cellTitle="名称" :cellContent="approval.projectName" :showTopBorder=false></form-cell>
          <form-cell cellTitle="类型" :cellContent="approval.projectType"></form-cell>
          <form-cell cellTitle="经理" :cellContent="approval.projectManager"></form-cell>
          <form-cell cellTitle="经理电话" :cellContent="approval.phoneNumber"></form-cell>
          <form-cell cellTitle="说明" :cellContent="approval.comment || '无'"></form-cell>
        </div>
      </div>
      <!-- 预算明细 -->
      <div class="project_info">
        <div class="info_title vux-1px-b"><span class="iconfont icon-yusuan2"></span>预算明细</div>
        <div class="project_content">
          <form-cell cellTitle="收入" showSymbol textRight :cellContent="numberComma(approval.budgetIncome)" :showTopBorder=false></form-cell>
          <form-cell cellTitle="成本" showSymbol textRight :cellContent="numberComma(approval.budgetCapital)"></form-cell>
          <form-cell cellTitle="费用" showSymbol textRight :cellContent="numberComma(approval.budgetCost)"></form-cell>
          <form-cell cellTitle="利润" showSymbol textRight :cellContent="numberComma(approval.budgetProfit)"></form-cell>
          <form-cell cellTitle="利润率" textRight :cellContent="percent(approval.budgetProfitMargin)"></form-cell>
          <form-cell cellTitle="开始日期" textRight :cellContent="approval.expectStartDate | timeSplit"></form-cell>
          <form-cell cellTitle="截止日期" textRight :cellContent="approval.expectEndDate | timeSplit"></form-cell>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {Cell, Group, numberComma} from 'vux'
  // 请求 引入
  import {findProjectApproval} from 'service/projectService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'
  import {accMul} from '@/home/pages/maps/decimalsAdd'

  export default {
    data() {
      return {
        approval: {},
        comment: {},
      }
    },
    filters: {
      timeSplit(val) {
        return val ? val.split(' ')[0] : '';
      }
    },
    mixins: [detailCommon],
    components: {
      Group,
      Cell,
    },
    methods: {
      // 获取详情
      getOrderList(transCode = '') {
        return findProjectApproval(transCode).then(({formData = {}}) => {
          this.approval = formData.approval;
          this.comment = formData.comment;
          this.orderInfo = {
            ...formData.baseinfo,
            biStatus: '已生效'
          };
        })
      },
      // TODO 使用千分符
      numberComma(val) {
        if (!val && val !== 0) {
          return '无';
        }
        return numberComma(val);
      },
      // TODO 转为百分比
      percent(val) {
        if (!val && val !== 0) {
          return '无';
        }
        let budget = accMul(val,100);
        return `${budget}%`;
        // return `${val * 100}%`;
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';
</style>
