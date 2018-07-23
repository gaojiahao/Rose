<template>
  <div id="app">
    <keep-alive>
      <!-- 页面 -->
      <router-view v-if="$route.meta.keepAlive"></router-view> 
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>

    <!-- 底部导航栏 -->
    <nav class="tabs vux-1px-t">
      <router-link class="tab" v-for="(tab, index) in tablist" :to="tab.path" :key='index'>
        <span class="tabicon iconfont" :class="tab.icon"></span>
        <em class="title">{{tab.title}}</em>
      </router-link>
    </nav>   
  </div>
</template>

<script>
  require('../static/css/iconfont/iconfont.css')
  export default {
    name: 'app',
    data(){
      return{
        tablist: [
					{title: '首页', path: '/newhome', icon: 'icon-shouye1'},
					{title: '消息', path: '/message', icon: 'icon-xiaoxi'},
        ]
      }
    }
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
    top: 0;
    left: 0;
    z-index: 10;
    width: 100%;
    height: 100%;
    bottom: .49rem;
    overflow: hidden;
    position: absolute;
  }
  // 导航标签
  .tabs {
    width: 100%;
    height: .49rem;
    position: absolute!important;
    bottom: 0;
    left: 0;
    display: flex;
    .tab {
      flex: 1;
      // icon图标
      .tabicon{
        width: 100%;
        height: .3rem;
        color: #666;
        display: block;
        text-align: center;
        font-size: .28rem;
        line-height: .36rem;
      }
      // 标题
      .title {
        display: block;
        width: 100%;
        height: .24rem;
        text-align: center;
        font-size: .12rem;
        font-style: normal;
        color: #666;
      }
    }
    // 点击样式
    .tab.router-link-active {
      .tabicon,
      .title {
        color: #5077aa;
      }
    }
  }
</style>
