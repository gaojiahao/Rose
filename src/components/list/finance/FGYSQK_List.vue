<template>
  <!-- 付供应商欠款 -->
  <div class="pages" :class="{'no-add': !action.add}" ref="list">
    <div class="content">
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search="searchList" ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort"></r-sort>
          <!--<r-tab @on-click="onTabClick"></r-tab>-->
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
            <div
              class="instance_detail_item"
              v-for="(detail, index) in item.detailItem"
              :key="index"
            >
              <div class="instance_detail_code">收票号: {{detail.transMatchedCode}}</div>
              <div class="instance_detail_amt_wrapper">
                <div class="instance_detail_amt_item">
                  <div class="instance_detail_amt">￥{{detail.applicationAmount | numberComma}}</div>
                  <div class="instance_detail_title">本次申请</div>
                </div>
                <div class="instance_detail_amt_item">
                  <div class="instance_detail_amt">￥{{detail.tdAmount | numberComma}}</div>
                  <div class="instance_detail_title">本次支付</div>
                </div>
                <!-- <div class="instance_detail_amt_item">
                  <div class="instance_detail_amt">￥{{detail.differenceAmount | numberComma}}</div>
                  <div class="instance_detail_title">余额</div>
                </div> -->
              </div>
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
        </div>
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>
  </div>
</template>

<script>
import listCommon from "mixins/bizListCommon";
export default {
  data() {
    return {
      listStatus: [
        { name: "全部", status: "" },
        { name: "已生效", status: "已生效" },
        { name: "进行中", status: "进行中" }
      ],
      listViewID: 2433,
      filterList: [
        // 过滤列表
        {
          name: "交易号",
          value: "transCode"
        },
        {
          name: "经办人",
          value: "handlerName"
        }
        // {
        //   name: '供应商',
        //   value: 'dealerName',
        // },
      ]
    };
  },
  mixins: [listCommon],
  methods: {},
  created() {}
};
</script>

<style lang='scss' scoped>
@import "~scss/biz-app/bizList.scss";

.instance-item-wrapper {
  margin: 0.1rem;
  width: calc(100% - 0.2rem);
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
    padding: 0.15rem;
  }
  .instance-header {
    display: flex;
    justify-content: space-between;
    .instance_code {
      position: relative;
      left: -0.15rem;
      padding-left: 0.14rem;
      line-height: 0.12rem;
      font-size: 0.12rem;
      &:before {
        width: 0.08rem;
        border-left: 0.08rem solid #3296fa;
      }
    }
    .instance_status {
      font-size: 0.12rem;
      line-height: 0.12rem;
    }
  }
  .duty_done_c {
    color: #3296fa;
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
    margin-top: 0.1rem;
    .instance_dealer {
      line-height: 0.12rem;
      color: #696969;
      font-size: 0.12rem;
    }
    .instance_process_status {
      padding: 0.04rem 0.06rem;
      line-height: 0.12rem;
      border-radius: 10px;
      background-color: #fff4e6;
      color: #fb880b;
      font-size: 0.12rem;
    }
  }
  /* 金额 */
  .instance-amt-wrapper {
    margin-top: 0.15rem;
    text-align: center;
    .instance_amt {
      color: #fa7138;
      font-size: 0.24rem;
      font-weight: 600;
    }
    .instance_count {
      line-height: 0.12rem;
      color: #999;
      font-size: 0.12rem;
    }
  }
  .instance-detail {
    padding: 0.15rem;
  }
  .instance_detail_item {
    & + .instance_detail_item {
      margin-top: 0.25rem;
    }
    .instance_detail_code {
      display: inline-block;
      padding: 0.04rem 0.06rem;
      line-height: 0.14rem;
      border: 1px solid #3296fa;
      border-radius: 0.12rem;
      color: #3296fa;
      font-size: 0.12rem;
    }
    .instance_detail_amt_wrapper {
      display: flex;
      justify-content: space-between;
      margin-top: 0.15rem;
      text-align: center;
    }
    .instance_detail_amt {
      line-height: 0.12rem;
      font-size: 0.14rem;
      font-weight: 600;
    }
    .instance_detail_title {
      margin-top: 0.09rem;
      line-height: 0.14rem;
      color: #999;
      font-size: 0.12rem;
    }
  }
  .instance-bottom {
    display: flex;
    align-items: center;
    margin-top: 0.25rem;
    line-height: 0.14rem;
    font-size: 0.12rem;
    .instance_bottom_item {
      display: flex;
      align-items: center;
      color: #999;
    }
    .instance_handler {
      margin-right: 0.15rem;
    }
    .icon {
      display: inline-block;
      margin-right: 0.05rem;
      width: 0.16rem;
      height: 0.16rem;
    }
  }
}
</style>
