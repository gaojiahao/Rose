<template>
  <div class="r-fieldset">
    <div class="readOnlyPart" v-if="readOnlyParts.length">
      <template v-for="(item, index) in readOnlyParts">
        <span :key="index" class="title">{{item.fieldLabel}}：</span><span>{{values[item.fieldCode]||'无'}}</span>
      </template>
    </div>
    <template v-for="(item, index) in editParts" >
       <r2Textfield :cfg="item" :values="values" v-if="item.xtype == 'r2Textfield'" :key="index"/>
       <r2Datefield :cfg="item" :values="values" v-if="item.xtype == 'r2Datefield'" :key="index"/>
       <r-grid :cfg="item" :value="values[cfg.name]" v-if="item.xtype.indexOf('Grid') != -1" :key="index"/>
    </template>
  </div>
</template>
<script>
import Vue from 'vue';
var component = {
    props:['cfg','values'],
    data(){
      return {
         editParts:[],
         readOnlyParts:[]
      }
    },
    watch:{
      cfg: {
        handler(cfg) {
          // *部分应用* 物料详情在审批节点可以重新录入数据 此处进行数据分割
          let {items = []} = cfg;
          let editParts = [];
          let readOnlyParts = [];
          items.forEach(item => {
            // 当Grid组件只读为false时 各个字段的readOnly才能启用
            if (item.readOnly == false || cfg.layout == 'fit') {
               editParts.push(item);
            } else {
               readOnlyParts.push(item);
            }
            
          });
          this.editParts = editParts;   // 可编辑部分
          this.readOnlyParts = readOnlyParts;   // 只读部分
        },
        immediate: true
      }
    }
}
export default Vue.component('RFieldset',component)
</script>

<style lang="scss">
  .r-fieldset {
    color: #333;
    margin: .1rem;
    border-radius: .04rem;
    background-color: #fff;
    width: calc(100% - .2rem);
    .readOnlyPart{
      padding:.15rem;
      line-height: .22rem;
      font-size: .12rem;
      span:nth-child(2n+1){
        color:#999;
      }
      span:nth-child(2n){
        margin-right:0.05rem;
      }
    }
    .each_property{
        margin-left:0.17rem;
        label{
            color:#999
        }
        span{
            flex: 1;
            margin-left: .05rem;
        }
    }
}
</style>