<template>
  <div id="app" :class="{'hasNav':hasNav}">
    <keep-alive>
      <!-- 页面 -->
      <router-view v-if="$route.meta.keepAlive">
        <x-header
          v-if="hasNav"
          :title="$route.meta.title || ''"  
          slot = 'nav'
        >
        </x-header>
      </router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive">
      <x-header
        v-if="hasNav"
        :title="$route.meta.title || ''"  
        slot = 'nav'
      >
      </x-header>
    </router-view>

    <!-- 底部导航栏 -->
    <nav class="tabs vux-1px-t" v-if="hasTab">
      <router-link class="tab" v-for="(tab, index) in tablist" :to="tab.path" :key='index'>
        <span class="tabicon iconfont" :class="tab.icon"></span>
        <span class="title">{{tab.title}}</span>
        <badge v-if='tab.title === "任务" && newsNumber != 0'></badge>
      </router-link>
    </nav>
  </div>
</template>

<script>

import platform from './plugins/platform/index'
import { getMsgList } from 'service/msgService'
import { Badge,XHeader} from 'vux'
var DS = require('deepstream.io-client-js');
export default {
  name: 'app',
  data() {
    var hasNav = platform.isIPhone && window.isApp
    return{
      tablist: [
        {title: '消息', path: '/msg', icon:'icon-message1'},
        {title: '任务', path: '/notice/flowTodo',icon:'icon-task1'},
        {title: '应用', path: '/home',icon:'icon-apps'},
         {title: '通讯录',path: '/contacts/0',icon:'icon-Organization'},
        {title: '我',path:'/user',icon:'icon-my'}
      ],
      newsNumber:0,
      hasNav:hasNav,
      hasTab:true,
      theme:'',
    }
  },
  components:{
    Badge,XHeader
  },
  watch: {
    $route(to, from) {
      if(to.name!='DETAIL'&&from.name=='LIST'){
        from.meta.keepAlive = false;  
      }

       // cordova插件会定义一个StatusBar对象，当它只能在deviceready后才能使用
        if (cordova.platformId == 'android') { // 安卓需要特殊处理，参见 cordova 官方文档
        StatusBar.overlaysWebView(true)
      }
        document.addEventListener("deviceready", this.onDeviceReady, false)

    }
  },
  methods:{
    onDeviceReady () {
        // 根据路由动态改变状态栏样式
        // 我给状态栏字体色为白色的路由都设置了一个路由元meta,属性statusBgc为1
        StatusBar.styleLightContent();
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
    },
    getDs(dsUrl,uId){
      var protocol = (window.baseURL||'').indexOf('https') == 0 ? 'wss':'ws',
          vm = this,
          status,
          dsClient;
      
      if (window.baseURL) dsUrl = "172.roletask.com:6021/deepstream";//app测试代码
      return new Promise((resolve,reject)=>{
          if(vm.dsClient != null){
              resolve(vm.dsClient);
              return;
          }
          dsClient = new DS(protocol + '://' + dsUrl);
          dsClient.on( 'error', (error,type ) => {
              // do something with error
              if(type == "MESSAGE_DENIED")alert("服务器拒绝了一条消息")
              else if(type == 'connectionError')console.log('服务器连接障碍！')
          } );
          dsClient.on('connectionStateChanged', connectionState => {
              console.log('connectionState:',connectionState)
          });
          dsClient.login({
              username:uId
          },(success,data) => { //这里的函数reload时还会执行。
              if(success){
                  console.log("login in");
                  window.dsClient = vm.dsClient = dsClient;
                  resolve(dsClient);
              }else{
                  if(data)console.log('login error',data.msg);
                  dsClient.close();
              }
          });
      });
     
    },
  },
  created() {
     document.addEventListener("deviceready", this.onDeviceReady, false)
    var Vue = this.$parent.constructor;
    this.getTheme();
    this.$event.$on('badgeNum', (val) => {
      this.newsNumber = val;
    });
    Vue.prototype.getApp= ()=> this;
  },
  updated() {
    var app = this;
    // 安卓的输入框会挡住input输入的解决办法
    if (platform.isAndroid) {
      window.addEventListener("resize", function() {
        if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
          setTimeout(() => {
            document.activeElement.scrollIntoViewIfNeeded();
          }, 0);
        }
        app.$emit('resize');
      })
    }
  }
}
</script>

<style lang="less">
  @import '~vux/src/styles/reset.less';
  @import '~vux/src/styles/1px.less';
  @import './assets/app.less';

  @import './common/swiper-4.2.2.min.css';
  @import './assets/weui.min.css';
  @import './assets/iconfont/icon.css';
  @import './assets/iconfont/iconfont.css';

  .vux-1px-t:before {
    border-color: #E8E8E8;
  }
  html {
    font-size:62.5%;
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