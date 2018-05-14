<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app'
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';
@import '~vux/src/styles/1px.less';
@import url('./common/swiper-4.2.2.min.css');
@import url('./common/mescroll.min.css');
body {
  width: 100%;
  height: 100%;
  font-size: .32rem;    // 16px
  background-color: #fff;
}
#app {
  width: 100%;
  height: 100%;
}
.pages{
    width: 100%;
    height: 100%;
}
</style>
