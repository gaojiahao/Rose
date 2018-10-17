<template>
  <div v-if="content" class="each_cell" :class="{'vux-1px-t' : showTopBorder, 'when-is-right' : textRight}">
    <span class="cell_name">{{ title }}: </span>
    <span class="cell_content">
      <span class="symbol" v-if="showSymbol">￥</span>{{ content }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'FormCell',
  props:{
    title: [String, Number],    // 标题
    content: [String, Number],  // 内容
    showTopBorder: {                // 是否展示上划线
      type: Boolean,
      default: false
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
  font-size: .14rem;
  /*padding: .08rem 0;*/
  .cell_name {
    color: #757575;
    margin-right: .04rem;
  }
  .cell_content {
    line-height: .28rem;
    font-weight: bold;
  }
}
.when-is-right {
  display: flex;
  align-items: center;
  .cell_content {
    flex: 1;
    text-align: right;
  }
}
</style>
