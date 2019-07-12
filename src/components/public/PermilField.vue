<template>
<div v-show="!hidden" class="cell each_property vux-1px-b">
    <label :class="{'required':!cfg.allowBlank}">{{cfg.fieldLabel}}</label>
    <input type="text" v-if="cfg.readOnly == false" :value="values[cfg.fieldCode]" placeholder="请输入" @blur="onInput" />
    <span v-else >{{values[cfg.fieldCode] == null ? '无' : values[cfg.fieldCode]}}</span>
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
    watch: {
      // num: {
      //   handler(val) {
      //     this.currentNum = this.unNumberComma(val);
      //   }
      // }
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

        return me.disabled || me.getErrors().length == 0;
      },
    },
    created () {

    }
}
export default Vue.component('r2Permilfield',cfg);
</script>