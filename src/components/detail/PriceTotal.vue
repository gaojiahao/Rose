<template>
  <!-- 金额明细 -->
  <div class="price_detail" :class="{'only-count': onlyCount}">
    <div class="price_list" v-if="!noAmt">
      <div class='title'>金额</div>
      <div class="num"><span class="symbol">￥</span>{{amt | toFixed | numberComma(3)}}</div>
    </div>
    <div class="price_list" v-if="!noTaxAmt">
      <div class='title'>税金</div>
      <div class="num"><span class="symbol">￥</span>{{taxAmt | toFixed | numberComma(3)}}</div>
    </div>
    <!-- 金额合计栏 -->
    <div class="price_count vux-1px-t" v-if="!noCount">
      <span class='title'>合计：</span>
      <span class="num"><span class="symbol">￥</span>{{count | toFixed | numberComma(3)}}</span>
    </div>
  </div>
</template>

<script>
  import {numberComma} from 'vux'
  import {toFixed} from '@/plugins/calc'

  export default {
    name: "PriceTotal",
    props: {
      // 不展示金额
      noAmt: {
        type: Boolean,
        default: false
      },
      // 不展示税金
      noTaxAmt: {
        type: Boolean,
        default: false
      },
      // 不展示合计
      noCount: {
        type: Boolean,
        default: false
      },
      // 金额
      amt: {
        type: Number,
        default: 0
      },
      // 税金
      taxAmt: {
        type: Number,
        default: 0
      },
      // 合计
      count: {
        type: Number,
        default: 0
      },
    },
    computed:{
      onlyCount(){
        return this.noAmt && this.noTaxAmt
      }
    },
    filters: {
      numberComma,
      toFixed,
    },
  }
</script>

<style scoped lang="scss">
  .price_detail {
    width: 100%;
    margin-top: .1rem;
    background: #FFF;
    padding: .04rem .1rem;
    box-sizing: border-box;
    &.only-count {
      .vux-1px-t:before {
        display: none;
      }
    }
    .price_list {
      display: flex;
      justify-content: space-between;
      margin: 0.04rem 0;
      .title,
      .num {
        font-weight: bold;
        font-size: .14rem;
      }
    }
    // 合计
    .price_count {
      width: 100%;
      font-size: .14rem;
      text-align: right;
      padding: .04rem 0;
      .title {
        color: #111;
        font-weight: bold;
        font-size: .18rem;
      }
      .num {
        color: #ea5455;
        font-weight: bold;
        font-size: .18rem;
      }
    }
    .symbol {
      font-size: .1rem;
    }
    .vux-1px-t:before {
      border-color: #e8e8e8;
    }
  }
</style>
