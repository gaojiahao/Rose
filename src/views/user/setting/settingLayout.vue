<template>
  <div class="app-root">
     <div class="page-navigation flex" v-if="$route.name==='setting'">
            <div class="goback" >
            <i class="iconfont icon-back1" @click="$router.push('/user')" ></i>
        </div>
            设置
    </div>
    <div class="page-body-hasNav"  v-if="$route.name==='setting'">
        <group >
            <cell title="用户编码"  :value='currentUser.userCode'></cell>
            <cell title="手机号"  :value='currentUser.mobile'></cell>
            <cell title="邮箱"  :value='currentUser.email'></cell>
            <cell title="切换身份" is-link :value='currentUser.entityName' link="/user/setting/entities"></cell>
        </group>
        <group>
            <cell style="text-align: center;color: red;"  title="退出登录"  @click.native="loginOut" />
        </group>
    </div>
    <router-view></router-view>
  </div>
</template>
<script>
import { Group, Cell } from 'vux'
import { initWebContext } from 'service/commonService'
import tokenService from "service/tokenService";
export default {
    name: "Setting",
    data() {
        return {
           currentUser:{}
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
    },
    created(){
         initWebContext().then((WebContext) => {
          this.currentUser = WebContext.currentUser
      })
    }
}
</script>
<style lang='less' scoped>
.app-root{
    height: 100%;
    background-color: #dedede;
}
</style>