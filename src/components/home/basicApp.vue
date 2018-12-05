<template>
  <div class="app-part">
      <div class="app-container">
        <div class="app_classify_name">
          <p>基础对象</p>
        </div>
        <div class="app-list">
          <div class="indval_app"
              @click="goBasic(app.listId)"
              v-for='(app, index) of BasicApps'
              :key='index'>
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
  }
}
</script>

<style lang='scss' scoped>
@import "./../scss/homeCommon.scss";
// 基础应用部分
.app-part {
  width: 100%;
  box-sizing: border-box;
  .app_classify_name {
    width: 100%;
    color: #111;
    font-weight: bold;
    font-size: .18rem;
    line-height: .18rem;
    padding: .04rem .1rem;
    margin: .2rem 0 .04rem;
    box-sizing: border-box;
    > p {
      padding-left: .04rem;
      border-left: 4px solid #5077aa;
    }
  }
  .app-list {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    padding: .08rem 0 .14rem;
    // 单个APP
    .indval_app {
      width: 50%;
      display: flex;
      margin-bottom: .1rem;
      border-radius: .08rem;
      box-sizing: border-box;
      padding: .04rem .1rem 0;
      .app_img {
        width: .5rem;
        height: .5rem;
        margin-right: .1rem;
        img {
          width: 100%;
          border-radius: .08rem;
        }
      }
      .app_info {
        flex: 1;
        padding-bottom: .1rem;
        .app_name {
          width: 1rem;
          overflow: hidden;
          font-size: .14rem;          
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .app_intro {
          color: #757575;
          font-size: .12rem;
        }
        .app_detail_btn {
          color: #006DFF;
          font-size: .12rem;
          font-weight: bold;
          margin-top: .02rem;
          width: fit-content;
          box-sizing: border-box;
          background: #EEEEF6;
          border-radius: 0.12rem;
          padding: .02rem .04rem;
          
        }
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
