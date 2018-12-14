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
      <r-scroll class="list_wrapper has-sort" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <just-word-item :item="item" v-for="(item, index) in listData" :key="index"
                        @click.native="goDetail(item, index)" conutTitle='支付合计'>
          <template slot="list-item" slot-scope="{item}">
            <div class="each-slot-item" v-for="(val, index) in item.detailItem" :key="index">
              <div class="top-content">协议号: {{val.transMatchedCode}}</div>
              <div class="main-content">
                <div class="info_part">
                  总金额: ￥{{val.thenTotalAmntBal | numberComma}}
                </div>
                <div class="info_part">
                  采购定金: ￥{{val.differenceAmountCopy1 | numberComma}}
                </div>
                <div class="info_part different_type">
                  本次申请: ￥{{val.applicationAmount | numberComma}}
                </div>
              </div>
            </div>
          </template>
        </just-word-item>
      </r-scroll>
    </div>
    <div class=" vux-1px-t btn " v-if="action.add">
      <div class="cfm_btn" @click="goEdit">新增</div>
    </div>
  </div>
</template>

<script>
import listCommon from 'pageMixins/bizListCommon'
import { getSellOrderList } from 'service/listService'
// 第三方插件引入
import { toFixed } from '@/plugins/calc'
import { accAdd, accMul } from '@/home/pages/maps/decimalsAdd'
  export default {
    data() {
      return {
        listStatus: [
          {name: '全部', status: ''},
          {name: '已生效', status: '已生效'},
          {name: '进行中', status: '进行中'}
        ],
        listViewID: 2435,
        filterList: [ // 过滤列表
          {
            name: '交易号',
            value: 'transCode',
          }, {
            name: '经办人',
            value: 'handlerName',
          },
           {
            name: '协议号',
            value: 'transMatchedCode',
          },
        ]
      }
    },
    mixins: [listCommon],
    watch: {
      listData: {
        handler(listData) {
          // 此处重新计算 合计金额
          for(let val of listData) {
            val.count = 0;
            for(let item of val.detailItem) {
              val.count = toFixed(accAdd(val.count, item.tdAmountCopy1));
            }
          } 
        }
      }
      
    }
  }
</script>

<style lang='scss' scoped>
  @import "./../../scss/bizList.scss";
</style>
