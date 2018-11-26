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
        <just-word-item :item="item" v-for="(item, index) in listData" :key="index" 
                        conut-title="预期销售额" @click.native="goDetail(item, index)"></just-word-item>
      </r-scroll>
    </div>
    <div class=" vux-1px-t btn" v-if="action.add">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
  import listCommon from 'pageMixins/bizListCommon'
  import {getList} from 'service/listService.js'
  export default {
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''},
          {name: '已生效', status: '已生效'},
          {name: '进行中', status: '进行中'}
        ],
        listViewID :2244,
        biStatus:'',
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          }, {
            name: '商机标题',
            value: 'opportunityTitle',
          },
        ],
      }
    },
    mixins: [listCommon],
    methods:{
      //获取销售订单数据
      getList(noReset = false) {
        let filter = [];
        if(this.activeTab){
          filter = [{operator: "in", value: this.activeTab, property: "biStatus"}];
        }
        if(this.serachVal){
          filter = [
            ...filter,
            {
              operator: "like",
              value: this.serachVal,
              property: this.filterProperty,
            },
          ];
          if(this.activeTab){
            filter[0].attendedOperation = "and";
          }
        }
        return getList(this.listViewID,{
          limit: this.limit,
          page: this.page,
          start : (this.page - 1) * this.limit,
          filter: JSON.stringify(filter),
          sort: JSON.stringify(this.sort)
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          tableContent.forEach(item => {
            this.setStatus(item);
          });
          this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
          //判断最近有无新增数据
          //console.log(this.dataCount);
          let text = '';
          if(noReset && this.activeIndex ===0){
            if(this.total){
              text = dataCount - this.total === 0 ? '暂无新数据' : text = `新增${dataCount-this.total}条数据`;
              this.$vux.toast.show({
                text: text,
                position:'top',
                width:'50%',
                type:"text",
                time : 700
              })
            }
          }
          //列表总数据缓存
          if(this.activeIndex == 0 && this.page ===1){
            sessionStorage.setItem(this.applyCode,dataCount);
          }
          this.$loading.hide();
        }).catch(e => {
          this.resetScroll();
        })
      },
    }
  }
</script>

<style lang='scss' scoped>
  @import "./../../scss/bizList.scss";
</style>
