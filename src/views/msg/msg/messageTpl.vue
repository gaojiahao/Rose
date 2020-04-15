<template>
    <div class="message" :class="{ 'isMySelf': msg.isMySelf }">
        <img 
        :src="msg.photo" 
        :style="{float: msg.isMySelf?'right':'left'}"  
        class="message-ava" 
        @error="getDefaultPhoto(msg)">

        <span class ="message-creator" v-if="!msg.isMySelf">{{msg.creatorName}}</span>
        <div class="message-content" :class="[msg.isMySelf==1?'rightarrow':'leftarrow']"  v-html="msg.content"></div>
    </div>
</template>

<script>
export default {
    name:'MessageTpl',
    props:{
        msg:{
            type:Object,
            default(){
                return {}
            }
        }
    },
     methods:{
        getDefaultPhoto(msg) {
            let url = require("assets/ava01.png");
            if (msg) {
                msg.photo = url;
            }
            return url;
        },
     }
}
</script>

<style lang="less" scoped>
.rightarrow:after{
    content: " ";
    border-width: 7px;
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    top: 3px;
    margin-left: 1px;
    border-right-width: 0;
    border-left-color: rgb(191, 221, 255);
    right: -6px;
}

.leftarrow:after{
    content: " ";
    border-width: 7px;
    position: absolute;
    display: block;
    width: 0;
    height: 0;
    border-color: transparent;
    border-style: solid;
    top: 3px;
    margin-left: 1px;
    border-left-width: 0;
    border-right-color: rgb(255, 255, 255);
    left: -8px;
}
.message{
    width: 100%;
    &-ava{
        height: 40px;
        border-radius: .01rem;
    }

    &-creator{
        display: block;
        margin-left: .50rem;
        font-size: 10px;
        color: #9E9E9E;
    }

    &-content{
        border-radius: 5px;
        padding: .05rem;
        position: relative;
        margin: .02rem .06rem;
        display: inline-block;
        max-width: 70%;
        background-color: #ffffff;
    }

}

.isMySelf{
    text-align: right;
    .message-content{
        background-color: rgb(191, 221, 255);
    }
}
</style>