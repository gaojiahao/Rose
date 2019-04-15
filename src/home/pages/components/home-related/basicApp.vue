<template>
  <div class="app-part" v-if="BasicApps.length">
      <div class="app-container">
        <div class="app_classify_name">
          <p>基础对象</p>
        </div>
        <div class="app-list">
          <div class="indval_app"
              @click="goBasic(app.listId)"
              v-for='(app, index) of BasicApps'
              :key='index'>
              <div class="app_img">
                <img :src='app.icon' @error="getDefaultIcon(app)">
              </div>
              <div class="app_info vux-1px-b">
                <div class="app_name">{{app.text}}</div>
                <div class="app_detail_btn" @click.stop="goAppDetail(app.listId)">应用详情</div>
              </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
let swiper;
export default {
  props: {
    BasicApps: {
      type : Array,
      require: true
    },
    goBasic: {
      type: Function,
      require : true
    },
    goAppDetail: {
      type: Function,
      require : true
    }
  },
  methods:{
    // 设置默认图片
    getDefaultIcon(app){
      let url = require('assets/defaultApp.png');
      if (app){
        app.icon = url;
      }
      return url;
    }
  }
}
</script>

<style lang='scss' scoped>
@import "~scss/home/homeCommon.scss";
</style>
