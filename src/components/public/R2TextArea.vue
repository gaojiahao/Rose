<template>
    <x-textarea :value="values[cfg.fieldCode]" placeholder="请输入" :max="100" class="each_property textarea" @input="onInput" :readonly = "cfg.readOnly">
        <template slot="label">
        <label :class="{required : !cfg.allowBlank,'readonly':cfg.readOnly}" style="display: block;">{{cfg.fieldLabel}}</label>
        </template>
    </x-textarea>
</template>
<script>
import Vue from 'vue'
import {XTextarea } from 'vux'
import fieldBase from 'mixins/fieldBase'
let  cfg = {
     mixins:[fieldBase],
    components: {XTextarea },
     props:['cfg','values'], 
     methods:{
        onInput:function(e){
            var value = e;
            this.setValue(value);
        },
     }
}
export default Vue.component('R2TextArea',cfg);
</script>
<style lang="scss">
@import '~@/scss/color';
.r-fieldset .textarea {
    height:auto;
    line-height: normal;
    align-items:normal;
    &:before{
        border-top:none;
    }
}
</style>