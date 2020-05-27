<template>
    <div class="weui-skin_android">
        <div class="weui-mask" @click="$parent.showNavContextMenu = false;$emit('off')"></div>
        <div class="weui-actionsheet">
            <div class="weui-actionsheet__menu">
                <div class="weui-actionsheet__cell" @click="onFocusChange">{{ group.focus?'取消置顶':'置顶' }}</div>
            </div>
        </div>
    </div>
</template>
<script>
import { setFocus,deleteFocus } from '@/service/msgService'
import Bus from '@/common/eventBus.js';
export default{  
    name: "NavContextMenu",
    props:{
        group:{
            type:Object,
            default(){
                return {}
            }
        }
    },
    methods: {
        onFocusChange() {
            let requestUrl = setFocus,
                params = {
                    groupId: this.group.groupId
                };
            this.group.focus && (requestUrl = deleteFocus);
            requestUrl(params).then(res => {
                if(res.success){
                    this.$vux.toast.show({text: res.message});
                    Bus.$emit('updateGroups');
                    this.$parent.showNavContextMenu = false;
                }
            })
        }
    }
}  
</script>