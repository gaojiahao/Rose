<!--
 * @Descripttion: 
 * @version: 1.0.0
 * @Author: Gabriel.gaojiahao
 * @Date: 2019-09-17 17:04:27
 * @LastEditors  : Gabriel.gaojiahao
 * @LastEditTime : 2020-01-10 11:32:35
 -->
<template>
  <div class="pages" :class="{'no-add': false}" ref="list">
    <div class="content">
      <slot name="nav"></slot>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search="searchList" ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort" :filterFieldSettings="filterFieldSettings"></r-sort>
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
        <ListItem
          :item="item"
          :fieldsObj="fieldsObj"
          v-for="(item, index) in listData"
          :key="index"
          @click.native="goDetail(item, index)"
          :class="{'list-item-last':listData.length-1===index}"
        ></ListItem>
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
          name: "客户名称",
          value: "dealerName_dealerCodeCredit"
        }
      ]
    };
  },
  mixins: [listCommon],
  methods: {},
  created() {
  }
};
</script>

<style lang='scss' scoped>
@import "~scss/biz-app/bizList.scss";
.dealer_part {
  width: 100%;
  // color: #757575;
  padding: 0 0.1rem;
  // font-size: .14rem;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  .dealer_name {
    padding: 0.04rem 0;
    font-weight: bold;

    .iconfont {
      // font-size: .14rem;
      margin-right: 0.02rem;
    }
  }
}
.list-item-last{
  margin-bottom: .78rem;
}
</style>