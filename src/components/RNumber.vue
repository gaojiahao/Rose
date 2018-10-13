<template>
  <div class="r-number-container">
    <span class="r-number-handle" @click.stop="subNum" :class="{disabled : currentNum <= 1}">-</span>
    <input class="num" type="number" :value="currentNum" @blur="getNum"/>
    <span class="r-number-handle plus" @click.stop="plusNum"
          :class="{disabled: max && currentNum >= max}">+</span>
  </div>
</template>

<script>
  import {toFixed} from '@/plugins/calc'

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
      // TODO 数量减一
      subNum() {
        if (this.currentNum === 1) return;
        this.currentNum--;
        this.$emit('input', this.currentNum);
      },
      // TODO 数量加一
      plusNum() {
        if (this.max && this.max === this.num) return;
        this.currentNum++;
        this.$emit('input', this.currentNum);
      },
      // TODO 数量自定义
      getNum(e) {
        let val = Number(e.target.value);
        if (this.max && val > this.max) {
          val = this.max;
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
    input {
      border: none;
      outline: none;
    }
    .r-number-handle {
      display: inline-block;
      width: 0.2rem;
      height: 0.2rem;
      text-align: center;
      line-height: 0.2rem;
      font-size: .18rem;
    }
    .disabled {
      color: #eee;
    }
    .num {
      width: 0.4rem;
      height: 0.2rem;
      background: #e8e8e8;
      text-align: center;
      line-height: 0.2rem;
      font-size: 0.12rem;
      border-radius: 0 !important;
    }
  }
</style>
