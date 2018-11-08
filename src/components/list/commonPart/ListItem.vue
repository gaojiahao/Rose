<template>
  <div class="list_item" :class="{visited: item.visited}">

    <!-- 订单 时期 -->
    <div class="duty_top">
      <p class="duty_code">
        {{item.transCode}}
        <span class="duty_crt_man" :class="item.statusClass">{{item.statusName}}</span>
      </p>
      <p class="duty_time">{{item.effectiveTime | dateFormat('YYYY-MM-DD')}}</p>
    </div>
    <!-- 往来信息 -->
    <div class="dealer_part" v-if='item.dealerName'>
      <div class="dealer_name vux-1px-t">
        <div v-if="!isDealer">
          <span class="iconfont icon-gongren2" ></span>{{item.dealerName}}
        </div>
        <div v-else>
          <span class="iconfont icon-kehu1"></span>{{item.dealerName}}
        </div>
        
      </div>
    </div>
    <div class="dealer_part warehouse" v-if="item.inWareHouseName || item.outWareHouseName">
      <div :class="{'vux-1px-t dealer_name': !item.dealerName }">
        <!-- 出库 -->
        <template v-if="item.outWareHouseName">
          <i class="iconfont icon--"></i><span>出库 - {{item.outWareHouseName}}</span>
        </template>
        <!-- 出库和入库同时存在时展示竖线 -->
        <span class="division-line" v-if="item.inWareHouseName && item.outWareHouseName">|</span>
        <!-- 入库，本地库存调拨不展示前面的入库文字 -->
        <template v-if="item.inWareHouseName">
          <i class="iconfont icon--"></i><span>{{!item.transCode.includes('STCK') ? '入库 - ' : ''}}{{item.inWareHouseName}}</span>
        </template>      
      </div>

    </div>
    <!-- 物料图片和名称 -->
    <ul class="duty_matter">
      <li class="duty_matter_item vux-1px-b" :class="{'is-matched-mat': mItem.matchedMat}"
          v-for="(mItem, mIndex) in item.itmes" :key="mIndex" v-if='mIndex<3'>
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
              <p class="price_num" v-if="!noPrice">
                <span class="symbol">￥</span>{{mItem.price | toFixed}}
              </p>
              <p class="mater_count" v-if="!noQty">
                <span class="symbol">x</span>{{mItem.tdQty | toFixed}}
              </p>
            </div>
          </div>
        </div>
      </li>
    </ul>
    <!-- 提示 -->
    <div class="tips_part" v-show="item.itemCount > 3">
      <span class='iconfont icon-shenglvehao'></span>
      <div class="more">
        <span>共 {{item.itemCount}} 条物料，查看更多</span>
        <x-icon type="ios-arrow-right" size="12"></x-icon>
      </div>

    </div>
    <!-- 金额合计 -->
    <div class="order_count">
      <div class="handle_man">
        {{item.handlerName}}<span style="fontSize:.1rem;">[经办人]</span>
      </div>
      <div class="money_part" v-if="!noCount">
        <span class="num">合计:</span>
        <span class="money">
          <span class="symbol" v-if="item.itmes[0].taxAmount">[含税]</span>
          <span class="symbol">￥</span>{{item.count | toFixed | numberComma(3)}}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  import {numberComma, dateFormat} from 'vux'
  import {toFixed} from '@/plugins/calc'

  export default {
    name: "ListItem",
    props: {
      item: {
        type: Object,
        default() {
          return {}
        }
      },
      // 不展示合计
      noCount: {
        type: Boolean,
        default: false
      },
      // 不展示金额
      noPrice: {
        type: Boolean,
        default: false
      },
      // 不展示数量
      noQty: {
        type: Boolean,
        default: false
      },
      isDealer: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {}
    },
    filters: {
      dateFormat,
      numberComma,
      toFixed,
    },
    methods: {
      // TODO 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
    }
  }
</script>

<style scoped lang="scss">
@import '~@/scss/color';
.division-line {
  margin: 0 .02rem;
}
.list_item {
  width: 95%;
  position: relative;
  margin: .1rem auto .2rem;
  border-radius: .08rem;
  box-shadow: 0 2px 10px #e8e8e8;
  transition: background-color 200ms linear;
  &.visited {
    background-color: $list_visited;
  }
  .duty_top {
    height: .24rem;
    line-height: .24rem;
    padding: .04rem .1rem;
    .duty_code { //任务编码
      float: left;
      font-size: .15rem;
      color: #7D7D7D;

      .duty_crt_man { // 任务创建者
        color: #fff;
        padding: .02rem;
        position: relative;
        background: #333;
        font-size: 0.12rem;
        font-weight: bold;
        &:before {    //左尖角
          position: absolute;
          content: "";
          width: 0;
          height: 0;
          top: 0;
          left: -.03rem;
          border-right: .04rem solid #333;
          border-bottom: .04rem solid transparent;
        }
      }
      .duty_done_c {
        background: #53d397;
        &:before {
          border-right: .04rem solid #53d397;
        }
      }
      .duty_doing_c {
        background: #5077aa;
        &:before {
          border-right: .04rem solid #5077aa;
        }
      }
      .duty_fall_c {
        background: #474a56;
        &:before {
          border-right: .04rem solid #474a56;
        }
      }

    }
    //任务创建时间
    .duty_time {
      float: right;
      font-size: .15rem;
      color: #7D7D7D;

    }
  }
  %detailItem {
    width: 100%;
    color: #757575;
    padding: 0 .1rem;
    font-size: .14rem;
    box-sizing: border-box;
    .iconfont {
      font-size: .14rem;
      margin-right: .02rem;
    }
  }
  // 往来
  .dealer_part {
    @extend %detailItem;
    .dealer_name {
      padding: .04rem 0 .02rem;
    }
  }

  /* 仓库 */
  .warehouse {
    @extend %detailItem;
  }

  /* 物料 */
  .duty_matter {
    display: block;
    box-sizing: border-box;
    .duty_matter_item {
      display: flex;
      width: 100%;
      padding: .04rem .1rem .06rem;
      box-sizing: border-box;

      /* 是否为搜索匹配项(物料) */
      &.is-matched-mat {
        background: linear-gradient(to right, #dbe2ef, #ffffff);
      }
      .matter_img {
        width: .6rem;
        height: .6rem;
        margin-top: .04rem;
        border-radius: .04rem;
        display: inline-block;
        img {
          width: 100%;
          max-height: 100%;
        }
      }
      .matter_main {
        width: calc( 100% - .6rem) ;
        margin-left: .1rem;
        .main_top {
          width: 100%;
          display: flex;
          justify-content: space-between;
          .matter_info {
            width: 85%;
            .matter_name {
              color: #111;
              overflow: hidden;
              font-size: .14rem;
              display: -webkit-box;
              word-break: break-all;
              -webkit-line-clamp: 2;
              text-overflow: ellipsis;
              -webkit-box-orient: vertical;
            }
            .matter_units {
              font-size: .1rem;
              color: #7D7D7D;
            }
          }
          .matter_price_part {
            font-size: .12rem;
            text-align: right;
            display: inline-block;
            .price_num {
              // color: #c93d1b;
              font-size: .14rem;
              font-weight: bold;
            }
            .mater_count {
              color: #7D7D7D;
            }
          }
        }
        .main_m {
          color: #7D7D7D;
          font-size: .1rem;
        }
      }
    }
  }
  .tips_part {
    width: 100%;
    display: flex;
    color: #757575;
    font-size: .12rem;
    font-weight: bold;
    position: relative;
    align-items: center;
    box-sizing: border-box;
    padding: .04rem .1rem 0;
    justify-content :flex-end;
    .icon-shenglvehao {
      left: .1rem;
      font-size: .3rem;
      position: absolute;
    }
    .more {
      display: flex;
      align-items: center;
    }
  }
  /* 合计栏 */
  .order_count {
    width: 100%;
    display: flex;
    font-size: .14rem;
    align-items: center;
    padding: .04rem .1rem;
    box-sizing: border-box;
    justify-content: space-between;
    .handle_man {
      color: #7D7D7D;
      font-size: .16rem;
    }
    .num {
      color: #7D7D7D;
    }
    .money {
      font-size: .16rem;
      color: #c93d1b;
      font-weight: bold;
    }
  }

  .symbol {
    font-size: .1rem;
  }

  /* vux组件样式 */
  .vux-1px-t:before,
  .vux-1px-b:after {
    border-color: #E8E8E8;
  }
}
</style>
