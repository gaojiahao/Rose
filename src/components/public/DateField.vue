<template>
<div v-show="!hidden" class="cell each_property vux-1px-b date">
    <label :class="{'required':!cfg.allowBlank}">{{cfg.fieldLabel}}</label>
    <!-- <input v-if="cfg.readOnly == false" :value="values[cfg.fieldCode]" placeholder="请输入" type="date" @input="onInput"/> -->
    <div class="content">
        <span v-if="cfg.readOnly == false" class="mater_nature" @click="getDate()">{{values[cfg.fieldCode] || '请选择'}}</span>
        <span v-else class="mater_nature">{{values[cfg.fieldCode]||'无'}}</span>
        <span class="icon-right"></span>
    </div>
</div>
</template>
<script>
import Vue from 'vue'
import fieldBase from 'mixins/fieldBase'
let  cfg = {
     mixins:[fieldBase],
     props:['cfg','values'], 
     methods:{
        //  onInput:function(e){
        //     var value = e.target.value;
        //     this.setValue(value);
        //  },
        // 选择日期
        getDate(){
            this.$vux.datetime.show({
                value: '', // 其他参数同 props
                confirmText: '确认',
                cancelText: '取消',
                onConfirm: (val)=> {
                this.setValue(val);
                },
            })
        },
     }
}
export default Vue.component('R2Datefield',cfg);
</script>
<style lang="scss">
@import '~@/scss/color';
.date {
    .content {
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