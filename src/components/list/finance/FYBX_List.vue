<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <slot name="nav"></slot>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :list-id="listId" ref="sort"></r-sort>
        </div>
      </div>
      <r-scroll class="list_wrapper has-sort" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <finance-list-item :item="item" v-for="(item, index) in listData" :key="index" 
                        @click.native="goDetail(item, index)">
          <template slot="costName" slot-scope="{mItem}">
            <span class="name">{{mItem.handlerName}}</span>
          </template>
          <template slot="cost_info" slot-scope="{mItem}">
            <div class="each_amount">
              <span class="money">{{mItem.costName_expCode}}</span>
              <span class="title">费用对象</span>
            </div>
            <div class="each_amount">
              <span class="money">{{mItem.costType_expCode}}</span>
              <span class="title">费用类型</span>
            </div>
            <div class="each_amount">
              <span class="money">￥{{mItem.tdAmount | numberComma}}</span>
              <span class="title">申请金额</span>
            </div>
          </template>
        </finance-list-item>
      </r-scroll>
    </div>
    <add-btn :action="action" :goEdit="goEdit"></add-btn>  
  </div>
</template>

<script>
  import listCommon from 'mixins/bizListCommon'
  import financeListItem from 'components/list/commonPart/financeListItem'
  export default {
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''},
          {name: '已生效', status: '已生效'},
          {name: '进行中', status: '进行中'}
        ],
        listViewID: 2602,
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          }
        ],
      }
    },
    components: {
      financeListItem
    },
    mixins: [listCommon],
    methods: {

    },
    created() {

    }

  }
</script>

<style lang='scss' scoped>
  @import "~scss/biz-app/bizList.scss";
</style>
