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
