<template>
    <x-textarea 
        autosize
        :value="values[cfg.fieldCode]" 
        :placeholder="`请输入${cfg.fieldLabel}`" 
        class="each_property textarea" 
        :class="{'readonly': cfg.readOnly,'textRinght':!values[cfg.fieldCode]}"
        @input="onInput" 
        :readonly = "cfg.readOnly">
        <template slot="label">
            
        <label 
            :class="{required : !cfg.allowBlank,'readonly':cfg.readOnly}" 
            style="display: block;" 
            v-show="cfg.fieldLabel != null ">{{cfg.fieldLabel}}</label>
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
        
    },
    mounted() {
        this.$nextTick(function(){
            setTimeout(() => {
                let targetEl = this.$el.children[1].children[0];
                targetEl.style.height = `${targetEl.scrollHeight}px`;
            },10)
        })
    }
}
export default Vue.component('R2TextArea',cfg);
</script>
<style lang="scss" scoped>
@import '~@/scss/color';
/deep/.weui-cell {
    padding: 0; 
    position: relative;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
}
.r-fieldset .textarea {
    padding: 0.03rem;
    display: block;
    height:auto;
    line-height: normal;
    align-items:normal;
    border-bottom: 1px solid #e8e8e8;
    padding-top: .05rem;
    &:before{
        border-top:none;
    }
    .weui-cell__hd{
        padding-right:0.05rem;
    }
    label{
        margin-bottom: 0.08rem;
    }
}

.textRinght /deep/ .weui-textarea{
    text-align: right;
}

</style>