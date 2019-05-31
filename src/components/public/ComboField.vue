<template>
<div v-show="!cfg.hiddenInRun" class="cell each_property vux-1px-b combo" >
    <label :class="{'required':!cfg.allowBlank}">{{cfg.fieldLabel}}</label>
    <div v-if="cfg.readOnly == false" class="content">
       <span class='mater_nature'>{{values[cfg.fieldCode] || "请选择"}}</span>
       <span class="icon-right"></span>
    </div>
    <span v-else >{{values[cfg.fieldCode]||'无'}}</span>
</div>
</template>
<script>
import Vue from 'vue'
let  cfg = {
     props:['cfg','values'], 
}
export default Vue.component('R2Combofield',cfg);
</script>
<style lang="scss">
.combo {
   .content{
      display: flex;
      align-items: center;
      .icon-right{
         width: .08rem;
         height: .14rem;
         margin-left: .1rem;
      }
   }
}
</style>