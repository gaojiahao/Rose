<template>
  <div class="app-root">
    <slot name="nav"></slot>
    <div class="app-container">
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
            tokenService.clean();
            this.$router.replace('/login');
        }
    }
}
</script>
<style lang='scss' scoped>

</style>