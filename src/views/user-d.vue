<!--我-->
<template>
  <div class="page-hasTab me">
    <div class="page-navigation">
        <div class="nav-hd">
            我
        </div>
    </div>
    <div class="page-body-hasNav">
        <group>
            <cell title="主题设置" is-link link="/themesetting"/>
            <cell title="退出"  @click.native="loginOut"/>
        </group>
    </div>
  </div>
</template>
<script>
import { Group, Cell } from 'vux'
import tokenService from "service/tokenService";
export default {
    name: "THEMESETTING",
    data() {
        return {
  
        }
    },
    components: {
        Cell,
        Group
    },
    computed: {
    },
    methods:{
        loginOut(){
            var ds = window.dsClient;
            tokenService.clean();
            if(ds)ds.close();//关闭deepstream长连接
            this.$router.replace('/login');
        }
    }
}
</script>
<style lang='less'>
.me{
   .page-navigation{
       display: flex;
   }
}
</style>