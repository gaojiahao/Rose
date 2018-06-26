<template>
    <div class="pages">
        <div class="m_top">
            <img class="user_img" :src="headerInfo.avatar">
            <div class="user_part">
                <div class="user_name_part">
                    <span class="user_name">{{headerInfo.name}}</span>
                    <span class="user_level">{{user.role}}</span>
                </div>
                <div class="user_info_part">
                    <span class="user_bank">{{user.HOME_BANK}}</span>
                    <span class="user_dp">{{user.dept}}</span>
                </div>
            </div>
        </div>
        <tab bar-active-color="#5077AA" active-color="#5077AA" :line-width=1 class="tabSelect">
            <tab-item :selected="whichIndex==0" @on-item-click="selStatus">待审批</tab-item>
            <tab-item :selected="whichIndex==1" @on-item-click="selStatus">进行中</tab-item>
            <tab-item :selected="whichIndex==2" @on-item-click="selStatus">已完成</tab-item>
        </tab>
        <div class="m_list" style="height:auto;">
            <div  class="wrapper" ref="wrapper">
                <div class="content">
                     <!-- 待审批 -->
                    <div v-if="whichIndex === 0">
                        <div class="each_list" v-for="(val,idx) in TobedoneList" :key="idx" @click="goDetail(val)">
                            <div class="e_top">
                                <span class="e_status" :class="{wait_c:whichIndex===0}">待审批</span><span class="e_name">{{val.processName}}</span>
                            </div>
                            <div class="e_main">
                                <span class="e_code">
                                    {{val.businessKey}}
                                    <span class="e_crtname">{{val.assigneeName}}</span>
                                </span>
                                <span class="e_time">{{val.crtTime.split(' ')[0]}}</span>
                            </div>
                        </div>
                        <div class="spinner_container" v-if="TobedoneLoad">
                            <spinner type="android" size="40px"></spinner>
                        </div>
                        <div class="dbnothing" v-if="dbnothing">
                            <load-more tip="正在加载"></load-more>
                        </div>
                        <div class="dbnothing" v-if="!dbnothing&&dbnothingMore">
                            <load-more :show-loading="false" tip="没有更多了" background-color="#fbf9fe"></load-more>
                        </div>
                    </div>
                    <!-- 进行中 -->
                    <div v-if="whichIndex === 1">
                        <div class="each_list"  v-for="(val,idx) in underWayList" :key="idx" @click="goDetail(val)">
                            <div class="e_top">
                                <span class="e_status" :class="{ing_c:whichIndex===1}">进行中</span><span class="e_name">{{val.processName}}</span>
                            </div>
                            <div class="e_main">
                                <span class="e_code">
                                    {{val.transId}}
                                    <span class="e_crtname">{{val.creatorName}}</span>
                                </span>
                                <span class="e_time">{{val.crtTime.split(' ')[0]}}</span>
                            </div>
                        </div>
                        <div class="spinner_container" v-if="underWayLoad">
                            <spinner type="android" size="40px"></spinner>
                        </div>
                        <div class="underWaynothing" v-if="underWaynothing">
                            <load-more tip="正在加载"></load-more>
                        </div>
                        <div class="underWaynothing" v-if="!underWaynothing&&underWayMore">
                            <load-more :show-loading="false" tip="没有更多了" background-color="#fbf9fe"></load-more>
                        </div>
                    </div>
                    <!-- 已完成 -->
                    <div v-if="whichIndex === 2">
                        <div class="each_list"  v-for="(val,idx) in overList" :key="idx" @click="goDetail(val)">
                            <div class="e_top">
                                <span class="e_status" :class="{done_c:whichIndex===2}">已完成</span><span class="e_name">{{val.processName}}</span>
                            </div>
                            <div class="e_main">
                                <span class="e_code">
                                    {{val.transId}}
                                    <span class="e_crtname">{{val.creatorName}}</span>
                                </span>
                                <span class="e_time">{{val.endTime.split(' ')[0]}}</span>
                            </div>
                        </div>
                        <div class="spinner_container" v-if="overLoad">
                            <spinner type="android" size="40px"></spinner>
                        </div>
                        <div class="overnothing" v-if="overnothing">
                            <load-more tip="正在加载"></load-more>
                        </div>
                        <div class="overnothing" v-if="!overnothing&&overMore">
                            <load-more :show-loading="false" tip="没有更多了" background-color="#fbf9fe"></load-more>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { Tab, TabItem, Spinner, LoadMore } from "vux";
import mylistService from "../service/mylistService.js";
import createService from "./../service/createService.js";
import Bscroll from "better-scroll";
export default {
  components: {
    Tab,
    TabItem,
    Spinner,
    LoadMore
  },
  data() {
    return {
      whichIndex: 0,
      headerInfo: "",
      TobedoneList: [],
      TobedoneLoad: true,
      underWayList: [],
      underWayLoad: true,
      overList: [],
      overLoad: true,
      ch: 0,
      dbpageNo: 0,
      underwaypageNo: 0,
      overpageNo: 0,
      dbnothing: false,
      underWaynothing: false,
      overnothing: false,
      dbnothingMore: false,
      underWayMore: false,
      overMore: false,
      user: ""
    };
  },
  methods: {
    //获取当前用户
    getUser() {
      let that = this;
      createService.getUser().then(res => {
        createService.getCurrentUser(res.nickname).then(e => {
          that.user = e.tableContent[0];
        });
      });
    },
    //获取待办
    Tobedone(e) {
      let data = {
          entityId: 20000,
          _dc: Date.parse(new Date()),
          listID: this.$route.query.listId,
          para1: "",
          start: this.dbpageNo * 11,
          page: ++this.dbpageNo,
          limit: 11
        },
        that = this;
      mylistService.getTasksListData(data).then(res => {
        if (e == 0) {
          that.TobedoneList = [];
        }
        if (res.tableContent.length == 0) {
          that.TobedoneLoad = false;
          that.dbnothingMore = true;
          that.dbnothing = false;
          return;
        } else {
          for (let i = 0; i < res.tableContent.length; i++) {
            that.TobedoneList.push(res.tableContent[i]);
          }
          that.TobedoneLoad = false;
        }
        that.scroll.finishPullUp();
      });
    },
    //获取进行中
    underWay(e) {
      let data = {
          entityId: 20000,
          _dc: Date.parse(new Date()),
          listID: this.$route.query.listId,
          status: 1,
          start: this.underwaypageNo * 11,
          page: ++this.underwaypageNo,
          limit: 11
        },
        that = this;
      mylistService.getCompletedListDataByStatus(data).then(res => {
        if (e == 1) {
          that.underWayList = [];
        }
        if (res.tableContent.length == 0) {
          that.underWayLoad = false ;
          that.underWayMore = true;
          that.underWaynothing = false;
          return;
        } else {
          for (let i = 0; i < res.tableContent.length; i++) {
            that.underWayList.push(res.tableContent[i]);
          }
          that.underWayLoad = false ;
        }
        that.scroll.finishPullUp();
      });
    },
    //获取已完成
    over(e) {
      let data = {
          entityId: 20000,
          _dc: Date.parse(new Date()),
          listID: this.$route.query.listId,
          status: 2,
          start: this.overpageNo * 11,
          page: ++this.overpageNo,
          limit: 11
        },
        that = this;
      mylistService.getCompletedListDataByStatus(data).then(res => {
        if (e == 2) {
          that.overList = [];
        }
        if (res.tableContent.length == 0) {
          that.overLoad = false;
          that.overMore = true;
          that.overnothing = false;
          return;
        } else {
          for (let i = 0; i < res.tableContent.length; i++) {
            that.overList.push(res.tableContent[i]);
          }
          that.overLoad = false;
        }
        that.scroll.finishPullUp();
      });
    },
    //tab切换
    selStatus(val) {
      this.whichIndex = val;
      this.dbpageNo = 0;
      this.underwaypageNo = 0;
      this.overpageNo = 0;
      this.dbnothingMore = false;
      this.underWayMore = false;
      this.overMore = false;
      if (val == 0) {
        this.TobedoneList = [];
        this.TobedoneLoad = true;
        this.Tobedone(0);
      } else if (val == 1) {
        this.underWayList = []
        this.underWayLoad = true;
        this.underWay(1);
      } else if (val == 2) {
        this.overList=[]
        this.overLoad = true;
        this.over(2);
      }
    },
    //滚动加载启动
    scrollOn() {
      let that = this;
      let tabH = document.querySelector(".tabSelect").offsetHeight;
      let topH = document.querySelector(".m_top").offsetHeight;
      let ch = window.innerHeight - tabH - topH - 20;
      document.querySelector(".m_list").style.height = ch + "px";
      this.$nextTick(() => {
        this.scroll = new Bscroll(this.$refs.wrapper, {
          click: true
        });
        this.scroll.openPullUp();
        this.scroll.on("pullingUp", function(e) {
          if (that.whichIndex == 0) {
            that.dbnothing = true;
            that.Tobedone();
          } else if (that.whichIndex == 1) {
            that.underWaynothing = true;
            that.underWay();
          } else if (that.whichIndex == 2) {
            that.overnothing = true;
            that.over();
          }
        });
      });
    },
    // TODO 查看详情
    goDetail(item){
      let {listId,formKey,businessKey } = item
      let map = {
        'cefa61bb-8a2c-48f5-819b-011e0cf4fb6c': '/spread',
        '696c5648-88ba-4bea-b5b1-1780f3c4febf': '/meeting',
        '4912df2a-612e-462a-a6f4-c7c72f497bb8': '/house',
        'e3937a5c-98d2-4799-a74c-759222fb4a6d': '/assets',
      };
      console.log(item)
      this.$router.push({
        path: map[listId],
        query: {
          list: listId,
          formKey: formKey,
          transCode: businessKey
        }
      })
    },
  },
  created() {},
  mounted() {
    //获取顶部头像名字
    this.headerInfo = JSON.parse(localStorage.getItem("ROSE_LOGIN_TOKEN"));
    this.getUser();
    this.Tobedone();
    this.underWay();
    this.over();
    this.scrollOn();
  }
};
</script>

<style lang='scss' scoped>
.m_top {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  background: #5077aa;
  // background: #f1b841 url('../assets/bg-header-618.png') no-repeat ;
  // background-size: contain;
  // background-color: #FFE172;
  // background-image: url(data:image/png;base64,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);
  .user_img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin-right: 10px;
    margin-left: 20px;
  }
  .user_name {
    color: #fff;
    font-weight: bold;
  }
  .user_level {
    font-size: 10px;
    background: #fff;
    color: #333;
    border-radius: 24px;
    padding: 0 6px;
    display: inline-block;
    vertical-align: middle;
    margin-top: -4px;
  }
  .user_bank,
  .user_dp {
    font-size: 12px;
    background: rgba(17, 17, 17, 0.5);
    color: #fff;
    border-radius: 24px;
    padding: 1px 6px;
  }
}
.m_list {
  width: 90%;
  margin: 10px auto;
  .each_list {
    width: 100%;
    padding: 4px 10px;
    margin-bottom: 20px;
    box-sizing: border-box;
    box-shadow: 0 2px 10px #e8e8e8;
    border-radius: 4px;
    .e_top {
      .e_status {
        //审批状态
        color: #fff;
        padding: 0 2px;
        border-radius: 4px;
        font-size: 12px;
        display: inline-block;
        vertical-align: middle;
        margin-top: -2px;
      }
      .e_name {
        //审批名字
        margin-left: 4px;
        font-weight: bold;
      }
      .wait_c {
        background: #e34e43;
      }
      .ing_c {
        background: #5077aa;
      }
      .done_c {
        background: #26ab28;
      }
    }
    .e_main {
      height: 24px;
      line-height: 24px;
      .e_code {
        float: left;
        font-size: 14px;
        color: #7d7d7d;
        .e_crtname {
          position: relative;
          background: #333;
          font-size: 12px;
          color: #fdf6a4;
          padding: 2px;
        }
        .e_crtname:before {
          position: absolute;
          content: "";
          width: 0;
          height: 0;
          top: 0;
          left: -3px;
          border-right: 4px solid #333;
          border-bottom: 4px solid transparent;
        }
      }
      .e_time {
        float: right;
        font-size: 14px;
        color: #7d7d7d;
        font-weight: 200;
      }
    }
  }
}
.spinner_container {
  text-align: center;
  margin-top: 50vw;
}
.wrapper {
  height: 100%;
  overflow: hidden;
}
.dbnothing,
.underWaynothing,
.overnothing {
  text-align: center;
}
.vux-spinner-android {
  stroke: #5077aa;
}
</style>
