<template>
  <div id="app">
    <keep-alive>
      <!-- 页面 -->
      <router-view v-if="$route.meta.keepAlive">
         <x-header
      v-if="isShowNav()"
      :title="$route.meta.title || ''"  slot = 'nav'>
     </x-header>
      </router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive">
       <x-header
      v-if="isShowNav()"
      :title="$route.meta.title || ''"  slot = 'nav'>
     </x-header>
    </router-view>

    <!-- 底部导航栏 -->
    <nav class="tabs vux-1px-t" v-if="this.$route.path != '/login'">
      <router-link class="tab" v-for="(tab, index) in tablist" :to="tab.path" :key='index'>
        <span class="tabicon iconfont" :class="tab.icon"></span>
        <span class="title">{{tab.title}}</span>
        <badge v-if='tab.title === "消息" && newsNumber != 0'></badge>
      </router-link>
    </nav>
  </div>
</template>

<script>

import platform from './plugins/platform/index'
import { getMsgList } from 'service/msgService'
import { Badge,XHeader} from 'vux'
export default {
  name: 'app',
  data() {
    return{
      tablist: [
        {title: '应用', path: '/home', icon: 'icon-1'},
        {title: '消息', path: '/notice', icon: 'icon-message'},
      ],
      newsNumber:0,
      theme:'',
    }
  },
  components:{
    Badge,XHeader
  },
  methods:{
    isShowNav(){
      return platform.isIPhone && window.isApp
    },
    /**
     * @description: 获取默认主题
     * @param {type} 
     * @return: 
     * @author: Gabriel.gaojiahao
     */        
    getTheme(){
      this.theme = localStorage.getItem('theme') || window.document.documentElement.getAttribute('data-theme');
      if(!this.theme){
        this.theme = 'default-theme';
        window.document.documentElement.setAttribute('data-theme', 'default-theme');
        localStorage.setItem('theme','default-theme');
      } else {
        window.document.documentElement.setAttribute('data-theme', this.theme);  
      }
    },
    setTheme(theme){
      if(theme){
        localStorage.setItem('theme',theme);
        this.theme = theme;
        window.document.documentElement.setAttribute('data-theme', theme);  
      }
    }
  },
  created() {
    this.getTheme();
    this.$event.$on('badgeNum', (val) => {
      this.newsNumber = val;
    })
  },
  updated() {
    // 安卓的输入框会挡住input输入的解决办法
    if (platform.isAndroid) {
      window.addEventListener("resize", function() {
        if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
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
  @import './common/swiper-4.2.2.min.css';
  @import './assets/iconfont/icon.css';
  @import './assets/iconfont/iconfont.css';

  .vux-1px-t:before {
    border-color: #E8E8E8;
  }
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
    font-family: -apple-system, BlinkMacSystemFont,
    "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell",
    "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  }
  .iconfont {
    font-size: .16rem;
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
    position: relative;
  }
  .pages {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    bottom: .49rem;
    overflow: hidden;
    position: absolute;
    background: #FFF;
    z-index: 10;
  }
  
</style>
<style lang="scss" scoped>
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
        top: 8%;
        left: 52%;
        position: absolute;

      }
    }
    // 点击样式
    .tab.router-link-active {
      .tabicon,
      .title {
        @include font_color();
      }
    }
  }
</style>