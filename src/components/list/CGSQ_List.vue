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
              <span class="duty_crt_man" :class="item.statusClass">{{item.statusName}}</span>
            </p>
            <p class="duty_time">{{item.effectiveTime | filterTime}}</p>
          </div>
          <!-- 物料图片和名称 -->
          <ul class="duty_matter">
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
          </ul>
          <!-- 金额合计 -->
          <div class="order_count">
            <div class="handle_man">
              {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
            </div>
            <div class="money_part">
              <span class="num">共{{item.itmes.length}}件物料：</span>
              <span class="money">
                <span style="fontSize:.1rem;">￥</span>{{item.count | numberComma(3)}}
              </span>
            </div>
          </div>
        </div>

      </r-scroll>
    </div>
    <div class="btn vux-1px-t">
      <div class="cfm_btn" @click="goEdit">新增一个申请</div>
    </div>
  </div>
</template>

<script>
  import listCommon from './../mixins/bizListCommon'
  import {getSellOrderList} from 'service/listService'
  export default {
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''}, 
          {name: '已生效', status: '已生效'}, 
          {name: '进行中', status: '进行中'}
        ],
        listViewID: 2208,

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
  @import "./../scss/bizList";
</style>
