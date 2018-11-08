<template>
  <div class="basic-part defalut_bg">
      <div class="app-container swiper-container">
        <div class="basic-list swiper-wrapper">
          <div class="indval_app swiper-slide"
              @click="goBasic(item.listId)"
              v-for='(item, index) of BasicApps'
              :key='index'
              :style="{ 
                background:`${item.bgColor} url(${item.icon}) no-repeat 100px 10px/ 60px` ,
                boxShadow: `0 2px 2px ${item.boxShadow}`
              }">
              <div class="app_name">{{item.text}}</div>
              <div class="app_type">{{item.transName}}</div>
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
  mounted(){
    let HomeSwiper = this.Swiper;
    // 左右滑动
    swiper = new HomeSwiper('.app-container', {
      direction: 'horizontal',
      slidesPerView: 'auto',
      spaceBetween: 5,
      slidesOffsetBefore: 10,
      slidesOffsetAfter: 10,
      observer: true,           //修改swiper自己或子元素时，自动初始化swiper
      observeParents: true,     //修改swiper的父元素时，自动初始化swiper
    })
  },
  updated(){
    swiper.update();
  }
}
</script>

<style lang='scss' scoped>
@import "./../scss/homeCommon.scss";
// 基础应用部分
.basic-part {
  width: 100%;
  // padding: 0 .1rem;
  box-sizing: border-box;
  .basic-title {
    color: #111;
    font-weight: bold;
    font-size: .18rem;
    padding: .04rem 0;
  }
  .basic-list {
    width: 100%;
    padding: .08rem 0 .14rem;
    // 单个APP
    .indval_app {
      width: 150px;
      height: 54px;
      color: #fff;
      font-weight: bold;
      border-radius: .08rem;
      box-sizing: border-box;
      padding: .04rem .04rem 0;
      .app_img {
        width: .6rem;
        height: .6rem;
        img {
          width: 100%;
          border-radius: .12rem;
        }
      }
      .app_type,
      .app_name {
        font-size: .14rem;
      }
      // 应用名称
      
      .app_intro {
        overflow: hidden;
        font-size: .14rem;
        max-height: .46rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
      }    
    }
  }
}
</style>
