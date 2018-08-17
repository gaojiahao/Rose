<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
      <!-- 预算明细 -->
      <div class="trade_mode mg_auto box_sd" v-for="(val,idx) in projectPlan" :key="idx">
        <p class="title">项目计划明细</p>
        <group>
          <cell title="项目名称" :value="val.projectName"></cell>
          <cell title="项目经理" :value="val.budgetCapital"></cell>
          <cell title="项目说明" primary="content" align-items="flex-start" :value="val.budgetCost"></cell>
          <cell title="预算开始日期" :value="val.expectStartDate | timeSplit"></cell>
          <cell title="预算截至日期" :value="val.expectEndDate | timeSplit"></cell>
          <cell title="任务名称" :value="val.taskName"></cell>
          <cell title="任务类型" :value="val.taskType"></cell>
          <cell title="任务说明" primary="content" align-items="flex-start" :value="val.comment"></cell>
          <cell title="计划工时" :value="val.planTime"></cell>
          <cell title="截至日期" :value="val.deadline | timeSplit"></cell>
        </group>
      </div>

      <!-- 项目明细 -->
      <!-- <div class="materiel_list mg_auto box_sd">
        <div class="title">项目明细</div>
        <div class="mater_list">
          <div class="each_mater">
            <div class="each_mater_wrapper ">
              <div class="mater_main">
                <div class="mater_name">
                  <span class="whiNum">项目名称</span>
                 {{projectPlan.projectName}}
                </div>
                <div class="mater_info">
                  <div class="withColor">
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_code">
                        <span class="title">项目类型</span>
                        <span class="num">{{projectPlan.projectType}}</span>
                      </div>
                    </div>
                    <div class="ForInline" style="display:inline-block">
                      <div class="mater_spec">
                        <span class="title">项目经理</span>
                        <span class="num">{{projectPlan.projectManager}}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class='mater_other'>
                  <div class='mater_reimb'>
                     <div class="price">
                      <span class="title">手机号码: </span>
                      <span class="content">
                        {{projectPlan.phoneNumber}}
                      </span>
                    </div>
                    <div class="reason">
                      <span class="title">项目说明: </span>
                      <span class="content">
                        {{projectPlan.comment}}
                      </span>
                    </div>
                    <div class="reason">
                      <span class="title">项目备注: </span>
                      <span class="content">
                        {{comment.biComment || '无'}}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> -->

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
      //选择默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
      // 获取详情
      getOrderList(transCode = '') {
        return findProjectPlan(transCode).then(({formData = {}}) => {
          this.projectPlan = formData.projectPlan;
          this.comment = formData.comment;
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
  }
</style>
