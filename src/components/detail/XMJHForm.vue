<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">

       <!-- 项目明细 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">项目明细</p>
        <group class="JH_mar_left">
          <cell title="项目名称" :value="projectApproval.projectName"></cell>
          <cell title="项目经理" :value="projectApproval.projectManager"></cell>
          <cell title="项目说明" primary="content" align-items="flex-start" :value="projectApproval.comment"></cell>
        </group>
      </div>

      <!-- 预算开始日期 -->
      <div class="trade_mode mg_auto box_sd">
        <group>
          <cell title="预算开始日期" :value="projectApproval.expectStartDate | timeSplit"></cell>
        </group>
      </div>

      <!-- 预算截止日期 -->
      <div class="trade_mode mg_auto box_sd">
        <group>
          <cell title="预算截止日期" :value="projectApproval.expectEndDate | timeSplit"></cell>
        </group>
      </div>

      <!-- 预算明细 -->
      <!-- <div class="trade_mode mg_auto box_sd" v-for="(val,idx) in projectPlan" :key="idx">
        <p class="title">任务计划明细</p>
        <group>
          <cell title="任务名称" :value="val.taskName"></cell>
          <cell title="任务类型" :value="val.taskType"></cell>
          <cell title="任务说明" primary="content" align-items="flex-start" :value="val.comment"></cell>
          <cell title="计划工时" :value="val.planTime"></cell>
          <cell title="截止日期" :value="val.deadline | timeSplit"></cell>
        </group>
      </div> -->

      <!-- 任务计划明细 -->
      <div class="materiel_list mg_auto box_sd">
        <p class="title">任务计划明细</p>
        <div class="bor_bottom JH_mar_left" v-for="(item,index) in projectPlan" :key="'JH'+index">
          <div class="mater_list">
            <div class="each_mater JH_pad0">
              <div class="each_mater_wrapper ">
                <div class="mater_main">
                  <div class="mater_name">
                    <span class="whiNum">#{{index+1}}</span>
                  {{item.taskName}}
                  </div>
                  <!-- <div class="mater_info">
                    <div class="withColor">
                      <div class="ForInline" style="display:flex">
                        <div class="mater_code">
                          <span class="title">任务类型</span>
                          <span class="num">{{item.taskType}}</span>
                        </div>
                        <div class="mater_spec">
                          <span class="title">计划工时</span>
                          <span class="num">{{item.planTime}}</span>
                        </div>
                      </div>
                    </div>
                  </div> -->
                  <div class='mater_other'>
                    <div class='mater_reimb'>
                      <div class="reason">
                        <span class="title">任务类型: </span>
                        <span class="content">
                          {{item.taskType}}
                      </span>
                      </div>
                      <div class="reason">
                        <span class="title">计划工时: </span>
                        <span class="content">
                          {{item.planTime}}
                      </span>
                      </div>
                      <div class="reason">
                        <span class="title">截止日期: </span>
                        <span class="content">
                          {{item.deadline | timeSplit}}
                        </span>
                      </div>
                      <div class="reason">
                        <span class="title">任务说明: </span>
                        <span class="content">
                          {{item.comment}}
                      </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {Group, Cell, dateFormat,} from 'vux'
  import {getSOList,} from 'service/detailService'
  import detailCommon from 'components/mixins/detailCommon'
  import {findProjectTask,findProjectApproval,findProjectPlan} from 'service/projectService'

  export default {
    data() {
      return {
        projectPlan:'',
        comment:'',
        projectApproval:'',
      }
    },
    filters:{
      timeSplit(val){
        return val?val.split(' ')[0]:'';
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
        return findProjectPlan(transCode).then(({formData = {}}) => {
          this.projectPlan = formData.projectPlan;
          this.comment = formData.comment;
          this.projectApproval = formData.projectApproval;
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
  .materiel_list .mater_list .each_mater .each_mater_wrapper .mater_main{
      margin-left: 0;
      max-width: inherit;
    }
  .mater_other .reason{
      display: flex;
      .content{
        flex: 1;
      }
    }
    .bor_bottom{
      position: relative;
    }
    .bor_bottom::after{
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
    .bor_bottom:last-child()::after{
      border:none;
    }
    .materiel_list .mater_list .JH_pad0{
      padding: 0.04rem 0;
    }
    .JH_mar_left{
      margin-left: 0.04rem;
    }
</style>

