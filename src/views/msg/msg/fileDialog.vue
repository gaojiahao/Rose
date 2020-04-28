<template>
    <div>
        <div class="weui-mask"></div>
        <div class="weui-dialog weui-skin_android">
            <div class="weui-dialog__hd">
                <strong class="weui-dialog__title">发送给：</strong>
            </div> 
            <div class="weui-dialog__bd">
                <slot></slot>
                <div>
                    [文件]{{content}}
                </div>
                <div class="file-msg-input-wrapper">
                    <input type="text" v-model="text" class="weui-input" placeholder="留言"/>
                </div>
            </div> 
            <div class="weui-dialog__ft">
                <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="cancle">取消</a>
                <a href="javascript:;" class="weui-dialog__btn weui-dialog__btn_primary" @click="todo">发送</a>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    props:['content'],
    data(){
        return {
            text:''
        }
    },
    methods:{
        cancle:function(){
            this.$emit('cancel');
        },
        todo:function(){
            this.$emit('todo',this.text);
        }
    }
}
</script>