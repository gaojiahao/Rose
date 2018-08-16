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
                <span class="warehouse warehouse_code">{{item.warehouseName}}</span>
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
              <div class="ForInline" style="display:inline-block">
                <div class="mater_spec">
                  <span class="title">规格</span>
                  <span class="num">{{item.specification}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class='r-arrow vux-1px-t' v-if='!item.status'>
            <x-icon type="ios-arrow-down" size="30" v-if='!item.status'></x-icon>
          </div>
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
.content {
  width: 100%;
  height: 100%;
  overflow: auto;
}

.list_top {
  width: 100%;
  padding-top: .1rem;
  // 过滤
  .filter_part {
    margin-top: .04rem;
  }
}

.list_wrapper {
  position: relative;
  height: calc(100% - .52rem);
  overflow: hidden;
  box-sizing: border-box;
  .each_duty {
    width: 95%;
    margin: .1rem auto .2rem;
    position: relative;
    padding: .06rem .08rem .04rem;
    box-shadow: 0 2px 10px #e8e8e8;
    box-sizing: border-box;
    .duty_top{
      display: flex;
      justify-content: space-between;
      align-items: center;
      .warehouse_info{
        display: flex;
        .warehouse{
          font-weight: bold;
          font-size: .14rem;
          padding: 0 .06rem;
        }
        .warehouse_name{
          color: #fff;
          background: #3f72af;
          border-top-left-radius: .12rem;
        }
        .warehouse_code{
          color: #111;
          background: #dbe2ef;
        }
        
      }
      .warehouse_type{
          font-size: .14rem;
          color: #757575;
        }
    }
    .matter{
      padding:0.06rem 0;
      .matter_processing{
        .mater_code{
          display: flex;
          margin-right: .1rem;
          font-weight: 200;
          span{
            font-size: .1rem;
            display: inline-block;
            padding: .01rem .04rem;
          }
          .title{
            color: #fff;
            background: #3f72af;
          }
          .num{
            color: #111;
            max-width: .9rem;
            overflow: hidden;
            white-space: nowrap;
            background: #dbe2ef;
          }
        }
        .mater_spec{
          display: flex;
          font-weight: 200;
          span{
            font-size: .1rem;
            display: inline-block;
            padding: .01rem .04rem;
          }
          .title{
            color: #fff;
            background: #537791;
          }
          .num{
            color: #fff;
            max-width: .6rem;
            background: #ff7f50;
            overflow: hidden;
            white-space: nowrap;
          }
        }
        // color: #fff;
        // background: #537791;
        // font-size: .12rem;
        // padding: .01rem .04rem;
      }
      .matter_name{
        font-size:0.18rem;
      }
    }
    .r-arrow{
      text-align: center;
      height: 30px;
    }
    .duty_other{
      display: flex;
      flex-wrap: wrap;
      .each_property{
        min-width:50%;
        line-height: 0.24rem;
        font-size:0.12rem;
        color: rgb(117, 117, 117);
      }

    }
    .other_wapper{
      border-top:1px dashed #C7C7C7;
    }
  }
  
}
</style>
