<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
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

  .materiel_list .mater_list .each_mater .each_mater_wrapper .mater_main {
    margin-left: 0;
    max-width: inherit;
  }

  .mater_other .reason {
    display: flex;
    .content {
      flex: 1;
    }
  }

  .bor_bottom {
    position: relative;
  }

  .bor_bottom::after {
    content: " ";
    position: absolute;
    left: 0;
    bottom: 0;
    right: 0;
    border-top: 1px solid #D9D9D9;
    color: #D9D9D9;
    transform-origin: 0 0;
    transform: scaleY(0.5);
  }

  .bor_bottom:last-child()::after {
    border: none;
  }

  .materiel_list .mater_list .JH_pad0 {
    padding: 0.04rem 0;
  }

  .JH_mar_left {
    margin-left: 0.04rem;
  }

  .group_mar_left {
    margin: 0 0.04rem;
  }
</style>

