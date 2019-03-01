<template>
  <div class="mater-list-item" :class="{visited: item.visited}">
    <!-- 往来，流畅状态-->
    <div class="dealer-part" v-show="item.dealerName">
      <div class="order_dealer">
        <span class="icon-dealer"></span>
        <span class="dealer_name">{{item.dealerName}}</span>
      </div>
      <div class="order_status"><span :class="item.statusClass">{{item.biStatus}}</span></div>
    </div>
    <!-- 订单编码默认状态 -->
    <div class="duty-top" v-if="!istransCodeBottom">
      <div class="duty_code">
        <div class="code">
          <label>交易号：</label>
          <span>{{item.transCode}}</span>
        </div>
        <div class="order_status" v-if="!item.dealerName"><span :class="item.statusClass">{{item.biStatus}}</span></div>
        <div class="order_biProStatus" v-else>{{item.biProcessStatus || "暂无流程"}}</div>
      </div>
    </div>
    <!--仓库-->
    <div class="warehouse-part" v-if="isWarehouse">
      <div class="warehouse">
        <!--入库仓 -->
        <span class="warehouse_in" v-if="item.warehouseName_containerCode">入库 - {{item.warehouseName_containerCode}}</span>
        <!-- 出库库仓 -->
        <span class="warehouse_out"  v-if="item.warehouseName_containerCodeOut">出库 - {{item.warehouseName_containerCodeOut}}</span>
      </div>
      <div class="order_biProStatus">{{item.biProcessStatus || "暂无流程"}}</div>
    </div>
    <div class="order-main vux-1px-b" :class="{'has_margin' : noCount}">
      <!-- 物料图片和名称 -->
      <ul class="duty_matter">
        <li class="duty_matter_item" :class="{'is-matched-mat': mItem.matchedMat}"
            v-for="(mItem, mIndex) in item.detailItem" :key="mIndex" v-if='mIndex<3'>
          <div class="matter_img">
            <img :src="mItem.inventoryPic" @error="getDefaultImg(mItem)">
          </div>
          <div class="matter_main" :class="{'vux-1px-b': mIndex < item.detailItem.length - 1 }">
            <div class="main_top">
              <div class="matter_name">{{mItem.inventoryName}}</div>
              <div class="matter_units">
                <div>
                  <p>编码: {{mItem.inventoryCode}}</p>
                  <p>
                    <span>规格: {{mItem.specification_outPutMatCode || mItem.specification || '无'}}</span>
                    <span>单位: {{mItem.measureUnit_outPutMatCode || mItem.measureUnit || mItem.assMeasureUnit|| '无'}}</span>
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
    <div class="order-count vux-1px-b">
      <!--无仓库和往来时 价税小计 放在 商品数量合计底部-->
      <template v-if="!noCount && isDealerWarehouse">
        <div class="num">
          <div>
            <span>共{{item.itemCount}}类商品</span>
            <span v-show="item.totalQty">合计{{item.totalQty}}件</span>
          </div>
          <div class="money">
            价税小计：<span class="symbol">￥</span><span class="tdAmount">{{item.count | toFixed | numberComma(3)}}</span>
          </div>
        </div>
      </template>
      <!-- 默认状态 -->
      <template v-else>
        <div class="num">
          <span>共{{item.itemCount}}类商品</span>
          <span v-show="item.totalQty">合计{{item.totalQty}}件</span>
        </div>
        <div class="money" v-if="!noCount">
          价税小计：<span class="symbol">￥</span><span class="tdAmount">{{item.count | toFixed | numberComma(3)}}</span>
        </div>
      </template>
      <!--无仓库和往来时 流程状态显现-->
      <div class="order_biProStatus" v-if="isDealerWarehouse">{{item.biProcessStatus || "暂无流程"}}</div>
    </div>
    <!--有仓库，有往来时订单编码-->
    <div class="transcode-part vux-1px-b" v-if="istransCodeBottom">
      <label>交易号：</label>
      <span>{{item.transCode}}</span>
    </div>
    <!-- 经办人合计 -->
    <div class="duty-creator">
        <p class="order_handler">
          <label>经办人：</label>
          <span>{{item.handlerName}}</span>
        </p>
        <p class="order_handler">
          <label>修改时间：</label>
          <span>{{item.modTime}}</span>
        </p>
      </div>
    <!-- 提示 -->
    <div class="tips-part" v-show="item.itemCount > 3">
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
    filters: {
      toFixed,
      dateFormat,
      numberComma
    },
    computed: {
      // 订单编码是否在底部
      istransCodeBottom(){
        return this.item.dealerName && (this.item.warehouseName_containerCode || this.item.warehouseName_containerCodeOut)
      },
      //是否有仓库
      isWarehouse(){
        return this.item.warehouseName_containerCode || this.item.warehouseName_containerCodeOut
      },
      // 不存在往来和仓库,流程状态放在商品合计栏
      isDealerWarehouse(){
        return !this.item.dealerName && !(this.item.warehouseName_containerCode || this.item.warehouseName_containerCodeOut)
      },
    },
    methods: {
      // 获取默认图片
      getDefaultImg(item) {
        let url = require('assets/wl_default03.png');
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
// 流程状态
.order_biProStatus {
  color: #FB880B;
  line-height: .12rem;
  border-radius: .1rem;
  background: #FFF4E6;
  padding: .05rem .04rem;
}
label {
  color: #999;
}
//订单已生效
.duty_done_c {
  color: #3296FA;
}
// 订单失效或者草稿
.duty_fall_c {
  color: #999;
}
.mater-list-item {
  color: #333;
  overflow: hidden;
  font-size: .12rem;
  background: #fff;
  position: relative;
  margin: .15rem .1rem;
  border-radius: .04rem;
  box-sizing: border-box;
  padding: .1rem 0 .15rem;
  transition: background-color 200ms linear;
  box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.7);
  &.visited {
    background-color: $list_visited;
  }
  .dealer-part {
    display: flex;
    font-size: .12rem;
    padding: 0 .15rem;
    align-items: center;
    box-sizing: border-box;
    justify-content: space-between;
    // 往来名称
    .order_dealer {
      display: flex;
      align-items: center;
      .icon-dealer {
        width: .16rem;
        height: .15rem;
      }
      .dealer_name {
        margin-left: .1rem;
      }
    }
  }
  .order-main {
    padding: 0 .15rem;
    &.has_margin {
      padding-bottom: .1rem;
    }
  }
  .duty-top {
    overflow: hidden;
    padding: .06rem .15rem 0;
    // 订单编码
    .duty_code {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
  /* 仓库 */
  .warehouse-part {
    display: flex;
    align-items: center;
    padding: .06rem .15rem 0;
    justify-content: space-between;
    .warehouse_style {
      color: #3296FA;
      position: relative;
      padding: .03rem .02rem;
      &:before {
        top: 0;
        left: 0;
        content: "";
        width: 200%;
        height: 200%;
        color: #3296FA;
        position: absolute;
        transform: scale(0.5);
        border-radius: .08rem;
        transform-origin: left top;
        border: 1px solid #3296FA;
      }
    }
    .warehouse {
      font-size: .1rem;
      line-height: .14rem;
      .warehouse_in {
        color: #C0A170;
        margin-right: .08rem;
        @extend .warehouse_style;
        &:before {
          border-color: #C0A170;
        }
      }
      .warehouse_out {
        @extend .warehouse_style;
      }
    }
  }
  /* 物料 */
  .duty_matter {
    display: block;
    box-sizing: border-box;
    .duty_matter_item {
      width: 100%;
      display: flex;
      padding-top: .16rem;
      box-sizing: border-box;
      justify-content: space-between;
      /* 是否为搜索匹配项(物料) */
      &.is-matched-mat {
        background: linear-gradient(to right, #dbe2ef, #ffffff);
      }
      .matter_img {
        width: .95rem;
        height: .95rem;
        display: inline-block;
        margin-bottom: .04rem;
        img {
          width: 100%;
          max-height: 100%;
        }
      }
      .matter_main {
        flex: 1;
        position: relative;
        margin-left: .12rem;
        padding-bottom: .15rem;
        .main_top {
          .matter_name {
            font-size: .14rem;
            line-height: .19rem;
          }
          .matter_units {
            display: flex;
            color: #999;
            margin-top: .04rem;
            align-items: flex-start;
            justify-content: space-between;
            p {
              line-height: .20rem;
              span {
                margin-right: .02rem;
              }
            }
          }
          .matter_price_part {
            font-size: .14rem;
            margin-top: .08rem;
          }
          .matter_num_part {
            color: #999;
          }
        }
      }
    }
  }
  //查看全部
  .tips-part {
    color: #318EFF;
    text-align: center;
    padding-top: .15rem;
    box-sizing: border-box;
  }
  /* 合计栏 */
  .order-count {
    width: 100%;
    height: .5rem;
    display: flex;
    color: #696969;
    padding: 0 .15rem;
    font-weight: bold;
    align-items: center;
    box-sizing: border-box;
    justify-content: space-between;
    .money {
      .tdAmount {
        font-size: .16rem;
        color: #FA7138;
      }
      .symbol {
        color: #FA7138;
      }
    }
    .order_biProStatus {
      font-size: .12rem;
      font-weight: normal;
    }
  }
  /** 创建人 */
  .duty-creator {
    display: flex;
    line-height: .14rem;
    padding: .15rem .15rem 0;
    .order_handler {
      display: flex;
      & + .order_handler {
        margin-left: .12rem;
      }
    }
  }
  .transcode-part {
    padding: .15rem;
    line-height: .14rem;
  }
  /* vux组件样式 */
  .vux-1px-t:before,
  .vux-1px-b:after {
    border-color: #E8E8E8;
  }
}
</style>
