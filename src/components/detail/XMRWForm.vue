<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
      <!-- 项目-->
      <r-picker title="项目名称" mode="3" placeholder="" v-model="projectTask.projectName" disabled></r-picker>
      <!-- 任务 -->
      <r-picker title="任务名称" mode="3" placeholder="" v-model="projectTask.taskName" disabled></r-picker>
      <!-- 任务详情 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">任务详情</p>
        <group>
          <cell title="任务类型" :value="projectTask.taskType"></cell>
          <cell title="任务说明" :value="projectTask.comment"></cell>
          <cell title="截止日期" :value="projectTask.deadline"></cell>
          <cell title="计划工时" :value="projectTask.planTime"></cell>
        </group>
      </div>
      <!-- 实际情况 -->
      <div class="trade_mode mg_auto box_sd">
        <p class="title">实际情况</p>
        <group>
          <cell title="实际完成日期" :value="projectTask.actualCompleteTime"></cell>
          <cell title="实际工时" :value="projectTask.actualTime"></cell>
        </group>
      </div>
    </div>
  </div>
</template>

<script>
  import {Group, Cell, dateFormat,} from 'vux'
  import {getSOList,} from 'service/detailService'
  import detailCommon from 'components/mixins/detailCommon'
  import {findProjectTask} from 'service/projectService'
  import RPicker from 'components/RPicker'

  export default {
    data() {
      return {
        projectTask: {}
      }
    },
    mixins: [detailCommon],
    components: {
      Group,
      Cell,
      RPicker,
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
        return findProjectTask(transCode).then(({formData = {}}) => {
          let {projectTask} = formData;
          this.projectTask = {
            ...projectTask,
            actualCompleteTime: dateFormat(projectTask.actualCompleteTime, 'YYYY-MM-DD')
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
