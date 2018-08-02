<template>
  <div class="inPage">
    <div class="content mg_auto">
      <!-- 用户头像部分 -->
      <div class="user_part">
        <div class="user_avatar vux-1px-b">
          <img src="../../assets/avatar.png" alt="avatar">
          <div class="tips">欢迎,瑞福登</div>
        </div>
      </div>
      <!-- 基础应用部分 -->
      <basic-app :BSarray='BSarray' :SecBg='SecBg' :goBasic='goBasic'></basic-app>
      <!-- 销售应用部分 -->
      <sale-app :XSarray='XSarray' :goList='goList'></sale-app>
      <!-- 采购应用部分 -->
      <buy-app :PURarray='PURarray' :goList='goList'></buy-app>
    </div>
  </div>
</template>

<script>
import homeService from 'service/homeservice'
import businessMap from './maps/business'
import basicApp from 'components/home/basicApp'   // 基础应用
import saleApp from 'components/home/saleApp'     // 销售应用
import buyApp from 'components/home/buyApp'       // 采购应用

// import {buyApp, saleApp, basicApp} from 'components/home'
export default {
  data(){
    return{
      BSarray : [],        // 基础对象 数组
      XSarray : [],        // 销售 数组
      PURarray: [],        // 采购 数组
      SecBg:'-webkit-linear-gradient(0, #00b09b,  #96c93d)'
    }
  },
  components:{
    buyApp,
    saleApp,
    basicApp
  },
  methods:{
    // 基础应用
    goBasic(item){
      if(item === '物料'){
        this.$router.push({ path : '/materlist'})
      }
      else if(item === '往来'){
        this.$router.push({ path : '/adress'})
      }
      else if(item === '仓库'){
        this.$router.push({ path : '/warehouse'})
      }
    },
    // 前往列表
    goList(item){
      this.$router.push({ path:`/list/${item}`})
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
              if(item.text === '物料' || item.text === '往来' || item.text === '仓库'){
                this.BSarray.push(item);
              }
            }
          }
          // 获取业务应用
          else if(val.text === '业务应用'){
            for(let item of val.children){
              // 获取 业务应用-销售 应用
              if(item.text === '销售'){
                for(let ite of item.children){
                  //映射表 赋值
                  ite.code = businessMap[ite.text]
                  this.XSarray.push(ite);
                }
              }
              // 获取 采购应用
              if(item.text === '采购'){
                for(let val of item.children){
                  val.code = businessMap[val.text]
                  this.PURarray.push(val);
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
  mounted(){
    //清除缓存
    if(sessionStorage.getItem('EDIT_ADS_TRANSCODE')){
      sessionStorage.removeItem('EDIT_ADS_TRANSCODE')
    }
  },
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
