<script>
var timeOutEvent=0;//定时器
export default {
    methods:{
        touchstart(event){
            let vm = this;
            clearTimeout(timeOutEvent);//清除定时器  
            timeOutEvent = setTimeout(function(){
                vm.$emit('menuContext',event)
                timeOutEvent = 0;
            },600);//这里设置定时
        },
        goTouchmove(){
            clearTimeout(timeOutEvent);//清除定时器
            timeOutEvent = 0;
        },
        goTouchend(){
            var vm = this;
            clearTimeout(timeOutEvent);
            if(timeOutEvent!=0){
                vm.$emit('click');
            }
        }
    }
}
</script>
<template>
    <div @touchstart="touchstart" @touchmove="goTouchmove" @touchend="goTouchend">
       <slot></slot>
    </div>
</template>