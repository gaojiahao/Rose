<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
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
          <div class="instance-header">
            <span class="instance_code vux-1px-l">{{item.transCode}}</span>
            <span class="instance_status" :class="item.statusClass">{{item.biStatus}}</span>
          </div>
          <div class="instance-top">
            <span class="instance_dealer">{{item.dealerName}}</span>
            <span class="instance_process_status">{{item.biProcessStatus || '暂无流程'}}</span>
          </div>
          <div class="instance-amt-wrapper">
            <div class="instance_amt_title">预期销售额</div>
            <div class="instance_amt">{{item.tdAmount | numberComma}}</div>
            <div class="instance_amt_info">
              <span>销售人员：{{item.salesPerson || '暂无'}}</span>
              <span>有效期至：{{item.validUntil | dateFormat('YYYY-MM-DD') || '暂无'}}</span>
            </div>
          </div>
          <div class="instance-item vux-1px-b">
            <span class="instance_item_title">标题内容</span>
            <span class="instance_item_value">{{item.opportunityTitle}}</span>
          </div>
          <div class="instance-item vux-1px-b">
            <span class="instance_item_title">分类标签</span>
            <span class="instance_item_value">{{item.categoryLabels || '暂无'}}</span>
          </div>
          <div class="instance-bottom">
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
          },
          {
            name: '客户名称',
            value: 'dealerName_dealerDebit',
          },
        ],
      }
    },
    mixins: [listCommon]
  }
</script>

<style lang='scss' scoped>
  @import "~scss/biz-app/bizList.scss";
  @import '~@/scss/color';

  .instance-item-wrapper {
    color: #333;
    padding: .15rem;
    background: #fff;
    border-radius: 4px;
    margin: .1rem;
    box-sizing: border-box;
    width: calc(100% - .2rem);
    // box-shadow: 0 2px 10px #e8e8e8;
    transition: background-color 200ms linear;
    box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.5);
    &.visited {
      background-color: $list_visited;
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

    .instance-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: .1rem;
      .instance_dealer {
        line-height: .12rem;
        color: #696969;
        font-size: .12rem;
      }
      .instance_process_status {
        padding: .04rem .06rem;
        line-height: .12rem;
        border-radius: 10px;
        background-color: #fff4e6;
        color: #fb880b;
        font-size: .12rem;
      }
    }
    .instance-amt-wrapper {
      margin-top: .15rem;
      padding: .15rem .2rem;
      width: 100%;
      background: url(~assets/bg/bg-amt.png);
      color: #fff;
      background-size: 100% 100%;
      box-sizing: border-box;
      .instance_amt_title {
        line-height: .12rem;
        font-size: .12rem;
      }
      .instance_amt {
        margin-top: .1rem;
        line-height: .36rem;
        font-size: .36rem;
        font-weight: bold;
        text-shadow: 0 2px 4px rgba(16, 140, 213, 1);
      }
      .instance_amt_info {
        display: flex;
        justify-content: space-between;
        margin-top: .15rem;
        line-height: .14rem;
        font-size: .12rem;
      }
    }
    .instance-item {
      display: flex;
      padding: .15rem 0;
      .instance_item_title {
        margin-right: .15rem;
        color: #666;
        line-height: .14rem;
        font-size: .14rem;
      }
      .instance_item_value {
        line-height: .14rem;
        font-size: .14rem;
        font-weight: 600;
      }
    }
    .instance-bottom {
      display: flex;
      align-items: center;
      margin-top: .15rem;
      line-height: .14rem;
      font-size: .12rem;
      .instance_bottom_item {
        display: flex;
        align-items: center;
        color: #999;
      }
      .instance_handler {
        margin-right: .15rem;
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
