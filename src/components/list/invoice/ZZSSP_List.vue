<template>
  <div class="pages" :class="{'no-add': !action.add}" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon :filterList="filterList" @search='searchList'></searchIcon>
        <div class="filter_part">
          <r-sort @on-sort="onSortList"></r-sort>
          <r-tab @on-click="onTabClick"></r-tab>
        </div>
      </div>
      <r-scroll class="list_wrapper has-sort" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <mater-list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)" ></mater-list-item>
      </r-scroll>
    </div>
    <div class=" vux-1px-t btn " v-if="action.add">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import listCommon from 'pageMixins/bizListCommon'
  import {getSellOrderList} from 'service/listService'
  export default {
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''},
          {name: '已生效', status: '已生效'},
          {name: '进行中', status: '进行中'}
        ],
        listViewID: 2417,
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          }, {
            name: '客户名称',
            value: 'dealerName_dealerCodeCredit',
          },
        ],
      }
    },
    mixins: [listCommon],
    methods: {

    },
    created() {

    }

  }
</script>

<style lang='scss' scoped>
  @import "./../../scss/bizList.scss";
  .dealer_part{
    width: 100%;
    // color: #757575;
    padding: 0 .1rem;
    // font-size: .14rem;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    .dealer_name{
      padding: .04rem 0;
      font-weight: bold;

      .iconfont{
        // font-size: .14rem;
        margin-right: .02rem;
      }
    }
}
</style>
