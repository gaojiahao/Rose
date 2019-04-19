<template>
  <div class="r-grid">
    <div class="r-row" v-for="(row,rIndex) in value">
      <div v-for="(item, index) in cfg.items" :key="index" class="cell vux-1px-b when-is-right">
         <p class="cell-name">{{item.text}}</p>
         <p class="cell-content">{{row[item.fieldCode]}}</p>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
var component = {
    props:['cfg','value']
}
export default Vue.component('RGrid',component)
</script>

<style lang="scss">
.r-row{
  padding: 0 .15rem;
}
.cell {
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