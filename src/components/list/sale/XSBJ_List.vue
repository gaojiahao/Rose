<template>
  <div class="pages xsbj-list-conatiner" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList'></searchIcon>
        <tab-part @tab-click="tabClick" @sort-click="sortClick"></tab-part>
        <!-- <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listStatus" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.name}}
            </tab-item>
          </tab>
        </div> -->
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)" noQty noCount></list-item>
      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import {getSellOrderList} from 'service/listService'
  import listCommon from 'pageMixins/bizListCommon'
  import TabPart from 'components/TabPart.vue'
  export default {
    data() {
      return {
        listStatus: [{name: '全部', status: ''}, {name: '已生效', status: '已生效'}, {name: '进行中', status: '进行中'}],
        listViewID: 2230,
      }
    },
    mixins: [listCommon],
    components:{
      TabPart
    },
    methods: {
      tabClick(val){
        this.activeTab = val.status;
        this.resetCondition();
        this.getList();
      },
      //排序
      sortClick(val){
        this.sort = [val];
        this.resetCondition();
        this.getList();

      }
    },
    created() {
    }
  }
</script>

<style lang='scss' scoped>
  @import './../../scss/bizList';
</style>
