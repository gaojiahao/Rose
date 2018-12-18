<template>
  <div class="pages xsbj-list-conatiner" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :view-id="listViewID" ref="sort"></r-sort>
          <r-tab @on-click="onTabClick"></r-tab>
        </div>
      </div>
      <r-scroll class="list_wrapper has-sort" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <mater-list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)" noQty noCount></mater-list-item>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t" v-if="action.add">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import {getSellOrderList} from 'service/listService'
  import listCommon from 'pageMixins/bizListCommon'
  export default {
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        listViewID: 2544,
      }
    },
    mixins: [listCommon],
    methods: {
      // tabClick(val){
      //   this.activeTab = val.status;
      //   this.resetCondition();
      //   this.getList();
      // },
      //排序
      // sortClick(val){
      //   this.sort = [val];
      //   this.resetCondition();
      //   this.getList();

      // }
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
</style>
