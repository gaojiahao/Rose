<template>
<div v-show="!hidden" class="cell each_property vux-1px-b">
    <label :class="{'required':!cfg.allowBlank}">{{cfg.fieldLabel}}</label>
    <input type="nubmer" v-if="cfg.readOnly == false" :value="values[cfg.fieldCode]" placeholder="请输入" @blur="onInput"/>
    <span v-else >{{values[cfg.fieldCode]||'无'}}</span>
</div>
</template>
<script>
import Vue from 'vue'
import {numberComma} from 'vux'
import fieldBase from 'mixins/fieldBase'
import { toFixed } from '@/plugins/calc'
let  cfg = {
    mixins: [fieldBase],
    props:['cfg','values'],
    data() {
        return {

        }
    },
    methods:{
        onInput:function(e){
            var value = e.target.value;
            value = this.getNum(value);
            e.target.value = value;
            this.setValue(value);
            if(this.dealColumn()) {
                value = this.getMinAndMaxOfValue();
                e.target.value = value;
                this.setValue(value);
            }
        },
        getNum(val) {
            return Math.abs(toFixed(val, 2));
        },
        //覆盖fieldBase的校验方法
        isValid:function(){
            var me = this,
                cfg = me.cfg,
                value = me.getValue();

            return (me.disabled || me.getErrors().length == 0) && me.getMaxValue();
        },
        //判断是重复项的日期还是单一项的日期
        dealColumn:function() {
            if(this.$parent.cfg.xtype == 'r2GridColumn') {
                return true;    
            }
        },
        //校验最大值
        getMaxValue:function(){
            var me = this,
                maxValue = me.cfg.maxValue,
                value = me.getValue();

            if(maxValue){
                if(value > maxValue) {
                    this.$vux.alert.show({
                        content: '【' + me.cfg.fieldLabel + '】' + '该输入项的最大值是' + maxValue
                    });  
                    return false;  
                };
            }
            return true;
        },
        //校验最大，小值
        getMinAndMaxOfValue:function(){
            var me = this,
                maxValue = me.cfg.maxValue,
                minValue = me.cfg.minValue,
                value = me.getValue();
            if(maxValue){
                if(value > maxValue) {
                    value = maxValue;
                    this.$vux.toast.text(me.cfg.fieldLabel + "最大值为" + maxValue, 'middle')
                }
            }
            if(minValue) {
                if(value < minValue) {
                    value = minValue;
                    this.$vux.toast.text(me.cfg.fieldLabel + "最小值为" + minValue, 'middle')
                }
            }
            return value;
        },
    },
    created () {

    }
}
export default Vue.component('r2Numberfield',cfg);
</script>