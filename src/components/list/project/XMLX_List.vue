<template>
  <div class="pages xmlx-list-container" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :view-id="listViewID" ref="sort"></r-sort>
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
              <span class="text">{{item.projectType_project}}</span>
            </div>
            <div class="instance-project-container">
              <i class="icon-project"></i>
              <div class="instance_project_detail">
                <div class="project_detail_top">
                  <div class="project_name">{{item.projectName_project}}</div>
                  <div class="project_detail_amt">
                    <div class="amt">
                      <span class="symbol">￥</span>{{item.budgetIncome_project | numberComma}}
                    </div>
                    <div class="text">收入</div>
                  </div>
                </div>
                <div class="project_detail_bottom">
                  <div>
                    <div class="project_detail_item">
                      <span class="project_detail_title">项目经理：</span>
                      <span class="project_detail_value">{{item.projectManager_project}}</span>
                    </div>
                    <div class="project_detail_item">
                      <span class="project_detail_title">经理电话：</span>
                      <span class="project_detail_value">{{item.phoneNumber_project || '无'}}</span>
                    </div>
                  </div>
                  <div class="project_profit">利润率：<span class="value">{{item.budgetProfitMargin_project | percent}}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div class="instance-bottom vux-1px-t">
            <div class="instance-bottom-wrapper">
              <div class="instance_bottom_item instance_handler">
                <i class="icon icon-handler"></i>
                <span>经办人：{{item.handlerName}}</span>
              </div>
              <div class="instance_bottom_item instance_mod_time">
                <i class="icon icon-mod-time"></i>
                <span>修改时间：{{item.modTime | dateFormat('YYYY-MM-DD')}}</span>
              </div>
            </div>
          </div>
        </div>

        <!--<just-word-item :item="item" v-for="(item, index) in listData" :key="index"
                        conutTitle="收入" @click.native="goDetail(item, index)"></just-word-item>-->
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>
  </div>
</template>

<script>
  import {getList} from 'service/commonService'
  import listCommon from 'pageMixins/bizListCommon'
  // 方法引入
  import {accMul} from '@/home/pages/maps/decimalsAdd'

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
            name: '项目名称',
            value: 'projectName_project',
          },
        ],
        listViewID: 2301,
      }
    },
    mixins: [listCommon],
    filters: {
      // TODO 转为百分比
      percent(val) {
        if (!val && val !== 0) {
          return '无';
        }
        let budget = accMul(val,100);
        return `${budget}%`;
      },
    },
    methods: {
      goDetail(item, index) {
        if (this.clickVisited) {
          return
        }
        // 交易号、应用名称等
        let {transCode} = item,
          {name} = this.$route.query,
          {fileId, listId} = this.$route.params;
        // 高亮 点击过的数据
        this.clickVisited = true;
        item.visited = true;
        this.$set(this.listData, index, {...item});
        // 等待动画结束后跳转
        setTimeout(() => {
          this.clickVisited = false;
          this.$router.push({
            path: `/detail/${fileId}/${listId}`,
            query: {name, transCode}
          })
        }, 200)
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
  @import '~@/scss/color';

  .instance-item-wrapper {
    margin: .1rem;
    width: calc(100% - .2rem);
    border-radius: 4px;
    background-color: #fff;
    color: #333;
    transition: background-color 200ms linear;
    box-sizing: border-box;
    box-shadow: 0 2px 10px 0 rgba(228, 228, 232, 0.5);
    &.visited {
      background-color: $list_visited;
    }
    .instance-main {
      padding: .15rem;
    }
    .instance-header {
      display: flex;
      justify-content: space-between;
      .instance_code {
        position: relative;
        left: -.15rem;
        padding-left: .14rem;
        line-height: .12rem;
        font-size: .12rem;
        &:before {
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }
      .instance_status {
        font-size: .12rem;
        line-height: .12rem;
      }
    }
    .duty_done_c {
      color: #3296FA;
    }
    .duty_doing_c {
      color: #333;
    }
    .duty_fall_c {
      color: #999;
    }

    .instance-project-type {
      position: relative;
      display: inline-block;
      margin-top: .15rem;
      color: #696969;
      font-size: .14rem;
      .text {
        position: relative;
        z-index: 2;
        display: inline-block;
        padding: .02rem .06rem;
      }
      &:after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        background-color: #e6e6e6;
        transform: skewX(-10deg);
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

    .instance-bottom {
      padding: .15rem;
      line-height: .14rem;
      font-size: .12rem;
      .instance-bottom-wrapper {
        display: flex;
        align-items: center;
        padding: .07rem .1rem;
        background-color: #f7f7f7;
        border-radius: .2rem;
      }
      .instance_bottom_item {
        display: flex;
        align-items: center;
        color: #999;
      }
      .instance_handler {
        margin-right: .3rem;
      }
      .icon {
        display: inline-block;
        margin-right: .05rem;
        width: .16rem;
        height: .16rem;
      }
    }
  }
</style>
