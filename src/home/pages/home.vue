<template>
  <div class="inPage">
    <div class="content" ref="home">
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
            <div class="entity-part" :class="{'active': showDrop}" @click="showDrop = !showDrop">
              <span class="entity_name">{{userInfo.entityName}}</span>
              <span
                v-if="entityList.length > 1"
                class="iconfont"
                :class="{'icon-xia' : !showDrop, 'icon-shang' : showDrop}"
              ></span>
              <ul class="r-dropdown-list" v-show="showDrop">
                <li
                  class="r-dropdown-item"
                  :class="{'vux-1px-b': index !== entityList.length - 1 }"
                  :key="index"
                  v-for="(item, index) in entityList"
                  @click.stop="dropItemClick(item)"
                >
                  <div
                    class="each_item"
                    :class="{'active is-being-sel' : selItem.groupCode === item.groupCode}"
                  >
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
        <div class="list_top">
          <div class='search'>
            <form class="search_part" :class="'has-filter'" action="" @submit.prevent= "searchMenu">
              <i class="icon icon-search"></i>
              <input ref="searchInp" class="srh_inp" type="search" autocomplete="off"
                    placeholder="应用名称" @input='getSearchValue($event)' :value='searchValue'>
              <div class="pop_cfm" @click="searchMenu">搜索</div>
              <i class="icon-clear clear_icon" @click="clearSearch"></i>
            </form>
          </div>
        </div>
        <basic-app :BasicApps="BasicApps"></basic-app>
        <bus-app :BusApps="BusApps"></bus-app>
      </div>
      <div class="el-fade-in">
        <div class="page-component-up" @click="scrollToTop" v-show="toTopShow">
          <span class="icon icon-scroll-top"></span>
        </div>
      </div>
    </div>
    <div class="close-part" v-show="showDrop" @click="showDrop = false"></div>
  </div>
</template>

<script>
// 接口引入
import homeService from "service/homeservice";
import commonService from "service/commonService";
import tokenService from "service/tokenService";
import { getMsgList } from "service/msgService";
// 映射表引入
import basicMap from "./apps/basicApp/maps/basic";
// 组件引入
import busApp from "homePage/components/home-related/busAppList"; // 业务应用
import basicApp from "homePage/components/home-related/basicApp"; // 基础应用
// 插件引入
import Bscroll from "better-scroll";
import { constants } from 'crypto';
const ROSE_MENU = 'ROSE_MENU';
export default {
  data() {
    return {
      BUSobj: {},
      userInfo: {}, // 用户信息
      selItem: {}, // 选中的主体内容
      BusApps: [], // 业务应用
      BasicApps: [], // 基础对象
      entityList: [], // 主体列表
      showDrop: false, // 是否显示主体下拉选择
      homeScroll: null, // 滑动实例
      searchValue: '',
      yScrollValue: 0,
      toTopShow:false,
      sessionApps: [],
    };
  },
  components: { busApp, basicApp },
  methods: {
    initData: async function() {
      this.$loading.show();
      //获取当前用户
      await this.getCurrentUser();
      // 获取首页应用列表
      await this.initMenu();
      // 获取 头像姓名
      let { name, avatar, position } = tokenService.getToken(true);
      // 如果头像不存在则指定默认头像
      if (!avatar) {
        let url = this.userInfo.photo;
        if (!this.userInfo.photo) {
          url = require("assets/ava01.png");
        }
        avatar = url;
      }
      this.userInfo = {
        ...this.userInfo,
        name,
        avatar,
        position
      };
      await this.getNews();
      this.$loading.hide();
    },
    //获取代办数量
    getNews() {
      let newsNumber;
      return getMsgList().then(data => {
        if (data.dataCount > 99) {
          newsNumber = "99+";
          //return;
        }
        newsNumber = data.dataCount;
        this.$event.$emit("badgeNum", newsNumber);
      });
    },
    //获取当前用户信息
    getCurrentUser() {
      return commonService.getBasicInfo().then(baseInfo => {
        var data = baseInfo.currentUser;
        this.userInfo = {
          photo: data.photo, // 头像
          mobile: data.mobile, // 手机号
          userCode: data.userCode, // 工号
          nickname: data.nickname, // 姓名
          entityName: (data.entityName && data.entityName.slice(0, 4)) || "" // 当前组织
        };
        // 获取 公司主体列表
        data.sysGroupList &&
          data.sysGroupList.forEach(item => {
            if (item.groupType === "C") {
              this.entityList.push(item);
              if (item.groupCode === data.entityId) {
                this.selItem = item;
              }
            }
          });
      });
    },
    // 获取应用icon
    getDefaultIcon(item) {
      let url = require("assets/defaultApp.png");
      if (item) {
        item.icon = url;
      }
      return url;
    },
    initMenu() {
      this.sessionApps = JSON.parse(sessionStorage.getItem(ROSE_MENU));
      if(this.sessionApps) {
        this.dealMenu(this.sessionApps);  
      } else {
        return homeService.getMenu().then(res => {
          this.dealMenu(res);
        });
      }
    },
    dealMenu(res) {
      let BUSobj = this.BUSobj;
      this.BasicApps = [];
      this.BusApps = [];
      
      for (let val of res) {
        BUSobj[val.text] = []; //分类

        //item 应用
        for (let item of val.children) {
          // 基础对象应用需 根据映射表 单独处理
          if (val.text == '基础对象' || basicMap[item.listId]) {
            // 图片处理
            item.icon = item.icon ? `${item.icon}` : "";
            this.BasicApps.push(item);
          }
          // 处理 业务应用
          if (!item.children) {
            // 获取 应用类型ID 对应相应文件夹
            item.fileID = val.id;
            // 处理 应用图标
            if (item.icon) {
              item.icon.includes("download")
                ? // 用户自定义上传 应用icon
                  (item.icon = `${location.origin}${item.icon}`)
                : // 系统自带图标
                  (item.icon = `${item.icon}`);
            } else {
              // 初始化应用图标
              this.getDefaultIcon();
            }
            // 归类到相应的小数组
            BUSobj[val.text].push(item);
          }
          // 如果应用里面 存在分类
          if (item.children) {
            for (let childItem of item.children) {
              if (true || childItem.packagePath) {
                childItem.fileID = val.id;
                childItem.icon = childItem.icon
                  ? `${childItem.icon}`
                  : this.getDefaultIcon();
                if (!BUSobj[val.text][item.text]) {
                  this.$set(BUSobj[val.text], item.text, {
                    childId: item.id,
                    childName: item.text,
                    childList: [childItem]
                  });
                } else {
                  BUSobj[val.text][item.text].childList.push(childItem);
                }
              }
            }
          }
        }

        if (true || val.folder) {
          this.BusApps.push({
            id: val.id,
            name: val.text,
            folder: val.folder,
            appList: { ...BUSobj[val.text] }
          });
        }
      }
      if(!this.sessionApps) {
        sessionStorage.setItem(ROSE_MENU,JSON.stringify(res));
      }
    },
    // 选择单条记录
    dropItemClick(item) {
      if (this.selItem.groupCode === item.groupCode) return;
      this.selItem = { ...item };
      this.showDrop = false;
      this.$loading.show();
      homeService.changeEntity({ entityId: item.groupCode }).then(data => {
        let tokenInfo = tokenService.getToken(true);
        if (tokenInfo) {
          tokenInfo.entityId = data.entityId;
          tokenInfo.token = data.token;
          tokenService.setToken(tokenInfo);
          location.reload();
        }
      });
    },
    //获取搜索值
    getSearchValue(e) {
      this.searchValue = e.target.value;
    },
    //搜索 菜单
    searchMenu() {
      let BUSobj = this.BUSobj,
          filter = this.searchValue,
          res = JSON.parse(sessionStorage.getItem(ROSE_MENU));
      this.BasicApps = [];
      this.BusApps = [];

      if(!filter) {
        this.dealMenu(this.sessionApps);
        return ;
      }
      for (let val of res) {
        BUSobj[val.text] = []; //分类

        //item 应用
        for (let item of val.children) {
          // 基础对象应用需 根据映射表 单独处理
          if (val.text == '基础对象' || basicMap[item.listId]) {
            // 图片处理
            item.icon = item.icon ? `${item.icon}` : "";
            if(filter) {
              if(item.text.indexOf(filter) !=-1) {
                this.BasicApps.push(item);
              }
            }
          }
          // 处理 业务应用
          if (!item.children) {
            // 获取 应用类型ID 对应相应文件夹
            item.fileID = val.id;
            // 处理 应用图标
            if (item.icon) {
              item.icon.includes("download")
                ? // 用户自定义上传 应用icon
                  (item.icon = `${location.origin}${item.icon}`)
                : // 系统自带图标
                  (item.icon = `${item.icon}`);
            } else {
              // 初始化应用图标
              this.getDefaultIcon();
            }
            // 归类到相应的小数组
            if(filter) {
              if(item.text.indexOf(filter) !=-1) {
                BUSobj[val.text].push(item);
              }
            }
          }
          // 如果应用里面 存在分类
          if (item.children) {
            for (let childItem of item.children) {
              if (true || childItem.packagePath) {
                childItem.fileID = val.id;
                childItem.icon = childItem.icon
                  ? `${childItem.icon}`
                  : this.getDefaultIcon();
                  if(filter) {
                    if(childItem.text.indexOf(filter) !=-1) {
                      if (!BUSobj[val.text][item.text]) {
                        this.$set(BUSobj[val.text], item.text, {
                          childId: item.id,
                          childName: item.text,
                          childList: [childItem]
                        });
                      } else {
                        BUSobj[val.text][item.text].childList.push(childItem);
                      }
                    }
                  }
              }
            }
          }
        }

        if (true || val.folder) {
          this.BusApps.push({
            id: val.id,
            name: val.text,
            folder: val.folder,
            appList: { ...BUSobj[val.text] }
          });
        }
      }
    },
    //清除菜单
    clearSearch() {
      this.searchValue = '';
      this.dealMenu(this.sessionApps);
    },
    //滚动到顶部
    scrollToTop() {
      this.homeScroll.scrollTo(0, 0, 400);
    },
  },
  watch: {
    $route: {
      handler(val) {
        // 返回首页进行滑动刷新
        if (val.name === "HOME") {
          this.homeScroll.refresh();
        }
      }
    },
    yScrollValue: {
      handler(val) {
        if(Math.abs(val)>1000)
          this.toTopShow = true;
        else if(Math.abs(val)<1000)
          this.toTopShow = false; 
      }
    }
  },
  activated() {
    if (this.BusApps.length == 0) {
      this.initData();
    } else {
      this.$loading.hide();
    }
  },
  mounted() {
    this.homeScroll = new Bscroll(this.$refs.home, {
        click: true,
        pullUpLoad: true,
        pullDownRefresh: true,
      });
    this.homeScroll.on('scroll', ({x, y}) => {
      this.yScrollValue = y;
    })
  }
};
</script>

<style lang='scss' scoped>
.vux-1px-b:after {
  border-color: #e8e8e8;
}
.content {
  width: 100%;
  height: calc(100% - 0.49rem);
  overflow: hidden;
  background-color: #fff;
  .wrapper {
    padding-bottom: 0.1rem;
  }
  .page-component-up{
      /* background-color: #409eff; */
    position: fixed;
    right: .1rem;
    bottom: .6rem;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    cursor: pointer;
    -webkit-transition: .3s;
    -o-transition: .3s;
    transition: .3s;
    /* -webkit-box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5); */
    /* box-shadow: 0 3px 6px rgba(0, 0, 0, 0.5); */
    z-index: 200;
    span {
      width: 40px;
      height: 40px;
      display: inline-block;
    }
    .el-icon-caret-top{
      color: #fff;
      display: block;
      line-height: 40px;
      text-align: center;
      font-size: 18px;
    }
    p{
      display: none;
      text-align: center;
      color: #fff;
    }
    &:hover{
      opacity: .8;
    }
  }
}
.close-part {
  top: 0;
  left: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  position: absolute;
}
// 顶部 用户头像部分
.top-part-container {
  width: 100%;
  padding: 0 0.1rem;
  background: #fff;
  box-sizing: border-box;
  .top-part {
    width: 100%;
    display: flex;
    padding-top: 0.1rem;
    align-items: center;
    justify-content: space-between;
  }
  .entity-part {
    display: flex;
    color: #7a7a7a;
    position: relative;
    align-items: center;
    border-radius: 0.2rem;
    background: #f5f5f5;
    padding: 0.1rem 0.12rem;
    justify-content: center;
    .entity_name {
      font-size: 0.14rem;
      &.when-is-out {
        &:after {
          right: 0;
          bottom: 0;
          content: "";
          height: inherit;
          position: absolute;
          padding-left: 0.18rem;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0),
            #fff 75%
          );
        }
      }
    }
    .iconfont {
      right: 8px;
      color: #7a7a7a;
      font-size: 0.12rem;
      margin-left: 0.04rem;
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
      width: 0.4rem;
      height: 0.4rem;
      margin-right: 0.1rem;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    .user-info {
      line-height: 0.18rem;
      .user_name {
        font-size: 0.14rem;
        font-weight: bold;
      }
      .user_other {
        color: #757575;
        font-size: 0.14rem;
      }
    }
  }
}

/* 列表容器 */
.r-dropdown-list {
  $bgColor: #fff;
  right: 0;
  top: 130%;
  width: 2rem;
  z-index: 100;
  position: absolute;
  background: $bgColor;
  border-radius: 0.06rem;
  box-sizing: border-box;
  box-shadow: 0 1px 5px #e8e8e8;
  &:before {
    width: 0;
    height: 0;
    top: -17px;
    right: 10.5%;
    content: "";
    z-index: 9999;
    border-width: 9px;
    position: absolute;
    border-style: solid;
    border-color: transparent transparent #fff transparent;
  }
  &:after {
    width: 0;
    height: 0;
    top: -20px;
    right: 10%;
    content: "";
    position: absolute;
    border-style: solid;
    border-width: 10px;
    border-color: transparent transparent rgba(232, 232, 232, 0.3) transparent;
  }
}
/* 列表项 */
.r-dropdown-item {
  width: 100%;
  z-index: 101;
  display: flex;
  position: relative;
  align-items: baseline;
  padding: 0.12rem 0.1rem;
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
      font-size: 0.1rem;
    }
  }
  .tips_part {
    color: #757575;
    font-size: 0.1rem;
    .tips_word {
      padding: 0.02rem;
      border-radius: 0.3rem;
      background: #e8e8e8;
    }
  }
  .active {
    color: #006dff;
    font-weight: bold;
  }
}
.list_top {
  width: 100%;
  background-color: #fff;
}
.search {
  width: 100%;
  padding: .08rem 0;
  .search_part {
    width: 100%;
    display: flex;
    height: .34rem;
    position: relative;
    line-height: .34rem;
    box-sizing: border-box;
    // 搜索输入框
    .srh_inp {
      flex: 1;
      border: none;
      outline: none;
      color: #333;
      appearance: none;
      font-size: .14rem;
      margin-left: .15rem;
      padding-left: .35rem;
      border-radius: .2rem;
      background: #F6F6F6;
      -webkit-appearance: none;
      &::-webkit-search-cancel-button {
        display: none;
      }
    }
    // 搜索 按钮
    .pop_cfm {
      color: #999;
      font-size: .14rem;
      margin: 0 .15rem 0 .12rem;
    }
    // 返回 按钮
    .pop_cancel {
      color: #fc3c3c;
    }
    // 搜索icon
    .icon {
      top: 50%;
      z-index: 1;
      left: .25rem;
      width: .14rem;
      height: .16rem;
      fill: #2d2d2d;
      position: absolute;
      transform: translate(0, -50%);
    }
    // 清除icon
    .clear_icon {
      top: 50%;
      right: .64rem;
      width: .18rem;
      height: .18rem;
      display: block;
      font-size: .12rem;
      line-height: .3rem;
      text-align: center;
      position: absolute;
      transform: translate(0, -50%);
    }
  }
  .search_filter {
    left: 0;
    bottom: 0;
    top: .49rem;
    width: 100%;
    z-index: 100;
    font-size: .14rem;
    position: absolute;
    overflow: hidden;
    .layer {
      opacity: .5;
      height: 100%;
      background: #000;
    }
  }
}
</style>
