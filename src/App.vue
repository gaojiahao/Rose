<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'app'
  // watch:{
  //   $route(to,from){
  //     console.log(to);
  //     console.log(from);

  //   }
  // }
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';
@import '~vux/src/styles/1px.less';
@import '../static/css/iconfont/iconfont.css';

html,body {
  width: 100%;
  height: 100%;
  background: #F5F5F5;
}
.pages {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 100;
}
#app{
  width: 100%;
  height: 100%;
}

</style>
