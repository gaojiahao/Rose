<template>
  <div class="app-root">
       <div class="page-hasTab">
     <div class="page-navigation flex">
            <div class="goback" >
            <i class="iconfont icon-back1" @click="$router.push('/user/setting')" ></i>
        </div>
            切换身份
    </div>
     <RScroll 
        class="page-body-hasNav" 
        :options="scrollOptions"
        :has-next="hasNext"
        :no-data="false">
        <group >
            <cell v-for="(e,index) in entityList" :key="index" :title="e.groupName" @click.native="onClick(e)" >
                <i   v-if="currentUser.entityId===e.groupCode" class="iconfont icon-YES" style="font-size: 0.2rem;color: #3296fa;"></i>
            </cell>
        </group>
        </RScroll>
       </div>
  </div>
</template>
<script>
import homeService from "service/homeservice";
import { Group, Cell } from 'vux'
import RScroll from "plugins/scroll/RScroll";
import { initWebContext } from 'service/commonService'
import tokenService from "service/tokenService";

export default {
    name: "UserEntities",
    data() {
        return {
             scrollOptions:{
                    click: true,
                    pullUpLoad: false,//上拉刷新
                    pullDownRefresh: false //下拉刷新
            },
           hasNext:false,
           currentUser:{},
           entityList:[]
        }
    },
    components: {
        Cell,
        Group,
        RScroll
    },
    computed: {
    },
    methods:{
     onClick(entity){
         if(this.currentUser.entityId === entity.groupCode) return;

             this.$loading.show();
            homeService.changeEntity({ entityId: entity.groupCode }).then(data => {
                let tokenInfo = tokenService.getToken(true);
                if (tokenInfo) {
                tokenInfo.entityId = data.entityId;
                tokenInfo.token = data.token;
                tokenService.setToken(tokenInfo);
                location.reload();
                }
            });
        }
    },
    created(){
         initWebContext().then((WebContext) => {
          this.currentUser = WebContext.currentUser;

          this.entityList = this.currentUser.sysGroupList.filter(g=>{
              return g.groupType === 'C';
          });
          console.log(this.currentUser);
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