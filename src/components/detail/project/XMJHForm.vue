<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart">
      <!-- 经办信息 （订单、主体等） -->
      <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
      <!-- 项目信息 -->
      <div class="project_info">
        <div class="info_title vux-1px-b"><span class="iconfont icon-xiangmu"></span>项目信息</div>
        <div class="project_content">
          <form-cell cellTitle="名称" :cellContent="projectApproval.projectName" :showTopBorder=false></form-cell>
          <form-cell cellTitle="经理" :cellContent="projectApproval.projectManager"></form-cell>
          <form-cell cellTitle="说明" :cellContent="projectApproval.comment || '无'"></form-cell>
          <form-cell cellTitle="预期开始日期" :cellContent="projectApproval.expectStartDate | timeSplit"></form-cell>
          <form-cell cellTitle="预期截止日期" :cellContent="projectApproval.expectEndDate | timeSplit"></form-cell>
        </div>
      </div>      
      <!-- 任务计划明细 -->
      <div class="form_part">
        <div class="form_title vux-1px-b">
          <span class="iconfont icon-renwu"></span><span class="title">任务列表</span>
        </div>
        <div class="form_content" 
             :class="{ 'show_border' : index !== projectPlan.length - 1}"
             v-for="(item, index) in projectPlan" :key='index'>
          <div class="main_content" >
              <form-cell cellTitle='任务名称' :cellContent="item.taskName" :showTopBorder=false></form-cell>
              <form-cell cellTitle='任务类型' :cellContent="item.taskType"></form-cell>
              <form-cell cellTitle='计划工时' :cellContent="item.planTime"></form-cell>
              <form-cell cellTitle='计划截止日期' :cellContent="item.deadline | timeSplit"></form-cell>
              <form-cell cellTitle='任务说明' :cellContent="item.comment"></form-cell>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vux组件引入
import {Cell, Group } from 'vux'
// 请求 引入
import {findProjectPlan} from 'service/projectService'
// mixins 引入
import detailCommon from 'components/mixins/detailCommon'
export default {
  data() {
    return {
      projectPlan: {},
      comment: {},
      projectApproval: {},
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
</style>

