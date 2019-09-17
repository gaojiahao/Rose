<template>
<div v-show="!hidden" class="cell each_property vux-1px-b">
    <label :class="{'required':!cfg.allowBlank,'readonly':cfg.readOnly}">{{cfg.fieldLabel}}</label>
    <input type="text" v-if="cfg.readOnly == false" :value="values[cfg.fieldCode]" placeholder="请输入" @blur="onInput" />
    <span v-else >{{valueToRaw(values[cfg.fieldCode])}}</span>
</div>
</template>
<script>
import Vue from 'vue'
import {numberComma} from 'vux'
import {toFixed} from '@/plugins/calc'
import fieldBase from 'mixins/fieldBase'
import util from '@/common/util'
let cfg = {
    mixins: [fieldBase],
    props:['cfg','values'], 
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
      valueToRaw(value){
         if (value == null)return '无';
         return util.permilFormat(value);
      },
      //覆盖fieldBase的校验方法
      isValid:function(){
        var me = this,
            cfg = me.cfg,
            value = me.getValue();

        if((!cfg.readOnly) && (!cfg.hiddenInRun) && me.submitValue) {
          if(util.isString(value)) {
            value = this.unNumberComma(value);
            this.setValue(value);
          }
        }

        return me.disabled || me.getErrors().length == 0;
      },
    }
}
export default Vue.component('r2Permilfield',cfg);
</script>