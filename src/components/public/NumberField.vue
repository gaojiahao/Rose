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
import util from '@/common/util'
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
            value = this.unNumberComma(value);
            value = numberComma(value);
            e.target.value = value;
            this.setValue(value);
        },
        getNum(val) {
            return Math.abs(toFixed(val, 2));
        },
        //千分符转浮点型
        unNumberComma(value) {
            value = value.replace(/,/g,'');
            value = Number(value);
            value = this.getNum(value);
            return value;
        },
        //覆盖fieldBase的校验方法
        isValid:function(){
            var me = this,
                cfg = me.cfg,
                value = me.getValue();
                
            if((!cfg.readOnly) && (!cfg.hiddenInRun) && cfg.submitValue) {
              if(util.isString(value)) {
                value = this.unNumberComma(value);
                this.setValue(value);
              }
            }
            return (me.disabled || me.getErrors().length == 0) && me.getMaxValue();
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
        //设置默认值
        setDefaultValue: function () {
            var me = this,
                defaultValue = me.cfg.defaultValue,
                typeToHanlderMap = {
                    staticData:'getStaticData',
                    remoteData:'getRemoteData',
                    formData:'getFormData',
                    contextData:'getContextData',
                    getParam:'getGetParam',
                    firstItem:'getFirstItem'
                },
                handler,
                ds;

            if (!util.isEmpty(defaultValue)) {
                try {
                    ds = util.isString(defaultValue) ? JSON.parse(defaultValue) : defaultValue;
                } catch (ex) {
                    var msg = '【' + me.cfg.fieldLabel + '】' + '解析默认值的时候出错，不是合法的默认值配置。';
                    console.log(msg);
                }
                if (ds){
                    handler = typeToHanlderMap[ds.type];
                    if (handler) {
                        return defaultValue.data[0];
                    }
                } 
            }
        },
        //校验关联字段
        numberVerSel() {

        },
        //校验数值关系
        numberVerify() {

        },
        //绑定
        r2Bind() {

        }
    },
    created () {
        //设置默认值
        this.setValue(this.setDefaultValue());
    }
}
export default Vue.component('r2Numberfield',cfg);
</script>