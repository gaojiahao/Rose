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
* {
  list-style:none;
}
body {
  margin: 0 auto;
  max-width: 640px;
  font-size: 16px;
  background-color: #fff;
  font-family: -apple-system-font,Helvetica,Microsoft YaHei,Arial,sans-serif;
}
</style>
