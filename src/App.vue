<template>
  <div id="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
  require('../static/css/iconfont/iconfont.css')
  export default {
    name: 'app',
  }
</script>

<style lang="less">
  @import '~vux/src/styles/reset.less';
  @import '~vux/src/styles/1px.less';
  @import './common/swiper-4.2.2.min.css';
  @import './common/mescroll.min.css';

  body {
    margin: 0 auto;
    width: 100%;
    height: 100%;
    max-width: 640px;
    font-size: .16rem;
    background-color: #fff;
    font-family: -apple-system-font, "Helvetica Neue", sans-serif, Microsoft YaHei, Arial, Helvetica, sans-serif;
  }
  ul,li{
    list-style: none;
  }
  #app {
    width: 100%;
    height: 100%;
  }

  .pages {
    width: 100%;
    height: 100%;
  }
</style>
