<template>
  <div class="pages" ref='list'>
    <div class='content'>
      <div class="list_top">
        <!-- 搜索栏 -->
        <searchIcon @search='searchList'></searchIcon>
        <div class="filter_part">
          <tab :line-width='2' default-color='#757575' active-color='#2c2727'>
            <tab-item v-for="(item, index) in listView" :key="index" :selected="index === activeIndex"
                      @on-item-click="tabClick(item, index)">{{item.view_name}}
            </tab-item>
          </tab>
        </div>
      </div>
      <r-scroll class="list_wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" @on-pulling-down="onPullingDown"
                ref="bScroll">
        <div class='each_duty' v-for='(item,index) in listData' :key='index' @click="item.status = !item.status">
          <div class="duty_top">
              <!-- 表单状态 及 编码 -->
              <div class="warehouse_info">
                <!-- 状态 -->
                <span class="warehouse warehouse_name" >仓库编码</span>
                <!-- 编码 -->
                <span class="warehouse warehouse_code">{{item.whCode}}</span>
              </div>
              <!-- 时间 -->
              <div class="warehouse_type">
               {{item.warehouseRelType}}
              </div>
          </div>
          <div class='matter'>
            <div class='matter_name'>{{item.inventoryName}}</div>
            <!-- <div class='matter_processing'>
              加工属性 : {{item.invProcessing}}
              <span class='title'>加工属性</span>
              <span class='name'>{{item.invProcessing}}</span>
            </div> -->
            <div class='matter_processing'>
              <!-- 物料编码 -->
              <div class="ForInline" style="display:inline-block">
                <div class="mater_code">
                  <span class="title">加工属性</span>
                  <span class="num">{{item.invProcessing}}</span>
                </div>
              </div>
              <!-- 物料规格 -->
              <!-- <div class="ForInline" style="display:inline-block">
                <div class="mater_spec">
                  <span class="title">规格</span>
                  <span class="num">{{item.specification}}</span>
                </div>
              </div> -->
            </div>
          </div>
          <!-- 收起状态 -->
          <div class='r-arrow vux-1px-t' v-if='!item.status'>
            <x-icon type="ios-arrow-down" size="30" v-if='!item.status'></x-icon>
          </div>
          <!-- 展开状态 -->
          <div class='other_wapper' v-else>
            <div class='duty_other'>
              <div class='each_property' v-for='(sItem,sIndex) in listField' :key='sIndex'>
                {{sItem.text}} : {{item[sItem.field]}}              
              </div>
            </div>
            <div class='r-arrow vux-1px-t'>
              <x-icon type="ios-arrow-up" size="30"></x-icon>
            </div>
          </div>
        </div>
      </r-scroll>
    </div>
  </div>
</template>

<script>
  import { CellFormPreview, Group, Cell } from 'vux'
  import {getListClassfiy} from 'service/kmService.js'
  import listCommon from './../mixins/kmListCommon'
  export default {
    data() {
      return {
        uniqueId : 1400,
        showContent : false

      }
    },
    
    mixins: [listCommon],
    methods: {     

      
    },
    created(){

    }
  }
</script>

<style lang='scss' scoped>
  @import './../scss/SUB/subList';
</style>
