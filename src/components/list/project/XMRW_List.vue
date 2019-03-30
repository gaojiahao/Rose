<template>
  <div class="pages xsbj-list-conatiner" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" :hasFormStatus="false" ref="sort"></r-sort>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="instance-item-wrapper" v-for="(item, index) in listData" @click="goDetail(item, index)"
             :class="{visited: item.visited}" :key="index">
          <div class="instance-main">
            <div class="instance-header">
              <span class="instance_code vux-1px-l">{{item.transCode}}</span>
              <span class="instance_status" :class="item.statusClass">{{item.biStatus}}</span>
            </div>
            <div class="instance-project-container">
              <div class="project_name" :class="{'time-to-wrap': item.projectName_projectApprovalId.length > 12}">项目名称: {{item.projectName_projectApprovalId}}</div>
              <div class="project_manager">
                <span class="project_manager_title">项目经理: </span>
                <span class="project_manager_value">{{item.dealerName_dealerDebit}}</span>
              </div>
            </div>
            <div class="instance-task-container">
              <div class="instance_task_item" v-for="(task, tIndex) in item.detailItem" :key="tIndex">
                <i class="icon" :class="[getTaskIcon(tIndex)]"></i>
                <div class="task-detail vux-1px-b">
                  <div class="task_name">{{task.taskName_projectPlanTask}}</div>
                  <div class="task_info">
                    <div class="task_info_item">
                      <span class="task_info_title">执行者: </span>
                      <span class="task_info_amt">{{task.dealerName_dealerCodeCredit || '暂无'}}</span>
                    </div>
                    <div class="task_info_item">
                      <span class="task_info_title">计划开始日期: </span>
                      <span class="task_info_day">{{task.startDate_projectPlanTask | dateFormat('YYYY-MM-DD') || '无'}}</span>
                    </div>
                  </div>
                  <div class="task_info" :class="{'when-is-fill': task.deadline_projectPlanTask && task.completeTime_projectPlanTask}">
                    <div class="task_info_item">
                      <span class="task_info_title">计划截止日期: </span>
                      <span class="task_info_day">{{task.deadline_projectPlanTask | dateFormat('YYYY-MM-DD') || '无'}}</span>
                    </div>
                    <div class="task_info_item">
                      <span class="task_info_title">实际完成日期: </span>
                      <span class="task_info_day">{{task.completeTime_projectPlanTask | dateFormat('YYYY-MM-DD') || '无'}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="instance-bottom vux-1px-t">
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

<script>
import listCommon from 'mixins/bizListCommon'
export default {
  data() {
    return {
      filterList: [ // 过滤列表
        {
          name: '交易号',
          value: 'transCode',
        }, {
          name: '经办人',
          value: 'handlerName',
        }, {
          name: '任务名称',
          value: 'taskName_projectPlanTask',
        }, {
          name: '项目名称',
          value: 'projectName_projectApprovalId',
        },
      ],
    }
  },
  mixins: [listCommon],
  methods: {
    // 返回任务icon
    getTaskIcon(index) {
      let icons = ['icon-task', 'icon-task2', 'icon-task3'];
      return icons[index % 3]
    },
  }
}
</script>

<style lang='scss' scoped>
@import './project.scss';
.instance-item-wrapper {
  .instance-main {
    padding: .15rem .15rem 0;
  }
  .instance-project-container {
    display: flex;
    align-items: center;
    margin-top: .25rem;
    .project_name {
      line-height: .12rem;
      font-size: .12rem;
      &.time-to-wrap {
        flex: 1;
        line-height: .16rem;
      }
    }
    .project_manager {
      display: flex;
      margin-left: .1rem;
      line-height: .12rem;
      font-size: .12rem;
    }
    .project_manager_title {
      color: #999;
    }
    .project_manager_value {
      color: #696969;
    }
  }
  .instance-task-container {
    margin-top: .2rem;
    .instance_task_item {
      display: flex;
      & + .instance_task_item {
        margin-top: .15rem;
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
      width: .5rem;
      height: .5rem;
    }
    .task-detail {
      flex: 1;
      margin-left: .1rem;
      padding-bottom: .15rem;
    }
    .task_name {
      font-size: .14rem;
      line-height: .18rem;
    }
    .task_info {
      display: flex;
      margin-top: .12rem;
      line-height: .12rem;
      font-size: .12rem;
      & + .task_info {
        margin-top: .08rem;
      }
      &.when-is-fill {
        display: block;
        .task_info_item {
          & + .task_info_item {
            margin-left: unset;
            margin-top: .08rem;
          }
        }
      }
    }
    .task_info_item {
      & + .task_info_item {
        margin-left: .1rem;
      }
    }
    .task_info_title {
      color: #999;
    }
    .task_info_amt {
      color: #FA7138;
    }
    .task_info_day {
      color: #696969;
    }
  }
}
</style>
