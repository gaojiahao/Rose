<template>
<div v-show="!hidden" class="cell each_property vux-1px-b date">
    <label :class="{'required':!cfg.allowBlank,'readonly':cfg.readOnly}">{{cfg.fieldLabel}}</label>
    <!-- <input v-if="cfg.readOnly == false" :value="values[cfg.fieldCode]" placeholder="请输入" type="date" @input="onInput"/> -->
    <div class="content">
        <span v-if="cfg.readOnly == false" class="mater_nature" @click="getDate()" :class="{placeholder:!values[cfg.fieldCode]}">{{values[cfg.fieldCode] || '请选择'}}</span>
        <span v-else class="mater_nature">{{values[cfg.fieldCode]||'无'}}</span>
        <span class="icon-right" v-if="cfg.readOnly == false"></span>
    </div>
</div>
</template>
<script>
import Vue from 'vue'
import { dateFormat } from 'vux'
import fieldBase from 'mixins/fieldBase'
let cfg = {
    mixins:[fieldBase],
    props:['cfg','values'],
    data() {
        return {
            startDate: '',
            endDate: '',
        }
    },
    methods:{
        // 选择日期
        getDate(){
            this.dealColumn();
            this.$vux.datetime.show({
                value: '',  //放默认日期，如绑定的
                startDate: this.startDate,
                endDate: this.endDate,
                format: this.format(),
                confirmText: '确认',
                cancelText: '取消',
                onConfirm: (val)=> {
                    this.setValue(val);
                },
            });
        },
        //判断是重复项的日期还是单一项的日期
        dealColumn:function() {
            if(this.$parent.cfg.xtype == 'r2GridColumn') {
                this.dealDate(1);    
            } else if(this.$parent.cfg.xtype == 'r2FieldSet') {
                this.dealDate(0); 
            }
        },
        //判断是开始日期还是结束日期
        dealDate:function(val) {
            if(this.cfg.startDateFieldCfg)
                this.startDateFieldCfg(val);
            else if(this.cfg.endDateFieldCfg)
                this.endDateFieldCfg(val);
            else 
                return ;
        },
        //开始日期
        startDateFieldCfg:function(val) {
            let Id,
                startDate;
            if(val){
                Id = 'column-' + this.cfg.startDateFieldCfg;
            } else {
                Id =  this.cfg.startDateFieldCfg;
            }
            startDate = this.form.fieldMap[Id].getValue();
            this.startDate = startDate;
        },
        //结束日期
        endDateFieldCfg:function(val) {
            let Id,
                endDate;
            if(val) {
                Id = 'column-' + this.cfg.endDateFieldCfg;
            } else {
                Id =  this.cfg.endDateFieldCfg;
            }
            endDate = this.form.fieldMap[Id].getValue();
            this.endDate = endDate;
        },
        //日期格式
        format:function() {
            var format = this.cfg.format;
            if(format == 'Y-m-d') {
                format = 'YYYY-MM-DD';
            } else if(format =='Y-m') {
                format = 'YYYY-MM';
            } else if(format =='Y-m-d H:i:s') {
                format = 'YYYY-MM-DD HH:mm';
            } else {
                format = 'YYYY-MM-DD';
            }
            return format;
        },
    },
    created () {

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

        .placeholder{
            color:  #757575;
        }
    }
}
</style>