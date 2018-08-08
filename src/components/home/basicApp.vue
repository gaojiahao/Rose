<template>
  <div class="basic_part defalut_bg">
      <div class="basic_list">
        <div class="indval_app"
            @click="goBasic(item.text)"
            v-for='(item, index) of BSarray'
            :key='index'
            :style="{ 
              background:`${item.bgColor} url(${item.icon}) no-repeat .7rem .1rem / 50%` ,
              boxShadow: `0 2px 5px ${item.boxShadow}`
            }">
          <div class="app_type">{{item.transName}}</div>
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
  }
}
</script>

<style lang='scss' scoped>
  @import "./../scss/homeCommon.scss";
// 基础应用部分
.basic_part {
  box-sizing: border-box;
  border-bottom-left-radius: 8rem .5rem;
  border-bottom-right-radius: 8rem .5rem;
  .basic_list {
    display: flex;
    padding: .1rem .04rem .24rem;
    // 单个APP
    .indval_app {
      flex: 1;
      color: #fff;
      margin: 0 .04rem;
      border-radius: .06rem;
      box-sizing: border-box;
      padding: .04rem .04rem 0;
      box-shadow: 0 2px 10px #e8e8e8;
      // 业务类型
      .app_type {
        font-size: .12rem;
      }
      // 应用名称
      .app_name {
        font-size: .18rem;
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
}
</style>
