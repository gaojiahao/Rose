<template>
<div v-show="!cfg.hidden" class="cell each_property vux-1px-b">
    <label :class="{'required':!cfg.allowBlank,'readonly':cfg.readOnly,'check-label':true}">
        {{cfg.fieldLabel}}
    </label>
    <div class="checker-icon" @click="changeValue">
        <check-icon :value.sync="displayValue"></check-icon>
    </div>
</div>
</template>
<script>
import Vue from 'vue'
import { CheckIcon } from 'vux'
import fieldBase from 'mixins/fieldBase'
let cfg = {
    mixins:[fieldBase],
    props:['cfg','values'],
    components: {
        CheckIcon
    },
    data() {
        return {
            displayValue: false
        }
    },
    watch: {
        values: function(value){
            value[this.cfg.fieldCode] && (this.displayValue = !!value[this.cfg.fieldCode]);
        }
    },
    methods:{
        changeValue() {
            if(this.cfg.readOnly) {
                this.displayValue = !this.displayValue;
                return;
            }
            this.setValue(this.displayValue);
        }
    }
}
export default Vue.component('R2Checkbox',cfg);
</script>
<style lang="scss">
@import '~@/scss/color';
.check-label{
    color: #999;
    font-weight: bold;
    margin-left: -.04rem;
}
.checker-icon /deep/ .weui-icon-circle{
    font-size: 21px;
}
</style>