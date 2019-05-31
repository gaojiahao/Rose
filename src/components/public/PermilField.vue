<template>
<div v-show="!hidden" class="cell each_property vux-1px-b">
    <label :class="{'required':!cfg.allowBlank}">{{cfg.fieldLabel}}</label>
    <input v-if="cfg.readOnly == false" :value="values[cfg.fieldCode]" placeholder="请输入">
    <span v-else >{{values[cfg.fieldCode]||'无'}}</span>
</div>
</template>
<script>
import Vue from 'vue'
import fieldBase from 'mixins/fieldBase'
let  cfg = {
     mixins: [fieldBase],
     props:['cfg','values'], 
}
export default Vue.component('r2Permilfield',cfg);
</script>