<template>
  <div class="mater-list-item" :class="{visited: item.visited}">
    <!-- 往来，流畅状态-->
    <div class="dealer_part vux-1px-b" v-show="item.dealerName">
      <div class="order_dealer">
        <span class="icon-dealer"></span>
        <span class="dealer_name">{{item.dealerName}}</span>
      </div>
      <div class="order_biProStatus">{{item.processStatus || "暂未指定流程状态"}}</div>
    </div>
    <div class="order_main vux-1px-b" :class="{'has_margin' : noCount}">
      <!-- 订单 时期 -->
      <div class="duty_top">
        <div class="duty_code">
          <div class="code">
            <span class="icon-code"></span>
            <span>订单编号： {{item.transCode}}</span>
          </div>
          <div class="order_status">状态： <span :class="item.statusClass">{{item.biStatus}}</span></div> 
        </div>
        <div class="duty_creator">
          <p class="order_handler">经办人： {{item.handlerName}}</p>
          <p class="mod_time">修改时间： {{item.modTime}}</p>
        </div>
      </div>
      <!-- <div class="dealer_part warehouse" v-if="item.warehouseName_containerCode || item.warehouseName_containerCodeOut">
        <div :class="{'vux-1px-t dealer_name': !item.dealerName }"> -->
          <!-- 出库 -->
          <!-- <template v-if="item.warehouseName_containerCodeOut">
            <i class="iconfont icon--"></i><span>出库 - {{item.warehouseName_containerCodeOut}}</span>
          </template> -->
          <!-- 出库和入库同时存在时展示竖线 -->
          <!-- <span class="division-line" v-if="item.warehouseName_containerCode && item.warehouseName_containerCodeOut">|</span> -->
          <!-- 入库，本地库存调拨不展示前面的入库文字 -->
          <!-- <template v-if="item.warehouseName_containerCode">
            <i class="iconfont icon--"></i><span>{{!item.transCode.includes('STCK') ? '入库 - ' : ''}}{{item.warehouseName_containerCode}}</span>
          </template>       -->
        <!-- </div>

      </div> -->
      <!-- 物料图片和名称 -->
      <ul class="duty_matter">
        <li class="duty_matter_item" :class="{'is-matched-mat': mItem.matchedMat}"
            v-for="(mItem, mIndex) in item.detailItem" :key="mIndex" v-if='mIndex<3'>
          <div class="matter_img">
            <img :src="mItem.inventoryPic" @error="getDefaultImg(mItem)">
          </div>
          <div class="matter_main" :class="{'vux-1px-b': mIndex < item.detailItem.length-1}">
            <div class="main_top">
              <div class="matter_name">{{mItem.inventoryName}}</div>
              <div class="matter_units">
                <div>
                  <p>编码: {{mItem.inventoryCode}}</p>
                  <p>
                    <span>规格: {{mItem.specification_outPutMatCode || mItem.specification || '无'}}</span>
                    <span>单位: {{mItem.measureUnit_outPutMatCode || mItem.measureUnit || '无'}}</span>
                  </p>
                </div>
                <div class="matter_num_part">
                  <p class="mater_count" v-if="!noQty && mItem.assistQty != null">
                    <span class="symbol">x</span>{{mItem.assistQty | toFixed}}
                  </p>
                  <p class="mater_count" v-if="!noQty && mItem.assistQty == null">
                    <span class="symbol">x</span>{{ mItem.tdQty | toFixed}}
                  </p>
                </div>
                
              </div>  
              <div class="matter_price_part" v-if="!noPrice">
                <span class="symbol">￥</span>{{mItem.price | toFixed}}
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <!-- 金额合计 -->
    <div class="order_count">
      <div class="num">
        <span>共{{item.itemCount}}类商品</span>
        <span v-show="item.totalQty">合计{{item.totalQty}}件</span>
      </div>
      <div class="money" v-if="!noCount">
        价税小计：<span class="symbol">￥</span><span class="tdAmount">{{item.count | toFixed | numberComma(3)}}</span>
      </div>
    </div>
    <!-- 提示 -->
    <div class="tips_part" v-show="item.itemCount > 3">      
      <span>查看全部 {{item.itemCount}} 条信息</span>
    </div>

  </div>
</template>

<script>
  import {numberComma, dateFormat} from 'vux'
  import {toFixed} from '@/plugins/calc'

  export default {
    name: "materListItem",
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
      },
      // 工序是否存在多个组长,若是存在则不显示dealer
      isMoreDealer: {
        type: Boolean,
        default: false
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
.mater-list-item {
  // width: 95%;
  position: relative;
  overflow: hidden;
  margin-top: .1rem;
  background: #fff;
  box-sizing: border-box;
  font-size: .12rem;
  transition: background-color 200ms linear;
  &.visited {
    background-color: $list_visited;
  }
  .dealer_part {
    height: .44rem;
    padding: 0 .15rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    font-size: .12rem;
    // 往来名称
    .order_dealer {
      display: flex;
      align-items: center;
      .icon-dealer {
        width: .14rem;
        height: .13rem;
      }
      .dealer_name {
        color: #333;
        margin-left: .1rem;
      }
    }
    // 流畅状态
    .order_biProStatus{
      padding: .04rem .06rem;
      color: #FB880B;
      background: #FFF4E6;
      border-radius: .1rem;
      line-height: .12rem;
    }
  }
  .order_main {
    padding: 0 .15rem;
    &.has_margin{
      padding-bottom: .1rem;
    }
  }
  .duty_top {
    overflow: hidden;
    // 订单编码
    .duty_code {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #333;
      margin: .12rem 0 .07rem 0;
      .code{
        display: flex;
        align-items: center;
        .icon-code {
          width: .14rem;
          height: .14rem;
          margin-right: .08rem;
        }
      }
      .duty_done_c {
        color: #3296FA;
      }
      .duty_fall_c {
        color: #999;
      }
      
    }
    // 经办人，修改时间
    .duty_creator {
      display: flex;
      color: #999;
      padding-left: .22rem;
      .order_handler {
        margin-right: .07rem;
      }
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
  /* 仓库 */
  .warehouse {
    @extend %detailItem;
  }

  /* 物料 */
  .duty_matter {
    display: block;
    box-sizing: border-box;
    .duty_matter_item {
      width: 100%;
      display: flex;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      /* 是否为搜索匹配项(物料) */
      &.is-matched-mat {
        background: linear-gradient(to right, #dbe2ef, #ffffff);
      }
      .matter_img {
        width: .95rem;
        height: .95rem;
        display: inline-block;
        margin-top: .15rem;
        img {
          width: 100%;
          max-height: 100%;
        }
      }
      .matter_main {
        flex: 1;
        margin-left: .1rem;
        padding: .15rem  0;
        position: relative;
        .main_top {
          .matter_name {
            color: #333;
            font-size: .14rem;
            line-height: .19rem;
          }
          .matter_units {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: .08rem;
            color: #999;
            p{
              line-height: .17rem;
              span{
                margin-right: .02rem;
              }
            }
          }
          .matter_price_part {
            font-size: .14rem;
            color: #333;
            margin-top: .12rem;
            
          }
          .matter_num_part {
            color: #999;
            // position: absolute;
            // bottom: .45rem;
            // right: 0;
          }
        }
      }
    }
  }
  .tips_part {
    color: #318EFF;
    box-sizing: border-box;
    padding: .01rem 0 .15rem 0;
    text-align: center;
  }
  /* 合计栏 */
  .order_count {
    width: 100%;
    height: .5rem;
    display: flex;
    padding: 0 .15rem;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    font-weight: bold;
    color: #696969;
    .money {
      .tdAmount {
        font-size: .16rem;
        color: #FA7138;
      }
      .symbol {
        color: #FA7138;
      }
    }
  }

  /* vux组件样式 */
  .vux-1px-t:before,
  .vux-1px-b:after {
    border-color: #E8E8E8;
  }
}
</style>
