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
                  v-for='(item, index) of YWarray'
                  :key='index'
                  :style="{background:(index % 2 ? SecBg : '')}">
                <div class="app_type">业务对象</div>
                <div class="app_name">{{item.text}}</div>
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
          <!-- 单个app -->
          <div class="each_app swiper-slide"
              @click='goXS(item.text)'
              v-for="(item, index) of XSarray"
              :key='index'>
            <div class="app_type">业务对象</div>
            <div class="app_name">{{item.text}}</div>
            <div class="app_info">{{item.transName}}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import homeService from '../service/homeservice'
export default {
  data(){
    return{
      YWarray : [],        // 基础对象 数组
      XSarray : [],        // 销售 数组
      SecBg:'-webkit-linear-gradient(0, #00b09b,  #96c93d)'
    }
  },
  methods:{
    // 基础应用
    goBasic(item){
      if(item === '物料'){
        this.$router.push({ path : '/materApp'})
      }
      else if(item === '往来'){
        this.$router.push({ path : '/adress'})
      }
    },
    //销售应用
    goXS(item){
      if(item === '销售报价'){
        this.$router.push({ path:'/detail', query:{code:'XSBJ'} })
      }
      else if(item === '销售订单'){
        this.$router.push({ path:'/detail', query:{code:'XSDD'}})
      }
    }
  },
  created(){
    (async() => {
      // 获取首页应用列表
      await homeService.getMeau().then( res => {
        for(let val of res){
          // 获取基础对象
          if(val.text === '业务对象'){
            for(let item of val.children ){
              // 由于应用没有开发完全 临时处理方法
              if(item.text === '物料' || item.text === '往来'){
                this.YWarray.push(item);
              }
            }
          }
          // 获取业务应用
          else if(val.text === '业务应用'){
            for(let item of val.children){
              // 获取 业务应用-销售 应用
              if(item.text === '销售'){
                for(let ite of item.children){
                  // 由于应用没有开发完全 临时处理方法
                  if(ite.text.includes('报价') || ite.text.includes('订单') ){
                    this.XSarray.push(ite);
                  }
                }
              }
            }
          }
        }
      }).catch( err => {
        this.$vux.alert.show({
          content: err.message
        })
      })
    })()
  },
  updated(){
    let Swiper = this.Swiper;
    // 左右滑动
    new Swiper('.basic_part', {
        slidesPerView: 'auto',
        observer: true,       //修改swiper自己或子元素时，自动初始化swiper
        observeParents: true  //修改swiper的父元素时，自动初始化swiper
    })
    new Swiper('.sale_part', {
        slidesPerView: 'auto',
        initialSlide: 0,
        observer: true,       //修改swiper自己或子元素时，自动初始化swiper
        observeParents: true //修改swiper的父元素时，自动初始化swiper
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
// 销售部分
.sale_part {
  .app_list {
    height: 1.6rem;
    padding-left: .04rem;
    .each_app {
      width: 75%;
      height: 1.2rem;
      color: #fff;
      background: #2e89ba;
      padding: .08rem .04rem;
      border-radius: .04rem;
      box-sizing: border-box;
      margin: .04rem .1rem 0 0;
      box-shadow: 0 2px 5px #5077aa;
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
