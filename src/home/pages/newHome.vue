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
      <!-- 基础应用部分 -->
      <div class="basic_part swiper-container">
        <!-- 应用标题 -->
        <div class="list_title">
          <span class="bg_title">基础</span>
          <!-- <span class="more">更多</span> -->
        </div>
        <div class="swiper-wrapper" style="height:1rem; padding-left:.04rem;">
          <!-- 单个app -->
          <div class="indval_app swiper-slide" style="background: -webkit-linear-gradient(0, #2F80ED,  #56CCF2);">
            <div class="app_type">业务对象</div>
            <div class="app_name">物料</div>
          </div>
          <div class="indval_app swiper-slide" style="background: -webkit-linear-gradient(0, #00b09b,  #96c93d);">
            <div class="app_type">业务对象</div>
            <div class="app_name">往来</div>
          </div>        
        </div>
      </div>
      <!-- 销售应用部分 -->
      <div class="sale_part vux-1px-t swiper-container">
        <!-- 应用标题 -->
        <div class="list_title">
          <span class="bg_title">销售</span>
          <span class="more">更多</span>
        </div>
        <!-- 应用列表 -->
        <div class="app_list swiper-wrapper">
          <div class="each_app swiper-slide">
            <div class="app_img">
              <img src="../assets/sales-contract.png" alt="">
            </div>
            <div class="app_name">销售订单</div>
          </div>
          <div class="each_app swiper-slide">
            <div class="app_img">
              <img src="../assets/sales-stock.png" alt="">
            </div>
            <div class="app_name">销售订单</div>
          </div>
          <div class="each_app swiper-slide">
            <div class="app_img">
              <img src="../assets/sales-stock.png" alt="">
            </div>
            <div class="app_name">销售订单</div>
          </div>
          <div class="each_app swiper-slide">
            <div class="app_img">
              <img src="../assets/sales-stock.png" alt="">
            </div>
            <div class="app_name">销售订单</div>
          </div>
          <div class="each_app swiper-slide">
            <div class="app_img">
              <img src="../assets/sales-stock.png" alt="">
            </div>
            <div class="app_name">销售订单</div>
          </div>
          <div class="each_app swiper-slide">
            <div class="app_img">
              <img src="../assets/sales-stock.png" alt="">
            </div>
            <div class="app_name">销售订单</div>
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
    new Swiper('.basic_part', {
        direction: 'horizontal',
        slidesPerView: 'auto',
        observer: true, //修改swiper自己或子元素时，自动初始化swiper
        observeParents: true,//修改swiper的父元素时，自动初始化swiper
    })
    new Swiper('.sale_part', {
        direction: 'horizontal',
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
// 销售部分
.sale_part {
  .app_list {
    padding-left: .04rem;
    .each_app {
      width: 80%;
      background:#D0D86D; 
      box-sizing: border-box;
      margin: .04rem .2rem 0 0;   
    // app 图片
      .app_img {
        width: 1rem;
        // height: .75rem;
        img {
          width: 100%;
          border-radius: .12rem;
          // box-shadow: 0 2px 4px #3a3a3a;
        }
      }
      // app 名称
      .app_name {
        text-align: center;
        font-size: .18rem;
        font-weight: bold;
      }
    }
  }
}
</style>
