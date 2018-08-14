<template>
  <div id="app" class="app">
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
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

  * {
    list-style: none;
  }

  html {
    height: 100%;
  }

  body {
    width: 100%;
    height: 100%;
    margin: 0 auto;
    max-width: 640px;
    font-size: 16px;
    background-color: #fff;
    font-family: -apple-system-font, "Helvetica Neue", sans-serif, Helvetica, Microsoft YaHei, Arial, sans-serif;
  }

  .app {
    height: 100%;
    .pages {
      height: 100%;
    }
  }
</style>
