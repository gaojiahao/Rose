<template>
  <div class="inPage">
    <div class="content" ref='home'>
      <div class="wrapper">
        <!-- 用户头像部分 -->
        <div class="user_part">
          <div class="user_avatar vux-1px-b">
            <div class='user_info'>
              <img :src="userInfo.avatar">
              <div class="tips" style="display:inline-block;">欢迎,{{userInfo.name ? userInfo.name : '访问者'}}</div>
            </div>
            <div>
              <div class='current_entity' @click="showDrop = !showDrop">{{selItem.groupName}}
                <x-icon type="ios-arrow-down" :class="{'arrow-up': arrowDrop}" size="14"></x-icon>
              </div>
              <ul class="r-dropdown-list" v-show="showDrop">
                <li class="r-dropdown-item" :class="{'vux-1px-b': index !== entityList.length - 1}" v-for="(item, index) in entityList"
                    @click.stop="dropItemClick(item)" :key="index">
                  <span :class='{ active : selItem.groupName === item.groupName }'>{{item.groupName}}</span>
                </li>
              </ul>
            </div>  
          </div>
        </div>
        <!-- 基础应用部分 -->
        <basic-app :BSarray='BSarray' :goBasic='goBasic'></basic-app>
        <!-- 业务应用部分 -->
        <bus-app :BUSarray='BUSarray' :goList='goList' :getDefaultIcon='getDefaultIcon'></bus-app>
      </div>   
    </div>
  </div>
</template>

<script>
import {Icon} from 'vux'
// 接口引入
import homeService from 'service/homeservice'
import { getMsgList } from 'service/msgService.js'
// 映射表引入
import basicMap from './maps/basic'
import businessMap from './maps/businessApp'
// 组件引入
import busApp from 'components/home/busAppList'        // 业务应用
import basicApp from 'components/home/basicApp'        // 基础应用
// 插件引入
import Bscroll from 'better-scroll'
export default {
  data(){
    return{
      BUSobj: {},
      userInfo:{},         // 用户信息
      BSarray : [],        // 基础对象 数组
      BUSarray: [],        // 业务应用 数组
      homeScroll : null,
      entityList : [] ,//主体列表
      arrowDrop : false,
      showDrop :false,
      selItem : {}
    }
  },
  components:{ busApp, basicApp,Icon},
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
    },
    //获取代办数量
    getNews(){
      let newsNumber;
      return getMsgList().then( data => {
        if(data.dataCount > 99){
          newsNumber = '99+';
          return
        }
        newsNumber = data.dataCount;
        this.$event.$emit('badgeNum',newsNumber);
      })
    }, 
    //获取当前用户信息 
    getCurrentUser(){
      homeService.currentUser().then( data=>{
        data.sysGroupList && data.sysGroupList.forEach(item=>{
          if(item.groupType === 'C'){
            this.entityList.push(item);
            if(item.groupName === data.entityName){
              this.selItem = item;
            }
          }
        })
        if(this.entityList.length>1){
          this.arrowDrop = true;
        }
        console.log(this.entityList);
      })
    },
    // TODO 选择单条记录
    dropItemClick(item) {
      this.selItem = {...item};
      this.showDrop = false;
      this.$loading.show();
      homeService.changeEntity({entityId : item.groupCode}).then((data)=>{
        console.log(data);
        let tokenInfo = sessionStorage.getItem('ROSE_LOGIN_TOKEN');
        if(tokenInfo){
          tokenInfo = JSON.parse(tokenInfo);
          tokenInfo.entityId = data.entityId;
          tokenInfo.token = data.token;
          sessionStorage.setItem('ROSE_LOGIN_TOKEN',JSON.stringify(tokenInfo));
          location.reload();
        }
      })
    },
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
      //获取当前用户
      await this.getCurrentUser()
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
      await this.getNews();
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
    .user_info{
      display: flex;
      align-items: center;
      
    }
    img {
      width: .35rem;
      height: .35rem;
      border-radius: 50%;
    }
    .tips {
      margin-left:.05rem;
    }
  }
}
/* 列表容器 */
    .r-dropdown-list {
      position: absolute;
      right: 0;
      top: 100%;
      z-index: 100;
      border-bottom-left-radius: .08rem;
      border-bottom-right-radius: .08rem;
      background-color: #fff;
      box-shadow: 0 2px 10px #e8e8e8;
      box-sizing: border-box;
    }
    /* 列表项 */
    .r-dropdown-item {
      position: relative;
      line-height: .4rem;
      font-size: .16rem;
      span{
        display: inline-block;
        width:100%;
        box-sizing: border-box;
        padding: 0 .2rem;
      }
      .active{
        background: #e8e8e8;
      }
      .weui_icon_success-no-circle {
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
      }
    }
</style>
