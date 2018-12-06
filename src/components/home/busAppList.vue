<template>
  <div class="app-part">
      <div class="each_part" v-for="(item, inx) in BusApps" :key='inx'>
        <template v-if="item.appList.length > 0">
          <div class="app-container defalut_bg">
            <div class="app_classify_name">
              <p>{{item.name}}</p>
            </div>
            <div class="app-list">
              <div class="indval_app "
                @click='goList(app.listId, app.text, app.fileID)'
                v-for="(app, index) of item.appList" :key='index'>
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
        </template>
      </div>  
  </div>
</template>

<script>
let swiper;
export default {
  props:{
    BusApps: {
      type: Array,
      default: []
    },
    goList: {
      type: Function,
      require: true
    },
    getDefaultIcon: {
      type: Function,
      require: true
    },
    goAppDetail: {
      type: Function,
      require : true
    }
  }
}
</script>

<style lang='scss' scoped>
@import "./../scss/homeCommon.scss";
</style>
