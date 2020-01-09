<template>
  <div class="pages xsbj-list-conatiner" :class="{'no-add': !action.add}" ref="list">
    <div class="content">
      <slot name="nav"></slot>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search="searchList" ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort"></r-sort>
        </div>
      </div>
      <r-scroll
        class="list_wrapper"
        :options="scrollOptions"
        :has-next="hasNext"
        :no-data="!hasNext && !listData.length"
        @on-pulling-up="onPullingUp"
        @on-pulling-down="onPullingDown"
        ref="bScroll"
      >
        <div
          class="instance-item-wrapper"
          v-for="(item, index) in listData"
          @click="goDetail(item, index)"
          :class="{visited: item.visited}"
          :key="index"
        >
          <div class="instance-main">
            <div class="instance-header">
              <span class="instance_code vux-1px-l">{{item.transCode}}</span>
              <span class="instance_status" :class="item.statusClass">{{item.biStatus}}</span>
            </div>
            <div class="instance-project-container">
              <div
                class="project_name"
                :class="{'time-to-wrap': item.projectName_projectApprovalId&&item.projectName_projectApprovalId.length > 15}"
              >项目名称: {{item.projectName_projectApprovalId || '无'}}</div>
              <div class="project_manager">
                <span class="project_manager_title">项目经理:</span>
                <span class="project_manager_value">{{item.dealerName_dealerDebit || '无'}}</span>
              </div>
            </div>
            <div class="instance-task-container">
              <div
                class="instance_task_item"
                v-for="(task, tIndex) in item.detailItem"
                :key="tIndex"
              >
                <i class="icon" :class="[getTaskIcon(tIndex)]"></i>
                <div class="task-detail">
                  <!-- <div class="task_name">
                    {{task.logTitle}}
                     <span class="instance_process_status">{{task.biProcessStatus || '暂无流程'}}</span>
                    </div> -->
                    <div class="task_name">
                      <span class="task_title">{{task.logTitle}}</span>
                      <span class="instance_process_status">{{item.biProcessStatus || '暂无流程'}}</span>
                    </div>
                  <div class="task_info">
                    <div class="task_info_item">
                      <span class="task_info_title">预算成本:</span>
                      <span class="task_info_amt">{{task.hourlyCost || 0 | numberComma}}</span>
                    </div>
                    <div class="task_info_item">
                      <span class="task_info_title">申报工时:</span>
                      <span class="task_info_day">{{task.logDeclarationHours || 0}}天</span>
                    </div>
                  </div>
                  <div class="task_info">
                    <div class="task_info_item">
                      <span class="task_info_title">日期:</span>
                      <span
                        class="task_info_day"
                      >{{task.taskDate | dateFormat('YYYY-MM-DD') || '无'}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="instance-bottom">
            <div class="instance-bottom-wrapper">
              <div class="instance_bottom_item instance_handler">
                <i class="icon icon-handler"></i>
                <span>经办人: {{item.handlerName}}</span>
              </div>
              <div class="instance_bottom_item instance_mod_time">
                <i class="icon icon-mod-time"></i>
                <span>修改时间: {{item.modTime | dateFormat('YYYY-MM-DD HH:mm')}}</span>
              </div>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>
  </div>
</template>

</template>

<script>
import listCommon from "mixins/bizListCommon";
export default {
  data() {
    return {
      filterList: [
        // 过滤列表
        {
          name: "交易号",
          value: "transCode"
        },
        {
          name: "经办人",
          value: "handlerName"
        },
        {
          name: "任务标题",
          value: "logTitle"
        }
      ]
    };
  },
  mixins: [listCommon],
  methods: {
    // 返回任务icon
    getTaskIcon(index) {
      let icons = ["icon-task4", "icon-task2", "icon-task3"];
      return icons[index % 3];
    }
  }
};
</script>

<style lang='scss' scoped>
@import "./project.scss";
.instance-item-wrapper {
  .instance-main {
    padding: 0.15rem 0.15rem 0;
  }
  .instance-project-container {
    display: flex;
    align-items: center;
    margin-top: 0.25rem;
    .project_name {
      line-height: 0.12rem;
      font-size: 0.12rem;
      &.time-to-wrap {
        flex: 1;
        line-height: 0.16rem;
      }
    }
    .project_manager {
      display: flex;
      margin-left: 0.1rem;
      line-height: 0.12rem;
      font-size: 0.12rem;
    }
    .project_manager_title {
      color: #999;
    }
    .project_manager_value {
      color: #696969;
    }
  }
  .instance-task-container {
    margin-top: 0.2rem;
    .instance_task_item {
      display: flex;
      & + .instance_task_item {
        margin-top: 0.15rem;
      }
      &:last-child {
        .task-detail {
          &:after {
            display: none;
          }
        }
      }
    }
    .icon {
      display: inline-block;
      width: 0.5rem;
      height: 0.5rem;
    }
    .task-detail {
      flex: 1;
      margin-left: 0.1rem;
      padding-bottom: 0.15rem;
    }
    .task_name {
      font-size: 0.14rem;
      line-height: 0.18rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .instance_process_status{
        margin-left: .22rem;
        padding: .04rem .05rem;
        line-height: .12rem;
        border: 1px solid #FB880B;
        border-radius: .04rem;
        color: #FB880B;
        font-size: .1rem;
        font-weight: 500;
    }
    .task_info {
      display: flex;
      margin-top: 0.05rem;
      line-height: 0.12rem;
      font-size: 0.12rem;
      & + .task_info {
        margin-top: 0.08rem;
      }
    }
    .task_info_item {
      & + .task_info_item {
        margin-left: 0.1rem;
      }
    }
    .task_info_title {
      color: #999;
    }
    .task_info_amt {
      color: #fa7138;
    }
    .task_info_day {
      color: #696969;
    }
  }
}
</style>
