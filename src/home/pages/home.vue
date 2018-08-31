<template>
  <div class="inPage">
    <div class="content" ref='home'>
      <div class="wrapper">
        <!-- 用户头像部分 -->
        <div class="user_part">
          <div class="user_avatar vux-1px-b">
            <img :src="userInfo.avatar">
            <div class="tips">欢迎,{{userInfo.name ? userInfo.name : '访问者'}}</div>
          </div>
        </div>
        <!-- 基础应用部分 -->
        <basic-app :BSarray='BSarray' :goBasic='goBasic'></basic-app>
        <!-- 业务应用部分 -->
        <bus-app :BUSarray='BUSarray' :goList='goList' :getDefaultIcon='getDefaultIcon'></bus-app>
      </div>   
    </div>
    <!-- <loadding :show='showLoadding'></loadding> -->
  </div>
</template>

<script>
// 接口引入
import homeService from 'service/homeservice'
// 映射表引入
import basicMap from './maps/basic'
import businessMap from './maps/businessApp'
// 组件引入
import busApp from 'components/home/busAppList'        // 业务应用
import basicApp from 'components/home/basicApp'        // 基础应用
// 插件引入
import Bscroll from 'better-scroll'
import Loadding from 'components/Loading'
export default {
  data(){
    return{
      BUSobj: {},
      userInfo:{},         // 用户信息
      BSarray : [],        // 基础对象 数组
      BUSarray: [],        // 业务应用 数组
      homeScroll : null,
      showLoadding : true,
    }
  },
  components:{ busApp, basicApp, Loadding },
  methods:{
    // 基础应用
    goBasic(item){
      this.$router.push({ path : `${basicMap[item]}`})
    },
    // 前往列表
    goList(item){
      this.$router.push({ path:`/list/${item}`})
    },
    // 设置默认图片
    getDefaultIcon(app){
      let url = require('assets/defaultApp.png');
      if(app){
        app.icon = url;
      }
      return url;
    }
  },
  watch:{
    $route:{
      handler(val){
        // 返回首页进行滑动刷新
        if(val.name === 'HOME'){
          this.homeScroll.refresh();
        }
      }
    }
  },
  created(){
    this.$loading.show();
    (async() => {
      // 获取首页应用列表
      await homeService.getMeau().then( res => {
        let BUSobj = this.BUSobj;
        for(let val of res){
          // 获取应用
          if(businessMap[val.text]){
            // 循环生成空数组
            BUSobj[val.text] = [];
            for(let item of val.children ){
              // 基础对象
              if(basicMap[item.text]){
                if(item.transName){
                  // 动态添加对应的背景底色
                  switch(item.text){
                    case '仓库':
                      item.bgColor = '#D85656';
                      item.boxShadow = '#D85656';
                      break;
                    case '产品与物料':
                      item.bgColor = '#F29C35';
                      item.boxShadow = '#F29C35';
                      break;
                    case '所有往来账户':
                      item.bgColor = '#338183';
                      item.boxShadow = '#338183';
                      break;
                  }
                  // 图片处理
                  item.icon = item.icon
                    ? `/dist/${item.icon}`
                    : ''
                  this.BSarray.push(item);              
                }
              }
              // 业务应用
              if(businessMap[val.text][item.text]){
                item.code = businessMap[val.text][item.text]
                item.icon = item.icon
                  ? `/dist/${item.icon}`
                  : this.getDefaultIcon();
                // 归类到相应的小数组
                BUSobj[val.text].push(item);     
              }
            }
            if(val.text !== '产品'){
              // 针对应用数组 进行 分类大汇总
              this.BUSarray.push({ 
                name: val.text, 
                appList: BUSobj[val.text]
              });                  
            }
            this.$loading.hide();     
          }
        }        
      }).catch( err => {
        this.$vux.alert.show({
          content: '首页加载有误，请尝试刷新'
        })
      });
      // 获取 头像姓名
      let { name, avatar } = JSON.parse(sessionStorage.getItem('ROSE_LOGIN_TOKEN'));
      // 如果头像不存在则指定默认头像
      if(!avatar){
        let url = require('assets/ava03.png')
        avatar = url;
      };
      this.userInfo = { name, avatar };
    })()
  },
  mounted(){
    this.homeScroll = new Bscroll(this.$refs.home,{
      click:true
    })
  }
    
}
</script>

<style lang='scss' scoped>
.inPage {
  background: #F5F5F5;
}
.vux-1px-b:after {
  border-color: #e8e8e8;
}
.content {
  width: 100%;
  height: calc(100% - .49rem);
  overflow: hidden;
  .wrapper {
    padding-bottom: .1rem;
  }
}
.mg_auto {
  width: 95%;
  margin: 0 auto;
}
// 顶部 用户头像部分
.user_part {
  display: flex;
  padding: 0 .1rem;
  background: #fff;
  box-sizing: border-box;
  .user_avatar {
    width: 100%;
    display: flex;
    padding: .04rem 0 .02rem;
    align-items: center;
    justify-content: space-between;
    img {
      width: .35rem;
      height: .35rem;
      border-radius: 50%;
    }
    .tips {
      font-size: .18rem;
    }
  }
}

</style>
