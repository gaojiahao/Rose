<template>
  <div class="detail_wrapper xmlw-detail-container">
    <div class="basicPart">
      <!-- <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div> -->
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目信息 -->
      <div class="form_content">
        <!-- <div class="info_title vux-1px-b"><span class="iconfont icon-xiangmu"></span>项目信息</div> -->
        <div class="main_content">
          <div class="vux-1px-b" v-for="(item, index) in otherConfig" :key="index">
            <template v-if="item.id.includes('Datefield')">
              <div class="each_info">
                <label>{{item.fieldLabel}}</label>
                <span class="field_value">{{approval[item.fieldCode] | timeSplit}}</span>
              </div>
            </template>
            <template v-else>
              <div class="each_info">
                <label>{{item.fieldLabel}}</label>
                <span class="field_value">{{approval[item.fieldCode]}}</span>
              </div>
            </template> 
          </div>
        </div>
      </div>
      <!-- 预算明细 -->
      <!-- <div class="project_info">
        <div class="info_title vux-1px-b"><span class="iconfont icon-yusuan2"></span>预算明细</div>
        <div class="project_content">
          <form-cell cellTitle="收入" showSymbol textRight :cellContent="numberComma(approval.budgetIncome)" :showTopBorder=false></form-cell>
          <form-cell cellTitle="成本" showSymbol textRight :cellContent="numberComma(approval.budgetCapital)"></form-cell>
          <form-cell cellTitle="费用" showSymbol textRight :cellContent="numberComma(approval.budgetCost)"></form-cell>
          <form-cell cellTitle="利润" showSymbol textRight :cellContent="numberComma(approval.budgetProfit)"></form-cell>
          <form-cell cellTitle="利润率" textRight :cellContent="percent(approval.budgetProfitMargin)"></form-cell>
        </div>
      </div> -->
      <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
      <r-action :code="transCode" :task-id="taskId" :actions="actions"
                :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>

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
  import RAction from 'components/RAction'

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
      RAction
    },
    methods: {
      // 获取详情
      getOrderList(transCode = '') {
        return findProjectApproval(transCode).then(({formData = {},attachment = []}) => {
          this.approval = formData.projectApproval;
          this.attachment = attachment;
          this.comment = formData.comment;
          this.orderInfo = {
            ...formData.baseinfo,
            ...formData.comment,
            biStatus: '已生效'
          };
        })
      },
      // 使用千分符
      numberComma(val) {
        if (!val && val !== 0) {
          return '无';
        }
        return numberComma(val);
      },
      // 转为百分比
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
  @import './../../scss/bizDetail';
</style>
