<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
      <div class='related_tips' v-if='HasValRealted' @click="getSwiper">
        <span>其他应用里存在与本条相关联的数据，快去看看</span>
        <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
      </div>
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
          <form-cell cellTitle="周期天数" :cellContent="projectTask.cycleNumber"></form-cell>
          <form-cell cellTitle="标准工时" :cellContent="projectTask.planTime"></form-cell>
          <form-cell cellTitle="作业费率" :cellContent="projectTask.operatingRate"></form-cell>
          <form-cell cellTitle="预算作业成本" :cellContent="projectTask.budgetHomeworkCost"></form-cell>
          <form-cell cellTitle="实际完成日期" :cellContent="projectTask.actualCompleteTime"></form-cell>
          <form-cell cellTitle="实际工时" :cellContent="projectTask.actualTime"></form-cell>
          <form-cell cellTitle="实际作业成本" :cellContent="projectTask.actualtHomeworkCost"></form-cell>
        </div>
      </div>
      <div class="comment-part">
        <form-cell :showTopBorder="false" cellTitle='备注' :cellContent="comment.biComment || '无'"></form-cell>
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
      projectTask: {},
      comment: {},
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
        this.comment = formData.comment;
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
