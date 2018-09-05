<template>
  <div class="matter_item">
    <div class="mater_img">
      <img :src="item.inventoryPic" alt="mater_img" @error="getMatterDefault(item)">
    </div>
    <div class="mater_main">
      <!-- 物料名称 -->
      <div class="mater_name">
        {{item.inventoryName_transObjCode || '该物料未获取到名称，请检查物料信息。'}}
      </div>
      <!-- 物料基本信息 -->
      <div class="mater_info">
        <!-- 物料编码 -->
        <div class="info-item">
          <span class="title">编码</span>
          <span class="num">{{item.transObjCode || '无'}}</span>
        </div>
        <!-- 物料规格 -->
        <div class="info-item mater_spec">
          <span class="title">规格</span>
          <span class="num">{{item.specification_transObjCode || '无'}}</span>
        </div>
      </div>
      <slot name="other">
        <!-- 物料数量和价格 -->
        <div class='mater_other' v-if="!this.$slots.other">
          <div class='mater_num' v-if='item.tdQty'>
            <span class="num">单价: ￥{{item.price | toFixed | numberComma(3)}}</span>
            <span class='num'>数量: {{item.tdQty}}</span>
            <span v-show='item.taxRate'>税率: {{item.taxRate}}</span>
          </div>
          <div class='mater_other' v-if="item.priceType || item.priceType === ''">
            <div class='mater_price'>
              <span class="symbol">￥</span>{{item.price | toFixed |numberComma(3)}}
              <span class="num">[类型: {{item.priceType || '无'}}]</span>
            </div>
          </div>
          <div class='mater_price' v-else>
            <span>￥{{item.tdAmount | toFixed | numberComma(3)}}</span>
            <span class="num"
                  :style="{display:(item.tdAmount && item.tdAmount.toString().length >= 4 ? 'block' : '')}"
                  v-if="item.taxRate">
                    [金额: ￥{{item.noTaxAmount | toFixed | numberComma(3)}} + 税金: ￥{{item.taxAmount | toFixed | numberComma(3)}}]
                  </span>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
  import {numberComma} from 'vux'
  import {toFixed} from '@/plugins/calc'

  export default {
    name: "MatterItem",
    props: {
      item: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      return {}
    },
    filters: {
      numberComma,
      toFixed,
    },
    methods: {
      //选择默认图片
      getMatterDefault(item) {
        let url = require('assets/wl_default02.png');
        if (item) {
          item.inventoryPic = url;
        }
        return url
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  // 每个物料
  .matter_item {
    display: flex;
    position: relative;
    padding: .04rem 0;
    box-sizing: border-box;
    // 物料图片
    .mater_img {
      display: inline-block;
      margin-top: .04rem;
      width: .75rem;
      height: .75rem;
      > img {
        width: 100%;
        max-height: 100%;
      }
    }
    // 物料主体
    .mater_main {
      display: inline-block;
      margin-left: .1rem;
      max-width: 2.6rem;
      box-sizing: border-box;
      // 物料名称
      .mater_name {
        overflow: hidden;
        display: -webkit-box;
        max-height: .46rem;
        color: #111;
        font-size: .14rem;
        font-weight: bold;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
      }
      // 物料信息
      .mater_info {
        margin-top: .02rem;
        color: #757575;
        font-size: 0;
        // 物料编码和规格
        .info-item {
          display: inline-block;
          margin-right: .06rem;
          font-weight: 200;
          .title, .num {
            font-size: .1rem;
            padding: .01rem .04rem;
          }
          .title {
            color: #fff;
            background: #3f72af;
            border-top-left-radius: .12rem;
            border-bottom-left-radius: .12rem;
          }
          .num {
            color: #111;
            max-width: .9rem;
            overflow: hidden;
            white-space: nowrap;
            background: #dbe2ef;
            text-overflow: ellipsis;
            border-top-right-radius: .12rem;
            border-bottom-right-radius: .12rem;
          }
          // 规格
          &.mater_spec {
            .title {
              background: #537791;
            }
            .num {
              color: #fff;
              max-width: .6rem;
              background: #ff7f50;
            }
          }
        }
      }
      //物料价格，数量
      .mater_other {
        margin-top: .02rem;
        // 类型
        .mater_spec {
          font-size: .14rem;
        }
        // 一般金额
        .mater_price {
          color: #ea5455;
          font-weight: bold;
          font-size: .16rem;
          line-height: 0.2rem;
          margin-top: .04rem;
          display: inline-block;
          .num {
            font-size: .1rem;
            color: #757575;
            .symbol {
              font-size: .08rem;
            }
          }
        }
        // 单价 数量 税率 等
        .mater_num {
          color: #757575;
          font-size: 0.1rem;
          span {
            display: inline-block;
          }
          .num {
            margin-right: 0.04rem;
          }
        }
      }
    }
  }
</style>
