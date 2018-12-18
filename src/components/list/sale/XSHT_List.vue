<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList' ref="search"></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList" @on-filter="onFilter" :view-id="listViewID" ref="sort"></r-sort>
          <r-tab @on-click="onTabClick"></r-tab>
        </div>
      </div>
      <r-scroll class="list_wrapper has-sort" :class="{'dashboard': chartShow}" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <apply-chart v-if='chartShow'></apply-chart>
        <div class='list' v-else>
          <mater-list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)" ></mater-list-item>
        </div>

      </r-scroll>
    </div>
    <div class="btn vux-1px-t" v-if="!chartShow && action.add">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import listCommon from 'pageMixins/bizListCommon'
  import {getSellOrderList} from 'service/listService'
  import ApplyChart from 'components/list/commonPart/ApplyChart'
  export default {
    data() {
      return {
        listStatus: [
          // {name: '仪表视图', status: '仪表视图'},
          {name: '全部', status: ''},
          {name: '已生效', status: '已生效'},
          {name: '进行中', status: '进行中'}
        ],
        listViewID : 2545,
        chartShow : false,
        hasNext: true,
        scrollOptions: {
          click: true,
          pullDownRefresh: true,
          pullUpLoad: true,
        },
      }
    },
    components:{
      ApplyChart
    },
    mixins: [listCommon],
    methods: {
      ///tab切换
      // tabClick(item, index) {
      //   console.log(item);
      //   switch (item.status) {
      //     case '已生效' :
      //       this.biStatus = '1';
      //       break;
      //     case '进行中' :
      //       this.biStatus = '2';
      //       break;
      //     case '' :
      //       this.biStatus = '';
      //       break;
      //   }
      //   if(index === 0){
      //     this.chartShow = true;
      //     this.hasNext = false;
      //   }
      //   else{
      //     this.chartShow = false;
      //     this.hasNext = true;
      //     this.scrollOptions.pullDownRefresh = true;
      //     this.scrollOptions.pullUpLoad =  true;
      //     this.resetScroll();
      //   }
      //   this.activeIndex = index;
      //   this.activeTab = item.status;
      //   this.resetCondition();
      //   this.getList();
      // }

    }
  }
</script>

<style lang='scss' scoped>
  @import "./../../scss/bizList";
  .dashboard {
    height: calc(100% - 1rem);
  }
</style>
