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
      <r-scroll class="list_wrapper " :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <mater-list-item :item="item" v-for="(item, index) in listData" :key="index" @click.native="goDetail(item, index)"></mater-list-item>
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
        listViewID: 2476,
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, 
          {
            name: '经办人',
            value: 'handlerName',
          }, 
          {
            name: '设备名称',
            value: 'facilityName_facilityObjCode',
          }
        ]
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
  @import "~scss/biz-app/bizList";
</style>
