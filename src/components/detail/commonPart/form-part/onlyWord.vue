<template>
  <div class="only-word">
    <!-- 头部预留 -->
    <!-- <header class="word-header vux-1px-l">{{title}}</header> -->
    <div class="word-main">
      <form-cell v-for="(item, index) in config" :key="index" v-show="!item.hiddenInRun"
                 textRight :cellTitle="item.fieldLabel" :cellContent="info[item.fieldCode]"></form-cell>  
    </div> 
  </div>
</template>

<script>
import FormCell from 'components/detail/commonPart/FormCell'
export default {
  name: 'only-word',
  components: { FormCell },
  props: {
    title: String,  // 列表抬头
    config: {       // 表单配置
      type: Array,
      required: true
    },  
    info: {         // 表单信息
      type: Object,
      required: true
    }
  }
}
</script>

<style lang='scss' scpoed>
.only-word {
  padding: 0 .15rem;
  background: #FFF;
  margin: .1rem .1rem 0;
  border-radius: .04rem;
  .word-header {
    font-size: 16px;
    font-weight: 600;
    line-height: .16rem;
    &:before {
      left: -.15rem;
      width: .08rem;
      border-left: .08rem solid #3296FA;
    }
  }
}
</style>
