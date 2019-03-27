<template>
  <!-- 底部提交确认栏 -->
  <div class="count_mode vux-1px-t" :class="{btn_hide : hide}" v-if="!isModify">
      <span v-if="tdAmount" class="count_num"
            :class="{nine_up : tdAmount.length  > 8, ten_up : tdAmount.length  > 9, ele_up : tdAmount.length  > 10}">
        <span class="total_price">
          <span class="symbol">￥</span>{{tdAmount | numberComma}}
        </span>
        <span class="taxAmount" v-if="taxAmount">[含税: ￥{{taxAmount | numberComma}}]</span>
      </span>
    <span class="count_btn" @click="submit">提交</span>
  </div>
  <!-- 底部删除确认栏 -->
  <div class="count_mode vux-1px-t delete_mode" :class="{btn_hide : hide}" v-else>
    <div class='count_num all_checked' @click="checkAll">
      <x-icon type="ios-circle-outline" size="20" class='outline'
              v-show="!allCheck"></x-icon>
      <x-icon type="ios-checkmark" size="20" class="checked" v-show="allCheck"></x-icon>
      全选
    </div>
    <div class='delete_btn' @click="deleteItem">删除</div>
  </div>
</template>

<script>
  import {numberComma} from 'vux'

  export default {
    name: "OpButton",
    props: {
      isModify: {
        type: Boolean,
        default: false
      },
      hide: {
        type: Boolean,
        default: false
      },
      tdAmount: {
        type: [String, Number],
        default: 0
      },
      taxAmount: {
        type: [String, Number],
        default: 0
      },
      allCheck: {
        type: Boolean,
        default: false
      },
    },
    methods: {
      checkAll() {
        this.$emit('on-check-all');
      },
      submit() {
        this.$emit('on-submit');
      },
      deleteItem() {
        this.$emit('on-delete');
      },
    },
    filters: {
      numberComma,
    },
  }
</script>

<style scoped lang="scss">
  // 底部栏
  .count_mode {
    // left: 0;
    z-index: 99;
    bottom: 0;
    width: 100%;
    display: flex;
    height: .44rem;
    position: absolute;
    line-height: .44rem;
    background: #fff;
    .count_num {
      flex: 2.5;
      color: #5077aa;
      font-size: .24rem;
      padding-left: .1rem;
      position: relative;
      &.nine_up {
        font-size: .2rem;
      }
      &.ten_up {
        font-size: .16rem;
      }
      &.ele_up {
        font-size: .12rem;
        // .total_price {
        //   .symbol {
        //     font-size: .1rem;
        //   }
        // }
        .taxAmount {
          font-size: .1rem;
        }
      }
      .total_price {
        display: inline-block;
        .symbol {
          font-size: .14rem;
        }
      }
      .taxAmount, .total-num {
        color: #757575;
        font-size: .1rem;
        display: inline-block;
      }
    }
    //全选
    .all_checked {
      font-size: 0.16rem;
      position: relative;
      padding-left: 0.35rem;
      box-sizing: border-box;
      .vux-x-icon {
        left: 0.1rem;
        top: 50%;
        position: absolute;
        transform: translateY(-50%);
        fill: #999;
      }
      .checked {
        fill: #ea5455;
      }

    }
    .count_btn {
      flex: 1.5;
      color: #fff;
      text-align: center;
      background: #3296FA;
      &.stop {
        background: #ea5455;
      }
    }
    .delete_btn {
      @extend .count_btn;
      background: #ea5455;
    }
  }

  .vux-1px-t:before {
    border-top: 1px solid #e8e8e8;
  }
</style>
