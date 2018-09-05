<template>
  <div class="each_cell" 
  :class="{'vux-1px-t' : showTopBorder}"
  v-if="cellContent">
    <span class="cell_name">{{ cellTitle }}:</span>
    <span class="cell_content">{{ cellContent }}</span>
  </div>
</template>

<script>
export default {
  name: 'FormCell',
  props:{
    cellTitle: [String, Number],    // 标题
    cellContent: [String, Number],  // 内容
    showTopBorder:{                 // 是否展示上划线
      type: Boolean,
      default: true
    }
  }
}
</script>

<style lang='scss' scoped>
.each_cell {
  font-size: .14rem;
  padding: .08rem 0;
  .cell_name {
    color: #757575;
    margin-right: .1rem;
  }
  .cell_content {
    line-height: .28rem;
    font-weight: bold;
  }
}
</style>
