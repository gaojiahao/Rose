<script>
var timeOutEvent=0;//定时器
export default {
    methods:{
        touchstart(event){
            let vm = this,
                posObj = event.changedTouches[0],
                pos = {
                    x:posObj.pageX,
                    y:posObj.pageY
                };
            
            this.pos = pos;
            if(timeOutEvent != 0)clearTimeout(timeOutEvent);//清除定时器  
            timeOutEvent = setTimeout(function(){
                vm.$emit('menuContext',event)
                timeOutEvent = 0;
            },300);//这里设置定时
        },
        goTouchmove(event){
             var posObj = event.changedTouches[0],
                 startPos = this.pos;
            
             if((Math.abs(posObj.pageX - startPos.x) > 5 || Math.abs(posObj.pageY - startPos.y) > 5) && timeOutEvent != 0){
                 clearTimeout(timeOutEvent);//清除定时器
                 timeOutEvent = 0;
             }
        },
        goTouchend(){
            var vm = this;
           
            if(timeOutEvent!=0){
                clearTimeout(timeOutEvent);
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