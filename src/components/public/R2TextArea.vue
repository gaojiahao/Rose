<template>
<div v-show="!hidden" class="vux-1px-b textarea">
    <group>
        <x-textarea v-if="cfg.readOnly == false" :value="values[cfg.fieldCode]" placeholder="请输入" :max="100" class="fontSize" @input="onInput"></x-textarea>
    </group>
</div>
</template>
<script>
import Vue from 'vue'
import { Group,XTextarea } from 'vux'
import fieldBase from 'mixins/fieldBase'
let  cfg = {
     mixins:[fieldBase],
    components: { Group,XTextarea },
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
.textarea {
    .weui-cell {
        padding: 0;
    }
    .weui-textarea {
        color: #333;
    }
    .content {
        display: flex;
        align-items: center;
        .icon-right{
            width: .08rem;
            height: .14rem;
            margin-left: .1rem;
        }
    }
    .fontSize {
      font-size: .14rem;
    }
}
</style>