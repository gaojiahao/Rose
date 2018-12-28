<template>
  <div class="inPage">
    <div class="content" ref='home'>
      <div class="wrapper">
        <div class="top-part-container">
          <div class="top-part">
            <div class="user-info-container">
              <div class="user_avatar">
                <img :src="userInfo.avatar">
              </div>
              <div class="user-info">
                <p class="user_name">{{userInfo.nickname}}</p>
                <p class="user_other">@{{userInfo.userCode}}</p>
              </div>
            </div>
            <div class="entity-part" :class="{'active': showDrop}"
              @click="showDrop = !showDrop">
              <span class="entity_name">{{userInfo.entityName}}</span>
              <span v-if="entityList.length > 1" class="iconfont" :class="{'icon-xia' : !showDrop, 'icon-shang' : showDrop}"></span>
              <ul class="r-dropdown-list" v-show="showDrop">
                <li class="r-dropdown-item" :class="{'vux-1px-b': index !== entityList.length - 1 }" :key="index" v-for="(item, index) in entityList"
                    @click.stop="dropItemClick(item)" >
                  <div class="each_item" :class="{'active is-being-sel' : selItem.groupCode === item.groupCode}">
                    <p class="full_name">{{item.groupName}}</p>
                    <p class="shor_name">简称: {{item.groupShortName}}</p>
                  </div>
                  <div class="tips_part" v-if="selItem.groupCode === item.groupCode">
                    <span class="tips_word">当前选中</span>
                  </div>
                </li>
              </ul>    
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
    goList(listId, name, file, childId){
      this.$router.push({
        path: `/list/${file}/${listId}`, 
        query: { 
          name,
          childId
        }
      })
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
      return homeService.currentUser().then(data =>{
        this.userInfo = {
          photo: data.photo,                      // 头像
          mobile: data.mobile,                    // 手机号
          userCode: data.userCode,                // 工号
          nickname: data.nickname,                // 姓名
          entityName: data.entityName && data.entityName.slice(0, 4) || '' // 当前组织
        }
        // 获取 公司主体列表
        data.sysGroupList && data.sysGroupList.forEach(item => {
          if(item.groupType === 'C'){
            this.entityList.push(item);
            if(item.groupCode === data.entityId){
              this.selItem = item;
            }
          }
        })
      })
    },
    // TODO 选择单条记录
    dropItemClick(item) {
      if(this.selItem.groupCode === item.groupCode) return;
      this.selItem = {...item};
      this.userInfo.entityName = item.groupName.slice(0, 4);
      this.showDrop = false;
      this.$loading.show();
      homeService.changeEntity({entityId : item.groupCode}).then((data) => {
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
        let childObj = {};
        for(let val of res){
          // 获取应用
          if(Apps[val.id]){
            // 对象里动态生成数组
            BUSobj[val.text] = [];
            for(let item of val.children){
              // 基础对象
              if(basicMap[item.listId]){
                // 图片处理
                item.icon = item.icon 
                  ? `/dist/${item.icon}`
                  : ''
                this.BasicApps.push(item);
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
              // 如果业务应用底下存在分类
              if(Apps[val.id][item.id]){
                for(let child of item.children) {
                  if(Apps[val.id][item.id][child.listId]) {
                    child.fileID = val.id;
                    child.icon = child.icon
                    ? `/dist/${child.icon}`
                    : this.getDefaultIcon();
                    if(!BUSobj[val.text][item.text]) {
                      this.$set(BUSobj[val.text], item.text, {childId: item.id, childName: item.text, childList: [child]})
                    }
                    else {
                      BUSobj[val.text][item.text].childList.push(child)
                    }
                  }
                }
              }
            }
            this.BusApps.push({
              id: val.id,
              name: val.text,
              appList: {...BUSobj[val.text]}
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
          url = require('assets/ava01.png');
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

.bounce-enter-active {
  animation: bounce-in .5s;
}
.bounce-leave-active {
  animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.5);
  }
  100% {
    transform: scale(1);
  }
}
.list-enter {
  // opacity: 0;
  // transform: translateY(-20px);
}
.list-leave-to {
  // opacity: 0;
  // transform: translateY(-10px);
}
.inPage {
  // background: #F5F5F5;
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
    width: 100%;
    display: flex;
    padding-top: .1rem;
    align-items: center;
    justify-content: space-between;
  }
  .entity-part {
    display: flex;
    color: #7A7A7A;
    position: relative;
    align-items: center;
    border-radius: .2rem;
    background: #F5F5F5;
    padding: .1rem .12rem;
    justify-content: center;
    // &:before {
    //   width: 0;
    //   height: 0;
    //   bottom: -13px; 
    //   right: 50%;
    //   transform: translateX(50%);
    //   content: '';
    //   z-index: 9999;
    //   border-width: 9px;
    //   position: absolute;
    //   border-style: solid; 
    //   border-color: transparent transparent #FFF transparent;
    // }
    // &:after {
    //   width: 0;
    //   height: 0;
    //   bottom: -12px; 
    //   right: 50%;
    //   transform: translateX(50%);
    //   content: '';
    //   position: absolute;
    //   border-style: solid; 
    //   border-width: 10px;
    //   border-color: transparent transparent rgba(232, 232, 232, .3) transparent;
    // }
    .entity_name {
      font-size: .14rem;
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
    .iconfont {
      right: 8px;
      color: #7A7A7A;
      font-size: .12rem;
      margin-left: .04rem;
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
    .user_avatar {
      width: .4rem;
      height: .4rem;
      margin-right: .1rem;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    .user-info {
      line-height: .18rem;
      .user_name {
        font-size: .14rem;
        font-weight: bold;
      }
      .user_other {
        color: #757575;
        font-size: .14rem;
        // font-weight: bold;
      }
    }
  }
}

/* 列表容器 */
.r-dropdown-list {
  $bgColor: #FFF;
  right: 0;
  top: 130%;
  width: 2rem;
  z-index: 100;
  position: absolute;
  background: $bgColor;
  box-shadow: 0 1px 5px #e8e8e8;
  border-radius: .06rem;
  box-sizing: border-box;
  &:before {
    width: 0;
    height: 0;
    top: -17px; 
    right: 10.5%;
    content: '';
    z-index: 9999;
    border-width: 9px;
    position: absolute;
    border-style: solid; 
    border-color: transparent transparent #FFF transparent;
  }
  &:after {
    width: 0;
    height: 0;
    top: -20px; 
    right: 10%;
    content: '';
    position: absolute;
    border-style: solid; 
    border-width: 10px;
    border-color: transparent transparent rgba(232, 232, 232, .3) transparent;
  }
}
/* 列表项 */
.r-dropdown-item {
  width:100%;
  display: flex;
  position: relative;
  align-items: baseline;
  padding: .12rem .1rem;
  box-sizing: border-box;
  justify-content: space-between;
  .each_item {
    width: 100%;
    &.is-being-sel {
      width: 75%;
    }    
    .full_name {
      width: 100%;
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .shor_name {
      font-size: .1rem;
    }
  }
  .tips_part {
    color: #757575;
    font-size: .1rem;
    .tips_word {
      padding: .02rem;
      border-radius: .3rem;
      background: #e8e8e8;
    }
  }
  .active {
    color: #006DFF;
    font-weight: bold;
  }
}
</style>
