<template>
  <div class="basic_part swiper-container" >
      <!-- 应用标题 -->
      <div class="list_title">
        <span class="bg_title">基础</span>
        <!-- <span class="more">更多</span> -->
      </div>
      <div class="swiper-wrapper" style="height:1rem; padding-left:.04rem;">
        <!-- 单个app -->
        <div class="indval_app swiper-slide"
            @click="goBasic(item.text)"
            v-for='(item, index) of BSarray'
            :key='index'
            :style="{background:(index % 2 ? SecBg : '')}">
          <div class="app_type">业务对象</div>
          <div class="app_name">{{item.text}}</div>
        </div>
      </div>

  </div>
</template>

<script>
export default {
  props:{
    BSarray: {
      type : Array,
      require : true
    },
    SecBg: {
      type : String,
      require : true
    },
    goBasic: {
      type: Function,
      require : true
    }
  },

  updated(){
    let Swiper = this.Swiper;
    // 左右滑动
    new Swiper('.basic_part', {
        slidesPerView: 'auto',
        observer: true,       //修改swiper自己或子元素时，自动初始化swiper
        observeParents: true  //修改swiper的父元素时，自动初始化swiper
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
// 基础应用部分
.basic_part {
  box-sizing: border-box;
  // 单个APP
  .indval_app {
    width: 70%;
    color: #fff;
    height: .7rem;
    margin: .04rem .1rem 0 0;
    border-radius: .06rem;
    padding: .08rem .04rem;
    box-sizing: border-box;
    box-shadow: 0 2px 5px #5077aa;
    background: -webkit-linear-gradient(0, #2F80ED,  #56CCF2);
    // background: #5077aa;
  // 业务类型
    .app_type {
      font-size: .12rem;
    }
    // 应用名称
    .app_name {
      font-size: .24rem;
    }
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
</style>
