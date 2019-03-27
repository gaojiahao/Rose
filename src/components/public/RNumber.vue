<template>
  <div class="r-number-container">
    <span class="r-number-handle iconfont icon-iconfontmove" @click.stop="subNum" :class="{disabled : min && currentNum <= min}"></span>
    <input class="num" type="number" :value="currentNum" @blur="getNum"/>
    <span class="r-number-handle iconfont icon-jia" @click.stop="plusNum"
          :class="{disabled: max && currentNum >= max}"></span>
  </div>
</template>

<script>
  import {toFixed} from '@/plugins/calc'
  import {accAdd, accSub} from 'plugins/calc/decimalsAdd'

  export default {
    name: "RNumber",
    props: {
      // 默认值
      num: {
        type: Number,
        default: 0
      },
      // 最大值
      max: {
        type: Number,
        default: 0
      },
      // 最小值
      min: {
        type: Number,
        default: 1
      },
      // 失去焦点时对值做的处理
      checkNum: {
        type: Function,
        default(val) {
          if (val === 0) {
            val = 1;
          }
          return Math.abs(toFixed(val, 2));
        }
      }
    },
    data() {
      return {
        currentNum: 0,
      }
    },
    watch: {
      num: {
        handler(val) {
          this.currentNum = val;
        }
      }
    },
    methods: {
      // 数量减一
      subNum() {
        if (this.currentNum <= this.min) return;
        this.currentNum = parseFloat(accSub(this.currentNum, 1));
        this.$emit('input', this.currentNum);
      },
      // 数量加一
      plusNum() {
        if (this.max && this.max === this.num) return;
        this.currentNum = parseFloat(accAdd(this.currentNum, 1));
        this.$emit('input', this.currentNum);
      },
      // 数量自定义
      getNum(e) {
        let val = Number(e.target.value);
        if (this.max && val > this.max) {
          val = this.max;
        }
        if (this.min && val < this.min) {
          val = this.min;
        }
        this.currentNum = this.checkNum(val);
        e.target.value = this.currentNum;
        this.$emit('input', this.currentNum);
      },
    },
    created() {
      this.currentNum = this.num;
    }
  }
</script>

<style scoped lang="scss">
  .r-number-container {
    display: flex;
    border-radius: .02rem;
    border: 1px solid #999;
    color: #333;
    input {
      border: none;
      outline: none;
    }
    .r-number-handle {
      display: inline-block;
      width: .24rem;
      height: .24rem;
      text-align: center;
      line-height: .24rem;
      font-size: .18rem;
      .icon-iconfontmove{
        font-size: .14rem;
      }
    }
    .disabled {
      color: #eee;
    }
    .num {
      width: .6rem;
      height: .24rem;
      padding: 0 .04rem;
      font-size: .12rem;
      text-align: center;
      line-height: .24rem;
      // background: #e8e8e8;
      border-radius: 0 !important;
      border-left: 1px solid #999;
      border-right: 1px solid #999;
    }
  }
</style>
