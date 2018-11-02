<template>
  <div id="app">
    <keep-alive>
      <!-- 页面 -->
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
import platfrom from '@/plugins/platform'
export default {
  name: 'app',
  updated(){
    // 安卓的输入框会挡住input输入的解决办法
    if(platfrom.isAndroid){
      window.addEventListener("resize", function() {
        if(document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
          setTimeout(() => {
            document.activeElement.scrollIntoViewIfNeeded();
          }, 0);
        }
      })
    }
  }
}
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';
@import '~vux/src/styles/1px.less';
@import '../static/css/iconfont/iconfont.css';
@import '../static/css/common.css';

html,body {
  width: 100%;
  height: 100%;
  // background: #F5F5F5;
}
body {
  font-size: .16rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
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
