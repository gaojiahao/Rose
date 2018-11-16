<template>
  <div class="inPage">
    <div class="content" ref='home'>
      <div class="wrapper">
        <div class="top-part-container">
          <div class="top-part">
            <div class="entity-part vux-1px-b">
              <div class="tips_title">
                <div>当前主体</div>
                <div class="entity_name"
                      :class="[userInfo.entityName && userInfo.entityName.length > 11 ? 'when-is-out': '']">{{userInfo.entityName}}</div>
              </div>
              <div class="tips-fade-part">
                <transition name='fade'>
                  <span v-if="!showDrop" key="on" class="iconfont icon-qiehuan1" @click="showDrop = !showDrop"></span>
                  <span v-else key="off" class="change_btn" @click="showDrop = !showDrop">取消</span>
                </transition>
              </div>
              <transition-group class="r-dropdown-list" name='list' tag='ul'>
                <li v-show="showDrop" class="r-dropdown-item" :key="index" :class="{'vux-1px-b': index !== entityList.length - 1}" v-for="(item, index) in entityList"
                    @click.stop="dropItemClick(item)" >
                  <span :class='{ active : selItem.groupName === item.groupName }'>{{item.groupName}}</span>
                </li>
              </transition-group>
            </div>
            <div class="user-info-container">
              <div class="user_avatar">
                <img :src="userInfo.avatar">
              </div>
              <div class="user-info">
                <p class="user_name">{{userInfo.nickname}}</p>
                <p class="user_other">@{{userInfo.userCode}}</p>
              </div>
            </div>
          </div>
        </div>
        <basic-app :BasicApps='BasicApps' :goBasic='goBasic' :goAppDetail='goAppDetail'></basic-app>
        <bus-app :BusApps='BusApps' :goList='goList' :goAppDetail='goAppDetail' :getDefaultIcon='getDefaultIcon'></bus-app>
      </div>
    </div>
  </div>
</template>

<script>
import {} from 'vux'
// 接口引入
import homeService from 'service/homeservice'
import { getMsgList } from 'service/msgService.js'
// 映射表引入
import basicMap from './maps/basic'
import Apps from './maps/businessApp'
import AppsFile from './maps/businessFile'
// 组件引入
import busApp from 'components/home/busAppList'        // 业务应用
import basicApp from 'components/home/basicApp'        // 基础应用
// 插件引入
import Bscroll from 'better-scroll'
export default {
  data(){
    return{
      BUSobj: {},
      userInfo:{},            // 用户信息
      BusApps: [],            // 业务应用
      BasicApps : [],         // 基础对象
      homeScroll : null,
      entityList : [] ,       //主体列表
      showDrop :false,
      selItem : {}
    }
  },
  components:{ busApp, basicApp },
  methods:{
    // 基础应用
    goBasic(item){
      this.$router.push({path: `${basicMap[item]}`})
    },
    // 前往列表
    goList(listId, name, file){
      this.$router.push({path: `/list/${file}/${listId}`, query: { name }})
    },
    goAppDetail(listId){
      this.$router.push({path: `/appDetail/${listId}`})
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
        this.$event.$emit('badgeNum', newsNumber);
      })
    },
    //获取当前用户信息
    getCurrentUser(){
      return homeService.currentUser().then( data =>{
        this.userInfo = {
          photo: data.photo,                      // 头像
          mobile: data.mobile,                    // 手机号
          userCode: data.userCode,                // 工号
          nickname: data.nickname,                // 姓名
          entityName: data.entityName             // 当前组织
        }
        // 获取 公司主体列表
        data.sysGroupList && data.sysGroupList.forEach(item=>{
          if(item.groupType === 'C'){
            this.entityList.push(item);
            if(item.groupName === data.entityName){
              this.selItem = item;
            }
          }
        })
      })
    },
    // TODO 选择单条记录
    dropItemClick(item) {
      this.selItem = {...item};
      this.userInfo.entityName = item.groupName;
      this.showDrop = false;
      this.$loading.show();
      homeService.changeEntity({entityId : item.groupCode}).then((data)=>{
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
          if(Apps[val.id]){
            // 动态生成数组
            BUSobj[val.text] = [];
            for(let item of val.children ){
              // 基础对象
              if(basicMap[item.listId]){
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
                  this.BasicApps.push(item);
                }
              }
              // 业务应用
              if(Apps[val.id][item.listId]){
                // 获取 应用类型ID 对应相应文件夹
                item.fileID = val.id;
                item.icon = item.icon
                  ? `/dist/${item.icon}`
                  : this.getDefaultIcon();
                // 归类到相应的小数组
                BUSobj[val.text].push(item);

              }
            }
            this.BusApps.push({
              id: val.id,
              name: val.text,
              appList: BUSobj[val.text]
            })
            this.$loading.hide();
          }
        }
      })
      // 获取 头像姓名
      let { name, avatar, position } = JSON.parse(sessionStorage.getItem('ROSE_LOGIN_TOKEN'));
      // 如果头像不存在则指定默认头像
      if(!avatar){
        let url = this.userInfo.photo;
        if(!this.userInfo.photo){
          url = require('assets/ava03.png');
        }
        avatar = url;
      };
      this.userInfo = { 
        ...this.userInfo,
        name, 
        avatar, 
        position 
      };
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
.fade-enter-active, .fade-leave-active {
  transition: all .3s ease;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}
.fade-enter {
  transform: translateX(30px);
}
.fade-leave-active {
  transform: translateX(-30px);
}
.list-enter-active, .list-leave-active {
  transition: all .3s ease;
}
.list-enter {
  opacity: 0;
  transform: translateY(-5px);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
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
// 顶部 用户头像部分
.top-part-container {
  width: 100%;
  padding: 0 .1rem;
  background: #fff;
  box-sizing: border-box;
  .top-part {
    padding-top: .04rem;
  }
  .entity-part {
    width: 100%;
    display: flex;
    position: relative;
    line-height: .24rem;
    align-items: flex-end;
    padding-bottom: .1rem;
    justify-content: space-between;
    .tips_title {
      color: #8A8A8A;
      font-size: .14rem;
      font-weight: bold;
    }
    .change_btn {
      color: #FFF;
      font-size: .14rem;
      padding: 0 .04rem;
      background: #3f72af;
      border-radius: .18rem;
    }
    .icon-qiehuan1 {
      color: #3f72af;
      font-size: .24rem;
      font-weight: bold;
    }
    .entity_name {
      color: #111;
      width: 2.6rem;
      height: .24rem;
      overflow: hidden;
      font-size: .22rem;
      font-weight: bold;
      position: relative;
      white-space: nowrap;
      &.when-is-out {
        &:after {
          right: 0; 
          bottom: 0; 
          content: ""; 
          height: inherit; 
          position: absolute; 
          padding-left: .18rem; 
          background: linear-gradient(to right, rgba(255,255,255,0), #fff 75%);
        }
      }
    }
    .tips-fade-part {
      width: 40px;
      height: 25px;
      position: relative;
      span {
        right: 0;
        position: absolute;
      }
    }
  }
  .user-info-container {
    display: flex;
    align-items: center;
    padding: .14rem 0 .06rem;
    .user_avatar {
      width: .65rem;
      height: .65rem;
      margin-right: .1rem;
      img {
        width: 100%;
        height: 100%;
        border-radius: .18rem;
        // border-radius: 50%;
      }
    }
    .user_name {
      font-size: .18rem;
      font-weight: bold;
    }
    .user_other {
      color: #757575;
      font-size: .14rem;
      // font-weight: bold;
    }
  }
}
/* 列表容器 */
.r-dropdown-list {
  left: 0;
  top: 100%;
  width: 100%;
  z-index: 100;
  position: absolute;
  box-sizing: border-box;
}
/* 列表项 */
.r-dropdown-item {
  position: relative;
  line-height: .4rem;
  font-size: .16rem;
  background: #FFF;
  span{
    width:100%;
    padding: 0 .1rem;
    background: #F9F9F9;
    display: inline-block;
    box-sizing: border-box;
  }
  .active{
    background: #e8e8e8;
  }
}
</style>
