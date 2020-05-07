<template>
  <!-- 表单控件（仅用于详情页的 文字、数字 展示） -->
  <div class="each-cell" :class="{'vux-1px-b' : showBottomBorder, 'when-is-right' : textRight}">
    <p class="cell-name">{{ cellTitle }}</p>
    <p class="cell-content">
      <span class="symbol" v-if="showSymbol">￥</span>{{ newContent || '无' }}
    </p>
  </div>
</template>

<script>
import { numberComma } from 'vux'
export default {
  name: 'FormCell',
  props:{
    cellTitle: [String, Number],    // 标题
    cellContent: [String, Number],  // 内容
    showBottomBorder: {             // 是否展示上划线
      type: Boolean,
      default: true
    },
    textRight: {                    // 文字居右
      type: Boolean,
      default: false
    },
    showSymbol: {                   // 展示'￥'符号
      type: Boolean,
      default: false
    },
    isNumberComma: {                 // 显示千分符
      type: Boolean,
      default: false
    }
  },
  computed: {
    newContent() {
      // 根据 isNumberComma 来判断表单内容是否需要千分符处理
      let newContent = this.cellContent;
      if (this.isNumberComma) {
        return numberComma(newContent);
      }
      return newContent;
    }
  }
}
</script>

<style lang='scss' scoped>
.each-cell {
  display: flex;
  font-size: .14rem;
  padding: .15rem 0;
  line-height: .2rem;
  align-items: flex-start;
  .cell-name {
    color: #999;
    margin-right: .1rem;
  }
  .cell-content {
    flex: 1;
    color: #333;
    word-break: break-all;
  }
  &.vux-1px-b:after {
    border-color: #e8e8e8;
  }
}
.when-is-right {
  .cell-content {
    flex: 1;
    text-align: right;
  }
}
</style>
