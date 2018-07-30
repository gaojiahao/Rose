<template>
  <div class="buy_part vux-1px-t swiper-container">
    <!-- 应用标题 -->
    <div class="list_title">
      <span class="bg_title">采购</span>
      <span class="more">更多</span>
    </div>
    <!-- 应用列表 -->
    <div class="app_list swiper-wrapper">
      <!-- 单个app -->
      <div class="each_app swiper-slide"
          @click='goList(item.code)'
          v-for="(item, index) of PURarray"
          :key='index'>
        <div class="app_type">业务对象</div>
        <div class="app_name">{{item.text}}</div>
        <div class="app_info">{{item.transName}}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props:{
    PURarray: {
      type: Array,
      require: true
    },
    goList: {
      type: Function,
      require: true
    }
  },
  updated(){
    let Swiper = this.Swiper;
    new Swiper('.buy_part', {
        slidesPerView: 'auto',
        initialSlide: 0,
        observer: true,       //修改swiper自己或子元素时，自动初始化swiper
        observeParents: true //修改swiper的父元素时，自动初始化swiper
    })
  }
}
</script>

<style lang='scss' scoped>
// 应用标题
.list_title{
  display: flex;
  padding: .04rem 0 0;
  align-items: center;
  justify-content: space-between;
  .bg_title,
  .more{
    color: #000;
    font-size: .26rem;
  }
  .more {
    font-size: .2rem;
    color: #4F90F9;
  }
}
// 销售部分
.buy_part {
  .app_list {
    height: 1.6rem;
    padding-left: .04rem;
    .each_app {
      width: 75%;
      height: 1.2rem;
      color: #fff;
      background: #7dc383;
      padding: .08rem .04rem;
      border-radius: .04rem;
      box-sizing: border-box;
      margin: .04rem .1rem 0 0;
      box-shadow: 0 2px 5px #7dc383;
      // app 类型
      .app_type {
        font-size: .12rem;
      }
      // app 名称
      .app_name {
        font-size: .3rem;
        font-weight: 200;
      }
      // app 介绍
      .app_info {
        margin-top: .1rem;
        overflow: hidden;
        font-size: .14rem;
        max-height: .46rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        box-sizing: border-box;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
      }
    }
  }
}
</style>
