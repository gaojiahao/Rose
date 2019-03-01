<template>
  <div class="pages xsbj-list-conatiner" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort"></r-sort>
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
              <div class="project_name" :class="{'time-to-wrap': item.logTitle.length > 15}">标题：{{item.logTitle}}</div>
              <div class="project_manager">
                <span class="project_manager_title">标准工时：</span>
                <span class="project_manager_value">{{item.logDeclarationHours || 0}}</span>
              </div>
            </div>
            <div class="instance-task-container">
              <div class="instance_task_item" v-for="(task, tIndex) in item.detailItem" :key="tIndex">
                <i class="icon" :class="[getTaskIcon(tIndex)]"></i>
                <div class="task-detail">
                  <div class="task_name" v-show="task.taskName">{{task.taskName}}</div>
                  <div class="task_info">
                    <div class="task_info_item">
                      <span class="task_info_title">预算成本：</span>
                      <span class="task_info_amt">￥{{task.budgetCapital_project || 0 | numberComma}}</span>
                    </div>
                    <div class="task_info_item">
                      <span class="task_info_title">周期天数：</span>
                      <span class="task_info_day">{{task.planCycleDays || 0}}天</span>
                    </div>
                  </div>
                  <div class="task_info">
                    <div class="task_info_item">
                      <span class="task_info_title">日期</span>
                      <span class="task_info_day">{{task.expectEndDate_project | dateFormat('YYYY-MM-DD') || '无'}}</span>
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
                <span>经办人：{{item.handlerName}}</span>
              </div>
              <div class="instance_bottom_item instance_mod_time">
                <i class="icon icon-mod-time"></i>
                <span>修改时间：{{item.modTime | dateFormat('YYYY-MM-DD HH:mm')}}</span>
              </div>
            </div>
          </div>
        </div>

        <!--<just-word-item :item="item" v-for="(item, index) in listData" :key="index"
                        noCount @click.native="goDetail(item, index)"></just-word-item>-->
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>
  </div>
</template>

<script>
  import {getList} from 'service/commonService'
  import listCommon from 'pageMixins/bizListCommon'

  export default {
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          }, {
            name: '任务类型',
            value: 'taskType',
          }, {
            name: '项目名称',
            value: 'projectName_project',
          },
        ],
        listViewID: 2326,
      }
    },
    mixins: [listCommon],
    methods: {
      goDetail(item, index) {
        if (this.clickVisited) {
          return
        }
        // 交易号、应用名称等
        let {transCode} = item,
          {name, listId} = this.$route.query,
          {folder, fileName} = this.$route.params;
        // 高亮 点击过的数据
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.listData, index, {...item});
        // 等待动画结束后跳转
        setTimeout(() => {
          this.clickVisited = false;
          this.$router.push({
            path: `/detail/${folder}/${fileName}`,
            query: {name, transCode, listId}
          })
        }, 200)
      },
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
      margin-top: .05rem;
      line-height: .12rem;
      font-size: .12rem;
      & + .task_info {
        margin-top: .08rem;
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
