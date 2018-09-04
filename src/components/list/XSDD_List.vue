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
            <li class="duty_matter_item vux-1px-b" v-for="(mItem, mIndex) in item.itmes" :key="mIndex">
              <div class="matter_img">
                <img :src="mItem.inventoryPic" @error="getDefaultImg(mItem)">
              </div>
              <div class="matter_main">
                <div class="main_top">
                  <div class="matter_info">
                    <div class="matter_name">{{mItem.inventoryName}}</div>
                    <div class="matter_units">
                      <span>编码: {{mItem.inventoryCode}}</span>
                      <span>规格: {{mItem.specification || '无'}}</span>
                    </div>
                    <div class="matter_units">单位: {{mItem.measureUnit}}</div>
                  </div>
                  <div class="matter_price_part">
                    <p class="price_num">
                      <span class="symbol">￥</span>{{mItem.price}}
                    </p>
                    <p class="mater_count"><span class="symbol">x</span>{{mItem.tdQty}}</p>
                  </div>
                </div>
              </div>
            </li>
          </ul>
          <!-- 金额合计 -->
          <div class="order_count">
            <div class="handle_man">
              {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
            </div>
            <div class="money_part">
              <span class="num">合计:</span>
              <span class="money">
                <span style="fontSize:.1rem;">[含税]￥</span>{{item.count | toFixed | numberComma(3)}}
              </span>
            </div>
          </div>
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
  export default {
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''},
          {name: '已生效', status: '已生效'},
          {name: '进行中', status: '进行中'}
        ],
        listViewID : 2190

      }
    },
    mixins: [listCommon],
    methods: {

    }
  }
</script>

<style lang='scss' scoped>
  @import "./../scss/bizList";
</style>
