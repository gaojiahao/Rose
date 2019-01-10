<template>
  <!-- 金额明细 -->
  <div class="price_detail">
    <div class="price_list" v-if="taxAmt>0">
      <div class='title'>税金：</div>
      <div class="num"><span class="symbol">￥</span>{{taxAmt | toFixed | numberComma(3)}}</div>
    </div>
    <div class="price_list" v-if="amt>0">
      <div class='title'>金额：</div>
      <div class="num"><span class="symbol">￥</span>{{amt | toFixed | numberComma(3)}}</div>
    </div>
    <!-- 金额合计栏 -->
    <div class="price_list" v-if="!noCount">
      <span class='title'>价税小计：</span>
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
    filters: {
      numberComma,
      toFixed,
    },
  }
</script>

<style scoped lang="scss">
  .price_detail {
    padding: 0 .15rem;
    width: 100%;
    background: #FFF;
    overflow: hidden;
    box-sizing: border-box;
    .price_list {
      display: flex;
      margin-top: .15rem;
      line-height: .12rem;
      font-size: .12rem;
      & + .price_list {
        margin-top: .12rem;
      }
      .title{
        color: #999;
      }
      .num{
        color: #696969;
        font-weight: bold;
      }
    }
    .symbol {
      font-size: .12rem;
      font-weight: 300;
    }
  }
</style>
