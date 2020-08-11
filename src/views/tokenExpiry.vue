<template>
    <div class="token-expiry">
        <div>由于长时间没有使用，您的登录凭证过期了，需要重新登录</div>
        <div>
            <x-button @click.native="tologin" class="weui-btn to-login">去登录</x-button>
        </div>
    </div>
</template>
<script>
import {XButton} from 'vux'
export default {
     components: {
        XButton
    },
    methods:{
        tologin(){
            this.$router.replace('/login');
        }
    },
    beforeRouteEnter:function(to,form,next){
        next(vm=>{
            vm.getApp().hasTab = false;
        });
    },
    beforeRouteLeave:function(to,from,next){
         this.getApp().hasTab = true;
         next();
    }
}
</script>
<style lang="scss">
   .token-expiry{
       padding:1rem;
       .to-login{
        margin-top: 0.4rem;
        @include bg_color();
        color: #fff;
        width: 90%;
    }
   }
   
</style>