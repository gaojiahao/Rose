<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
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
          <div class="instance-summary">
            <div class="instance-header">
              <span class="instance_code vux-1px-l">{{item.transCode}}</span>
              <span class="instance_status" :class="item.statusClass">{{item.biStatus}}</span>
            </div>
            <div class="instance-top">
              <span class="instance_dealer">{{item.dealerName}}</span>
              <span class="instance_process_status">{{item.biProcessStatus || '暂无流程'}}</span>
            </div>
            <div class="instance-amt-wrapper">
              <div class="instance_amt">总支付￥{{item.count | numberComma}}</div>
              <div class="instance_count">共{{item.itemCount}}笔</div>
            </div>
          </div>
          <div class="instance-detail vux-1px-t">
            <div class="instance_detail_item" v-for="(detail, index) in item.detailItem">
              <div class="instance_detail_code">协议号: {{detail.transMatchedCode}}</div>
              <div class="instance_detail_amt_wrapper">
                <div class="instance_detail_amt_item">
                  <div class="instance_detail_amt">￥{{detail.thenTotalAmntBal | numberComma}}</div>
                  <div class="instance_detail_title">总金额</div>
                </div>
                <div class="instance_detail_amt_item">
                  <div class="instance_detail_amt">￥{{detail.differenceAmountCopy1 | numberComma}}</div>
                  <div class="instance_detail_title">采购定金</div>
                </div>
                <div class="instance_detail_amt_item">
                  <div class="instance_detail_amt">￥{{detail.applicationAmount | numberComma}}</div>
                  <div class="instance_detail_title">本次申请</div>
                </div>
              </div>
            </div>
            <div class="instance-bottom">
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
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>
  </div>
</template>

<script>
  import listCommon from 'pageMixins/bizListCommon'
  import {getSellOrderList} from 'service/listService'
  // 第三方插件引入
  import {toFixed} from '@/plugins/calc'
  import {accAdd} from '@/home/pages/maps/decimalsAdd'

  export default {
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''},
          {name: '已生效', status: '已生效'},
          {name: '进行中', status: '进行中'}
        ],
        listViewID: 2435,
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          },
          {
            name: '协议号',
            value: 'transMatchedCode',
          },
        ]
      }
    },
    mixins: [listCommon],
    watch: {
      listData: {
        handler(listData) {
          // 此处重新计算 合计金额
          for (let val of listData) {
            val.count = 0;
            for (let item of val.detailItem) {
              val.count = toFixed(accAdd(val.count, item.tdAmountCopy1));
            }
          }
        }
      }

    }
  }
</script>

<style lang='scss' scoped>
  @import "./../../scss/bizList.scss";
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
    .instance-summary {
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
    /* 金额 */
    .instance-amt-wrapper {
      margin-top: .15rem;
      text-align: center;
      .instance_amt {
        color: #fa7138;
        font-size: .24rem;
        font-weight: 600;
      }
      .instance_count {
        line-height: .12rem;
        color: #999;
        font-size: .12rem;
      }
    }
    .instance-detail {
      padding: .15rem;
    }
    .instance_detail_item {
      & + .instance_detail_item {
        margin-top: .25rem;
      }
      .instance_detail_code {
        display: inline-block;
        padding: .04rem .06rem;
        line-height: .14rem;
        border: 1px solid #3296FA;
        border-radius: .12rem;
        color: #3296FA;
        font-size: .12rem;
      }
      .instance_detail_amt_wrapper {
        display: flex;
        justify-content: space-between;
        margin-top: .15rem;
        text-align: center;
      }
      .instance_detail_amt {
        line-height: .12rem;
        font-size: .14rem;
        font-weight: 600;
      }
      .instance_detail_title {
        margin-top: .09rem;
        line-height: .14rem;
        color: #999;
        font-size: .12rem;
      }
    }
    .instance-bottom {
      display: flex;
      align-items: center;
      margin-top: .25rem;
      line-height: .14rem;
      font-size: .12rem;
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
