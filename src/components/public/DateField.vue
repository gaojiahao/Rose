<template>
<div class="cell each_property" :class="{'required':!cfg.allowBlank}">
    <label>{{cfg.fieldLabel}}</label>
    <input v-if="cfg.readOnly == false" :value="values[cfg.fieldCode]" placeholder="请输入">
    <span v-else >{{values[cfg.fieldCode]||'无'}}</span>
</div>
</template>
<script>
import Vue from 'vue'
let  cfg = {
     props:['cfg','values'], 
}
export default Vue.component('R2Datefield',cfg);
</script>