<template>
  <div class="app_part">
    <div class="each_part" v-for="(item, inx) in BusApps" :key='inx'>
      <!-- 应用标题 -->
      <div class="list_title">
        <div class="bg_title">
          <div class="title vux-1px-b">{{inx}}</div>
          <!-- <div class="more">
            <span>更多</span>
            <x-icon class="right_arrow" type="ios-arrow-forward" size="14"></x-icon>
          </div> -->
        </div>
      </div>
      <!-- 应用列表 -->
      <div class="app_list defalut_bg mg_auto">
        <!-- 单个app -->
        <div class="each_app"
          @click='goList(app.listId, app.text,app.file)'
          v-for="(app, index) of item.appList" :key='index'>
          <div class="app_img">
            <img :src='app.icon' @error="getDefaultIcon(app)">
          </div>
          <div class="app_info">
            <div class="app_name">{{app.text}}</div>
            <div class="app_intro">{{app.transName}}</div>
          </div>
        </div>
      </div>
    </div>  
  </div>
</template>

<script>
export default {
  props:{
    BusApps: {
      type: Object,
      default: {}
    },
    goList: {
      type: Function,
      require: true
    },
    getDefaultIcon: {
      type: Function,
      require: true
    }
  }
}
</script>

<style lang='scss' scoped>
@import "./../scss/homeCommon.scss";
</style>
