<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <apply-chart v-if='chartShow'></apply-chart>
        <!-- <div class='chart' style="width:100%;" v-if='chartShow'>hahhahalkfhalkfa</div> -->
        <div class='list' v-else>
          <list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)" ></list-item>
        </div>
        
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import listCommon from './../mixins/bizListCommon'
  import {getSellOrderList} from 'service/listService'
  import ApplyChart from 'components/list/commonPart/ApplyChart'
  export default {
    data() {
      return {
        listStatus: [
          {name:'透视图',status:''},
          {name: '全部', status: ''},
          {name: '已生效', status: '已生效'},
          {name: '进行中', status: '进行中'}
        ],
        listViewID : 2190,
        chartShow : true,

      }
    },
    components:{
      ApplyChart
    },
    mixins: [listCommon],
    methods: {

    }
  }
</script>

<style lang='scss' scoped>
  @import "./../scss/bizList";
</style>
