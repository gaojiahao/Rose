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
      <r-scroll class="list_wrapper " :class="{'dashboard': chartShow}" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <apply-chart v-if='chartShow'></apply-chart>
        <div class='list' v-else>
          <mater-list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)" ></mater-list-item>
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
      listStatus: [
        // {name: '仪表视图', status: '仪表视图'},
        {name: '全部', status: ''},
        {name: '已生效', status: '已生效'},
        {name: '进行中', status: '进行中'}
      ],
      listViewID : 2568,
      chartShow : false,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullDownRefresh: true,
        pullUpLoad: true,
      },
      sortList: [
        {name: '交易号', key: 'transCode'},
        {name: '修改时间', key: 'modTime'},
        {name: '客户名称', key: 'dealerName'},
      ]
    }
  },
  mixins: [listCommon]
}
</script>

<style lang='scss' scoped>
  @import "~scss/biz-app/bizList";
  .dashboard {
    height: calc(100% - 1rem);
  }
</style>
