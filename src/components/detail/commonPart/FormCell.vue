<template>
  <div v-if="cellContent" class="each_cell" :class="{'vux-1px-t' : showTopBorder}">
    <span class="cell_name">{{ cellTitle }}:</span>
    <span class="cell_content" :class="{'when-is-right' : textRight}">
      <span class="symbol" v-if="showSymbol">￥</span>{{ cellContent }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'FormCell',
  props:{
    cellTitle: [String, Number],    // 标题
    cellContent: [String, Number],  // 内容
    showTopBorder: {                // 是否展示上划线
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
.each_cell {
  display: flex;
  font-size: .14rem;
  padding: .08rem 0;
  align-items: center;
  .cell_name {
    color: #757575;
    margin-right: .1rem;
  }
  .cell_content {
    line-height: .28rem;
    font-weight: bold;
  }
  .when-is-right {
    flex: 1;
    text-align: right;
  }
}

</style>
