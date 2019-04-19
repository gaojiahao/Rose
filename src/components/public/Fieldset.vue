<template>
  <div class="r-fieldset">
    <div v-for="(item, index) in cfg.items" :key="index">
       <r-text :cfg="item" :values="values" v-if="item.xtype.indexOf('Grid') == -1 && item.r2GridXtype == null"/>
       <r-grid :cfg="item" :value="values[item.name]" v-if="item.xtype.indexOf('Grid') != -1||!!item.r2GridXtype"/>
    </div>
  </div>
</template>
<script>
import Vue from 'vue';
var component = {
    props:['cfg','values']
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