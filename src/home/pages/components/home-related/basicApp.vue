<template>
  <div class="app-part" v-if="BasicApps.length">
      <div class="app-container">
        <div class="app_classify_name">
          <p>基础对象</p>
        </div>
        <div class="app-list">
          <app :app="app" cls="indval_app"
              @app-click="goBasic(app.listId)"
              v-for='(app, index) of BasicApps'
              :key='index'/>
        </div>
      </div>
  </div>
</template>

<script>
import app from './app';
import basicMap from "homePage/apps/basicApp/maps/basic";
let swiper;
export default {
  components:{app},
  props: {
    BasicApps: {
      type : Array,
      require: true
    }
  },
  methods:{
    // 基础应用
    goBasic(listId) {
      var path = basicMap[listId];
      if(path){
        this.$router.push({ path: path });
      } else {
        this.$router.push({
          path:'/list/null/null',
          query:{
            listId
          }
        });
      }
      
    }
  }
}
</script>

<style lang='scss' scoped>
@import "~scss/home/homeCommon.scss";
</style>
