<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目经理 -->
      <div class="or_ads mg_auto box_sd">
        <p class="title">项目经理</p>
        <div class="user_info group_mar_left">
          <span class="user_name">{{projectApproval.projectManager}}</span>
          <span class="user_tel">{{projectApproval.phoneNumber}}</span>
        </div>
      </div>
      <!-- 项目明细 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">项目明细</p>
        <group class="JH_mar_left">
          <cell title="项目名称" primary="content" align-items="flex-start" :value="projectApproval.projectName"></cell>
          <cell title="项目说明" primary="content" align-items="flex-start" :value="projectApproval.comment"></cell>
        </group>
      </div>

      <!-- 预算开始日期 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">预算开始日期</p>
        <p class="mode">{{projectApproval.expectStartDate | dateFormat('YYYY-MM-DD')}}</p>
      </div>
      <!-- 预算截止日期 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">预算截止日期</p>
        <p class="mode">{{projectApproval.expectEndDate | dateFormat('YYYY-MM-DD')}}</p>
      </div>
      <!-- 实际开始日期 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">实际开始日期</p>
        <p class="mode">{{projectTime.actualStartTime | dateFormat('YYYY-MM-DD')}}</p>
      </div>
      <!-- 实际完成日期 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">实际完成日期</p>
        <p class="mode">{{projectTime.actualCompleteTime | dateFormat('YYYY-MM-DD')}}</p>
      </div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import {Cell, Group, dateFormat} from 'vux'
  // 请求 引入
  import {findProjectConclusion} from 'service/projectService'
  // mixins 引入
  import detailCommon from 'components/mixins/detailCommon'

  export default {
    data() {
      return {
        comment: '',
        projectApproval: {}, // 项目相关
        projectTime: {}, // 实际日期
        projectConclusion: {},
      }
    },
    filters: {
      dateFormat
    },
    mixins: [detailCommon],
    components: {
      Group,
      Cell,
    },
    methods: {
      // 获取详情
      getOrderList(transCode = '') {
        return findProjectConclusion(transCode).then(({formData = {}}) => {
          this.comment = formData.comment;
          this.projectApproval = formData.projectApproval;
          this.projectTime = formData.projectTime;
          this.projectConclusion = formData.projectConclusion;
          this.orderInfo = {
            ...formData.baseinfo,
            biStatus: '已生效'
          };
        })
      },
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/bizDetail';

  .xmrw-detail-container {
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

