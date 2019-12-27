
<template>
  <div class="pages xmlx-list-container" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <slot name="nav"></slot>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort" :hasFormStatus="false"></r-sort>
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
            <div class="instance-project-type">
              <span class="text">{{item.projectType_projectApprovalId}}</span>
              <span class="instance_process_status">{{item.biProcessStatus || '暂无流程'}}</span>
            </div>
            <div class="instance-project-container">
              <i class="icon-project"></i>
              <div class="instance_project_detail">
                <div class="project_detail_top">
                  <div class="project_name">{{item.projectName_projectApprovalId}}</div>
                  <div class="project_detail_amt">
                    <div class="amt">
                      <span class="symbol">￥</span>{{item.budgetIncome_projectApprovalId | numberComma}}
                    </div>
                    <div class="text">收入</div>
                  </div>
                </div>
                <div class="project_detail_bottom">
                  <div>
                    <div class="project_detail_item">
                      <span class="project_detail_title">项目经理：</span>
                      <span class="project_detail_value">{{item.dealerName_dealerDebit}}</span>
                    </div>
                    <div class="project_detail_item">
                      <span class="project_detail_title">经理电话：</span>
                      <span class="project_detail_value">{{item.phoneNumber_projectApprovalId || '无'}}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="instance-bottom vux-1px-t">
            <div class="instance-bottom-wrapper">
              <div class="instance_bottom_item instance_handler" :class="{'when-is-more' : item.handlerName.length > 3 }">
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
          name: '项目名称',
          value: 'projectName_projectApprovalId',
        },
      ],
    }
  },
  mixins: [listCommon],
}
</script>

<style lang='scss' scoped>
@import './project.scss';
.instance-item-wrapper {
  .instance-main {
    padding: .15rem;
  }
  .instance-project-type {
    width: 100%;
    display: flex;
    color: #696969;
    font-size: .14rem;
    margin-top: .15rem;
    align-items: center;
    justify-content: space-between;
    .text {
      z-index: 10;
      position: relative;
      display: inline-block;
      padding: .02rem .06rem;
      &:before {
        top: 0;
        left: 0;
        content: '';
        z-index: -1;
        width: 100%;
        height: 100%;
        position: absolute;
        border-radius: 4px;
        transform: skewX(-10deg);
        background-color: #e6e6e6;
      }
    }
  }
  .instance-project-container {
    display: flex;
    align-items: flex-start;
    margin-top: .15rem;
    .icon-project {
      width: .5rem;
      height: .5rem;
    }
    .instance_project_detail {
      flex: 1;
      margin-left: .1rem;
    }
    .project_detail_top {
      display: flex;
      justify-content: space-between;
    }
    .project_name {
      flex: 1;
      margin-bottom: .15rem;
      line-height: .18rem;
      font-size: .14rem;
    }
    .project_detail_amt {
      color: #FA7138;
      font-size: .2rem;
      text-align: center;
    }
    .amt {
      line-height: .2rem;
    }
    .symbol {
      line-height: .12rem;
      font-size: .14rem;
    }
    .text {
      margin-top: .05rem;
      line-height: .12rem;
      color: #999;
      font-size: .12rem;
    }

    .project_detail_bottom {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .project_detail_item {
      line-height: .12rem;
      font-size: .12rem;
      & + .project_detail_item {
        margin-top: .1rem;
      }
    }
    .project_detail_title {
      color: #999;
    }
    .project_detail_value {
      color: #696969;
    }
    .project_profit {
      line-height: .12rem;
      color: #999;
      font-size: .1rem;
      .value {
        color: #FA7138;
        font-size: .12rem;
      }
    }
  }
}
</style>
