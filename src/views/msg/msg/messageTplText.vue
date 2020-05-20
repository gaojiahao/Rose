<template>
    <div class="text-msg-content" 
        v-html="formatToEmotion(msg.content)">
    </div>
</template>

<script>


export default {
    props:{
        msg:{
            type:Object,
            default(){
                return {}
            }
        }
    }
}
</script>

<style lang="less" scoped>
.text-msg-content{
    /deep/ .face{
        height: 20px;
    }
}
</style>