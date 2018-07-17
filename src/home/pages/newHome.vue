<template>
  <div class="pages">
    <div class="content mg_auto">
      <!-- 用户头像部分 -->
      <div class="user_part">
        <div class="user_avatar vux-1px-b">
          <img src="../assets/avatar.png" alt="avatar">
          <div class="tips">欢迎,瑞福登</div>
        </div>
      </div>
      <!-- 销售应用部分 -->
      <div class="sale_part swiper-container">
        <!-- 应用标题 -->
        <div class="list_title">
          <span class="bg_title">销售</span>
          <span class="more">更多</span>
        </div>
        <div class="swiper-wrapper" style="height:1.3rem;">
          <!-- 单个app -->
          <div class="indval_app swiper-slide">
            <div class="app_type">业务应用</div>
            <div class="app_name">销售订单</div>
            <div class="app_intro">可细分直销订单，经销订单，代销订销，来料加工订单等可细分直销订单，经销订单，代销订销，来料加工订单等</div>
          </div>
          <div class="indval_app swiper-slide">
            <div class="app_type">业务应用</div>
            <div class="app_name">销售订单</div>
            <div class="app_intro">可细分直销订单，经销订单，代销订销，来料加工订单等可细分直销订单，经销订单，代销订销，来料加工订单等</div>
          </div>
          <div class="indval_app swiper-slide">
            <div class="app_type">业务应用</div>
            <div class="app_name">销售订单</div>
            <div class="app_intro">可细分直销订单，经销订单，代销订销，来料加工订单等可细分直销订单，经销订单，代销订销，来料加工订单等</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  mounted(){
    let Swiper = this.Swiper;
    // 左右滑动
    new Swiper('.sale_part', {
        direction: 'horizontal',
        // centeredSlides: true,
        slidesPerView: 'auto',
        observer: true, //修改swiper自己或子元素时，自动初始化swiper
        observeParents: true,//修改swiper的父元素时，自动初始化swiper
    })
  }
}
</script>

<style lang='scss' scoped>
.content {
  width: 100%;
  height: 100%;
}
.mg_auto {
  width: 95%;
  margin: 0 auto;
}
// 顶部 用户头像部分
.user_part {
  display: flex;
  box-sizing: border-box;
  .user_avatar {
    width: 100%;
    display: flex;
    padding: .04rem 0 .02rem;
    align-items: center;
    justify-content: space-between;
    img {
      width: .35rem;
      height: .35rem;
      border-radius: 50%;
    }
    .tips {
      font-size: .28rem;
    }
  }
}
// 销售部分
.sale_part {
  padding-top: .04rem;
  box-sizing: border-box;
  // 应用标题
  .list_title{
    display: flex;
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
  // 单个APP
  .indval_app {
    width: 70%;
    color: #fff;
    height: 1.2rem;
    margin: .04rem .1rem 0 0;
    border-radius: .06rem;
    padding: .08rem .04rem;
    box-sizing: border-box;
    box-shadow: 0 2px 5px #5077aa;
    // background: #5077aa; 
    background: -webkit-linear-gradient(0, #2F80ED,  #56CCF2);
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
