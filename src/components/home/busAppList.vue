<template>
  <div class="app_part">
    <!-- <div class="each_part" v-for="(item, inx) in BusApps" :key='inx'>
      <div class="contact-part" v-if="item.id === '6b6a6f40-ea86-4e72-a451-69a9a3b2e28c'"> 
        <div class="app_list defalut_bg">
          <div class="each_app "
            @click='goList(app.listId, app.text, app.fileID)'
            v-for="(app, index) of item.appList" :key='index'>
            <div class="app-part">
              <div class="app_img">
                <img :src='app.icon' @error="getDefaultIcon(app)">
              </div>
              <div class="app_info_container">
                <div class="app_info">
                  <div class="app_name">{{app.text}}</div>
                  <div class="app_intro">{{app.transName}}</div>
                </div>
                <div class="app_detail_btn" @click.stop="goAppDetail(app.listId)">
                  详情
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> -->
    <div class="each_part" v-for="(item, inx) in BusApps" :key='inx'>
      <!-- 应用标题 -->
      <div class="list_title">
        <div class="bg_title">
          <div class="title vux-1px-b">{{item.name}}</div>
        </div>
      </div>
      <!-- 应用列表 -->
      <div class="app_list defalut_bg mg_auto">
        <!-- 单个app -->
        <div class="each_app"
          @click='goList(app.listId, app.text, app.fileID)'
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
  },
  mounted(){
    // let Swiper = this.Swiper;
    // // 左右滑动
    // swiper = new Swiper('.contact-part', {
    //   direction: 'horizontal',
    //   slidesPerView: 'auto',
    //   spaceBetween: 5,
    //   observer: true,           //修改swiper自己或子元素时，自动初始化swiper
    //   observeParents: true,     //修改swiper的父元素时，自动初始化swiper
    // })  
  },
  updated(){
    // let Swiper = this.Swiper;
    // // 左右滑动
    // swiper = new Swiper('.contact-part', {
    //   direction: 'horizontal',
    //   slidesPerView: 'auto',
    //   // centeredSlides: true,
    //   // spaceBetween: 5,
    //   slidesOffsetAfter: 20,
    //   observer: true,           //修改swiper自己或子元素时，自动初始化swiper
    //   observeParents: true,     //修改swiper的父元素时，自动初始化swiper
    // })  
    // swiper.update();
  }
}
</script>

<style lang='scss' scoped>
@import "./../scss/homeCommon.scss";
</style>
