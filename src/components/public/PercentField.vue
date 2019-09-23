<template>
<div v-show="!hidden" class="cell each_property vux-1px-b">
    <label :class="{'required':!cfg.allowBlank,'readonly':cfg.readOnly}">{{cfg.fieldLabel}}</label>
    <input type="number" v-if="cfg.readOnly == false" :value="values[cfg.fieldCode]" placeholder="请输入" @blur="onInput" style="display:none;"/>
    <input type="number" v-if="cfg.readOnly == false" v-model="rate" placeholder="请输入" @blur="onInput2" />
    <span v-else >{{values[cfg.fieldCode] == null ? '无' : values[cfg.fieldCode]}}</span>
    <span>%</span>
</div>
</template>
<script>
import Vue from 'vue'
import {toFixed} from '@/plugins/calc'
import { accMul, accDiv } from "plugins/calc/decimalsAdd"
import fieldBase from 'mixins/fieldBase'
let cfg = {
    mixins: [fieldBase],
    props:['cfg','values'], 
    data(){
      return {
        rate: accMul(this.getValue()||0,100),
      }
    },
    methods:{
      onInput:function(e){
        var value = e.target.value;
        value = this.getNum(value);
        e.target.value = value;
        //this.setValue(value);
      },
      onInput2:function(e){
        var value = e.target.value;
        value = this.getNum(value);
        e.target.value = value;
        this.setValue(accDiv(value,100));
      },
      getNum(val) {
        return Math.abs(toFixed(val, 2));
      }
    }
}
export default Vue.component('r2Percentfield',cfg);
</script>