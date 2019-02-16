<template>
  <div class="each-cell" :class="{'vux-1px-b' : showBottomBorder, 'when-is-right' : textRight}">
    <span class="cell-name">{{ cellTitle }}: </span>
    <span class="cell-content">
      <span class="symbol" v-if="showSymbol">￥</span>{{ cellContent || '无' }}
    </span>
  </div>
</template>

<script>
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
    }
  }
}
</script>

<style lang='scss' scoped>
.each-cell {
  font-size: .14rem;
  padding: .15rem 0;
  line-height: .2rem;
  .cell-name {
    color: #696969;
    margin-right: .04rem;
  }
  .cell-content {
    color: #333;
  }
  &.vux-1px-b:after {
    border-color: #e8e8e8;
  }
}
.when-is-right {
  display: flex;
  align-items: center;
  .cell-content {
    flex: 1;
    text-align: right;
  }
}
</style>
