<template>
  <div class="r-number-container">
    <span class="r-number-handle" @click="subNum" :class="{disabled : currentNum <= 1}">-</span>
    <input class="num" type="number" :value="currentNum" @change="getNum"/>
    <span class="r-number-handle plus" @click="plusNum"
          :class="{disabled: max && currentNum >= max}">+</span>
  </div>
</template>

<script>
  export default {
    name: "RNumber",
    props: {
      num: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 0
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
      // TODO 数量--
      subNum() {
        if (this.currentNum === 1) {
          return
        }
        this.currentNum--;
        this.$emit('input', this.currentNum);
      },
      // TODO 数量++
      plusNum() {
        if (this.max && this.max === this.num) {
          return
        }
        this.currentNum++;
        this.$emit('input', this.currentNum);
      },
      // TODO 修改数量
      getNum(e) {
        let val = Number(e.target.value);
        if (this.max && val > this.max) {
          val = this.max;
        }
        if (val <= 0) {
          val = 1;
        }
        this.currentNum = Math.floor(val);
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
    .plus {
      vertical-align: middle;
      margin-top: -.01rem;
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
