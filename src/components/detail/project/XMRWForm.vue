<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
      <!-- 任务信息 -->
      <div class="project_info">
        <div class="info_title vux-1px-b"><span class="iconfont icon-renwu"></span>任务信息</div>
        <div class="project_content">
          <form-cell cellTitle="项目名称" :cellContent="projectTask.projectName" :showTopBorder=false></form-cell>
          <form-cell cellTitle="任务名称" :cellContent="projectTask.taskName"></form-cell>
          <form-cell cellTitle="任务类型" :cellContent="projectTask.taskType"></form-cell>
          <form-cell cellTitle="任务说明" :cellContent="projectTask.comment || '无'"></form-cell>
          <form-cell cellTitle="计划截止日期" :cellContent="projectTask.deadline"></form-cell>
          <form-cell cellTitle="计划工时" :cellContent="projectTask.planTime"></form-cell>
          <form-cell cellTitle="实际完成日期" :cellContent="projectTask.actualCompleteTime"></form-cell>
          <form-cell cellTitle="实际工时" :cellContent="projectTask.actualTime"></form-cell>
        </div>
      </div>
      <upload-file :default-value="attachment" no-upload :contain-style="uploadStyle" :title-style="uploadTitleStyle"></upload-file>

    </div>
  </div>
</template>

<script>
// vux组件引入
import { Cell, Group, dateFormat } from 'vux'
// 请求 引入
import { getSOList } from 'service/detailService'
import { findProjectTask } from 'service/projectService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
import common from '@/mixins/common'
// 组件 引入
import RPicker from 'components/RPicker'
export default {
  data() {
    return {
      projectTask: {}
    }
  },
  mixins: [detailCommon, common],
  components: {
    Group,
    Cell,
    RPicker,
  },
  methods: {
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default02.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 获取详情
    getOrderList(transCode = '') {
      return findProjectTask(transCode).then(({formData = {},attachment = []}) => {
        let projectTask = formData.projectTask || {};
        this.jsonData = formData;
        this.attachment = attachment;
        this.projectTask = {
          ...projectTask,
          deadline: this.changeDate(projectTask.deadline),
          actualCompleteTime: this.changeDate(projectTask.actualCompleteTime),
        };
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
  @import './../../scss/bizDetail';

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
