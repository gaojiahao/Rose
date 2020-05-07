<template>
  <div class="pages cpxq-list-container" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <slot name="nav"></slot>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort" :hasFormStatus="false"></r-sort>
        </div>
      </div>
      <r-scroll class="list_wrapper has-sort" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class="instance-item-wrapper" v-for="(item, index) in listData" @click="goDetail(item, index)"
             :class="{visited: item.visited}" :key="index">
          <div class="instance-header">
            <span class="instance_code vux-1px-l">{{item.transCode}}</span>
            <span class="instance_status" :class="item.statusClass">{{item.biStatus}}</span>
          </div>
          <div class="instance-main">
            <i class="icon icon-light"></i>
            <div class="instance_info_wrapper">
              <div class="instance_header_wrapper">
                <span class="instance_header">{{item.demandTitle}}</span>
                <span class="instance_process_status">{{item.biProcessStatus || '暂无流程'}}</span>
              </div>
              <div class="instance_detail">
                <div class="instance_detail_item">
                  <i class="icon icon-handler"></i>
                  <span>经办人：{{item.handlerName}}</span>
                </div>
                <div class="instance_detail_item">
                  <i class="icon icon-mod-time"></i>
                  <span>修改时间：{{item.modTime | dateFormat('YYYY-MM-DD HH:mm')}}</span>
                </div>
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
  mixins: [listCommon],
  data() {
    return {
      filterList: [ // 过滤列表
        {
          name: '经办人',
          value: 'handlerName',
        },{
          name: '交易号',
          value: 'transCode',
        },
        {
          name: '标题',
          value: 'demandTitle',
        },
      ],
    }
  },
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizList';
  .instance-item-wrapper {
    color: #333;
    padding: .15rem;
    background: #fff;
    border-radius: 4px;
    margin: .1rem;
    box-sizing: border-box;
    width: calc(100% - .2rem);
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

    .instance-main {
      display: flex;
      margin-top: .2rem;
      .icon {
        display: inline-block;
        width: .5rem;
        height: .5rem;
      }
      .instance_info_wrapper {
        flex: 1;
        margin-left: .12rem;
      }
      .instance_header_wrapper {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .instance_header {
        flex: 1;
        line-height: .18rem;
        font-size: .14rem;
        font-weight: 600;
      }
      .instance_process_status {
        margin-left: .22rem;
        padding: .04rem .05rem;
        line-height: .12rem;
        border: 1px solid #FB880B;
        border-radius: .04rem;
        color: #FB880B;
        font-size: .1rem;
        font-weight: 500;
      }

      .instance_detail {
        margin-top: .1rem;
        .icon {
          margin-right: .05rem;
          width: .12rem;
          height: .12rem;
        }
      }
      .instance_detail_item {
        display: flex;
        align-items: center;
        line-height: .12rem;
        color: #999;
        font-size: .12rem;
        & + .instance_detail_item {
          margin-top: .07rem;
        }
      }
    }
  }
</style>
