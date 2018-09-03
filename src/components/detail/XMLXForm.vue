<template>
  <div class="detail_wrapper xmlw-detail-container">
    <div class="basicPart">
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目经理 -->
      <div class="or_ads mg_auto box_sd">
        <p class="title">项目经理</p>
        <div class="user_info group_mar_left">
          <span class="user_name">{{approval.projectManager}}</span>
          <span class="user_tel">{{approval.phoneNumber}}</span>
        </div>
      </div>
      <!-- 项目明细 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">项目信息</p>
        <group class="group_mar_left" gutter="0">
          <cell title="项目名称" primary="content" align-items="flex-start" :value="approval.projectName || '无'"></cell>
          <cell title="项目类型" :value="approval.projectType || '无'"></cell>
          <cell title="项目说明" primary="content" align-items="flex-start" :value="approval.comment || '无'"></cell>
        </group>
      </div>
      <!-- 预算明细 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">预算明细</p>
        <group class="group_mar_left" gutter="0">
          <cell title="预算收入" :value="numberComma(approval.budgetIncome)"></cell>
          <cell title="预算成本" :value="numberComma(approval.budgetCapital)"></cell>
          <cell title="预算费用" :value="numberComma(approval.budgetCost)"></cell>
          <cell title="预算利润" :value="numberComma(approval.budgetProfit)"></cell>
          <cell title="预算利润率" :value="percent(approval.budgetProfitMargin)"></cell>
          <cell title="预算开始日期" :value="approval.expectStartDate | timeSplit"></cell>
          <cell title="预算截至日期" :value="approval.expectEndDate | timeSplit"></cell>
        </group>
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
        return `${val * 100}%`;
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';

  .xmlw-detail-container {
    /deep/ .weui-cells {
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

  .group_mar_left {
    margin: 0 0.08rem;
  }
</style>
