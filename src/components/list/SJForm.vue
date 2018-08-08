<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList'></searchIcon>
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
        <div class="each_duty" v-for="(item, index) in listData" :key="index" @click='goDetail(item.transCode)'>
          <!-- 订单 时期 -->
          <div class="duty_top">
            <p class="duty_code">
              {{item.transCode}}
              <span class="duty_crt_man" :class="item.statusClass">{{item.biStatus}}</span>
            </p>
            <p class="duty_time">{{item.effectiveTime}}</p>
          </div>
          <div class="duty_content">{{item.opportunityTitle}}</div>
          <!-- 物料图片和名称 -->
          <!-- <ul class="duty_matter">
            <template v-if="item.itmes.length > 1">
              <li class="duty_matter_item" v-for="(mItem, mIndex) in item.itmes" :key="mIndex">
                <img class="matter_img" :src="mItem.inventoryPic" @error="getDefaultImg(mItem)">
              </li>
            </template>
            <template v-else>
              <li class="duty_matter_item show_one" v-for="(mItem, mIndex) in item.itmes" :key="mIndex">
                <img class="matter_img" :src="mItem.inventoryPic" @error="getDefaultImg(mItem)">
                <div class="matter_name">{{mItem.inventoryName}}</div>
              </li>
            </template>
          </ul> -->
          <!-- 金额合计 -->
          <div class="order_count">
            <div class="handle_man">
              {{item.handlerName}}<span style="fontSize:.1rem;">[报销人]</span>
            </div>
            <div class="money_part">
              <!-- <span class="num">当前所在阶段{{item.currentStage}}</span> -->
              <span class="money">
                <span style="fontSize:.1rem;">￥</span>{{item.tdAmount | numberComma}}
              </span>
            </div>
          </div>
        </div>

      </r-scroll>
    </div>
    <div class=" vux-1px-t btn ">
      <div class="cfm_btn" @click="goEdit">新增一个商机</div>
    </div>
  </div>
</template>

<script>
  import listCommon from './../mixins/bizListCommon'
  import { getSellOrderList,getBusinessList } from 'service/listService'
  import {dateFormat} from 'vux'
  export default {
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''}, 
          {name: '已生效', status: '已生效'}, 
          {name: '进行中', status: '进行中'}
        ],

      }
    },
    mixins: [listCommon],
    methods: {     
      //获取销售订单数据
      getList(noReset = false) {
        return getBusinessList({
          limit: this.limit,
          page: this.page,
          listViewId: 2244,
          biStatus: this.activeTab,
          transCode: this.serachVal,
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          tableContent.forEach(item => {
            this.setStatus(item);
            item.effectiveTime = dateFormat(item.effectiveTime).split(' ')[0];
            // item.count = 0;
            // item.itmes.forEach(mitem=>{
            //   item.count += mitem.tdAmount*100;
            // })
            // item.count = item.count/100;
            // item.itmes = item.itmes.slice(0, 5);
          });
          this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
          if (!noReset) {
            this.$nextTick(() => {
              this.resetScroll();
            })
          }
        }).catch(e => {
          this.resetScroll();
        })
        // return getSellOrderList({
        //   limit: this.limit,
        //   page: this.page,
        //   // start: (this.page - 1) * this.limit,
        //   listViewID: 2236,
        //   // filter: JSON.stringify(filter),
        //   filter: JSON.stringify(filter),
        // }).then(({total = 0, orders = []}) => {
        //   this.hasNext = total > (this.page - 1) * this.limit + orders.length;
        //   orders.forEach(item => {
        //     this.setStatus(item);
        //     item.count = 0;
        //     item.itmes.forEach(mitem=>{
        //       item.count += mitem.tdAmount*100;
        //     })
        //     item.count = item.count/100;
        //     item.itmes = item.itmes.slice(0, 5);
        //   });
        //   this.listData = this.page === 1 ? orders : this.listData.concat(orders);
        //   if (!noReset) {
        //     this.$nextTick(() => {
        //       this.resetScroll();
        //     })
        //   }
        // }).catch(e => {
        //   this.resetScroll();
        // })
      },
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
    },
    filters:{
      dateFormat
    },
    created() {
      
    }

  }
</script>

<style lang='scss' scoped>
  @import "../scss/bizList.scss";
  .duty_content{
    padding: .04rem .1rem;
    color: #7d7d7d;
  }
</style>
