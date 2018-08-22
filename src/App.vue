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
        <span class="title">{{tab.title}}</span>
        <badge :text='newsNumber' v-if='tab.title === "消息" && newsNumber > 0'></badge>
      </router-link>
    </nav>
  </div>
</template>

<script>
  require('../static/css/iconfont/iconfont.css')
  import {getMsgList} from 'service/msgService.js'
  import { Badge } from 'vux'
  export default {
    name: 'app',
    data(){
      return{
        tablist: [
					{title: '首页', path: '/home', icon: 'icon-shouye1'},
					{title: '消息', path: '/notice', icon: 'icon-xiaoxi'},
        ],
        newsNumber:0,
      }
    },
    components:{
      Badge
    },
    created(){
      getMsgList().then( data => {
        if(data.dataCount > 99){
          this.newsNumber = '99+';
          return
        }
        this.newsNumber = data.dataCount;
      })
    }
  }
</script>

<style lang="less">
  @import '~vux/src/styles/reset.less';
  @import '~vux/src/styles/1px.less';
  @import './common/swiper-4.2.2.min.css';

  html {
    height: 100%;
  }
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
  .inPage {
    width: 100%;
    height: 100%;
  }
  .pages {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    bottom: .49rem;
    overflow: hidden;
    position: absolute;
    background: #fff;
    z-index: 10;
  }
  // 导航标签
  .tabs {
    left: 0;
    bottom: 0;
    width: 100%;
    display: flex;
    height: .49rem;
    overflow: hidden;
    background: #fff;
    position: absolute!important;
    .tab {
      flex: 1;
      position: relative;
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
      .vux-badge {
        top: 2px;
        left: 53%;
        height: .16rem;
        font-size: .1rem;
        padding: 0 .04rem;
        position: absolute;
        line-height: .16rem;
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
