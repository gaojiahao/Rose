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
        <just-word-item :item="item" v-for="(item, index) in listData" :key="index"
                        @click.native="goDetail(item, index)" no-count>
          <template slot="list-item" slot-scope="{item}">
            <div class="each-slot-item" v-for="(val, index) in item.detailItem" :key="index">
              <div class="top-content">汇票号: {{val.draftNumber}}</div>
              <div class="main-content">
                <div class="info_part">
                  承汇类型: {{item.draftType}}
                </div>
                <div class="info_part">
                  承汇人: {{item.accepter}}
                </div>
              </div>
            </div>
          </template>
        </just-word-item>
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
          {name: '全部', status: ''},
          {name: '已生效', status: '已生效'},
          {name: '进行中', status: '进行中'}
        ],
        listViewID: 2508,
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          },
          // {
          //   name: '往来名称',
          //   value: 'dealerName',
          // },
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
  @import "~scss/biz-app/bizList.scss";
</style>
