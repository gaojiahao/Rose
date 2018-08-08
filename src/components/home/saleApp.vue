<template>
  <div class="app_part">
    <!-- 应用标题 -->
    <div class="list_title">
      <p class="btm_text">SALE</p>
      <div class="bg_title">
        <div class="title">销售</div>
        <div class="more">
          <span>更多</span>
          <x-icon class="right_arrow" type="ios-arrow-forward" size="14"></x-icon>
        </div>
      </div>
    </div>
    <!-- 应用列表 -->
    <div class="app_list defalut_bg mg_auto">
        <!-- 单个app -->
        <div class="each_app"
            @click='goList(item.code)'
            v-for="(item, index) of XSarray"
            :key='index'>
            <div class="app_img">
              <img :src='item.icon'>
            </div>
            <div class="app_info">
              <div class="app_name">{{item.text}}</div>
              <div class="app_intro">{{item.transName}}</div>
            </div>
        </div>
    </div>
  </div>
</template>

<script>
export default {
  props:{
    XSarray: {
      type: Array,
      require: true
    },
    goList: {
      type: Function,
      require: true
    }
  }
}
</script>

<style lang='scss' scoped>
@import "./../scss/homeCommon.scss";
</style>
