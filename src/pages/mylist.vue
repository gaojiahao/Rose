<template>
    <div class="pages">
        <div class="m_top">
            <img class="user_img" :src="headerInfo.avatar">
            <div class="user_part">
                <div class="user_name_part">
                    <span class="user_name" v-if="userName!=''">{{userName}}</span>
                    <span class="user_level" v-if="userRole!=''">{{userRole}}</span>
                </div>
                <div class="user_info_part">
                    <span class="user_bank" v-if="userBank!=''">{{userBank}}</span>
                    <span class="user_dp" v-if="userDept!=''">{{userDept}}</span>
                </div>
            </div>
        </div>
        <tab bar-active-color="#5077AA" active-color="#5077AA" :line-width=1 class="tabSelect">
            <tab-item :selected="whichIndex==0" @on-item-click="selStatus">待处理</tab-item>
            <tab-item :selected="whichIndex==1" @on-item-click="selStatus">进行中</tab-item>
            <tab-item :selected="whichIndex==2" @on-item-click="selStatus">已完成</tab-item>
        </tab>
        <div class="m_list" style="height:auto;">
            <div  class="wrapper" ref="wrapper">
                <div class="content">
                     <!-- 待处理 -->
                    <div v-if="whichIndex === 0">
                        <div class="each_list" v-for="(val,idx) in TobedoneList" :key="idx" @click="goDetail(val)">
                            <div class="e_top">
                                <span class="e_status" :class="{wait_c:whichIndex===0}">待处理</span><span class="e_name">{{val.transType}}</span>
                            </div>
                            <div class="e_main">
                                <span class="e_code">
                                    {{val.businessKey}}
                                    <span class="e_crtname">{{val.crtName}}</span>
                                </span>
                                <span class="e_time" v-html="val.crtTime?val.crtTime.split(' ')[0]:''"></span>
                            </div>
                        </div>
                        <div class="spinner_container" v-if="TobedoneLoad">
                            <loading :show="true"></loading>
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
                                <span class="e_status" :class="{ing_c:whichIndex===1}">进行中</span><span class="e_name">{{val.transType}}</span>
                            </div>
                            <div class="e_main">
                                <span class="e_code">
                                    {{val.transId}}
                                    <span class="e_crtname">{{val.creatorName}}</span>
                                </span>
                                <span class="e_time" v-html="val.crtTime?val.crtTime.split(' ')[0]:''"></span>
                            </div>
                        </div>
                        <div class="spinner_container" v-if="underWayLoad">
                            <loading :show="true"></loading>
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
                                <span class="e_status" :class="{done_c:whichIndex===2}">已完成</span><span class="e_name">{{val.transType}}</span>
                            </div>
                            <div class="e_main">
                                <span class="e_code">
                                    {{val.transId}}
                                    <span class="e_crtname">{{val.creatorName}}</span>
                                </span>
                                <span class="e_time" v-html="val.crtTime?val.crtTime.split(' ')[0]:''"></span>
                            </div>
                        </div>
                        <div class="spinner_container" v-if="overLoad">
                            <loading :show="true"></loading>
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
import { Tab, TabItem, LoadMore } from "vux";
import mylistService from "../service/mylistService.js";
import createService from "./../service/createService.js";
import Bscroll from "better-scroll";
import Loading from './components/loading'
export default {
  components: {
    Tab,
    TabItem,
    LoadMore,
    Loading
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
      userName: '',
      userRole: '',
      userBank: '',
      userDept: '',
      currentUser: {},
    };
  },
  methods: {
    //获取当前用户
    getUser() {
      let that = this;
      createService.getUser().then(res => {
        createService.getCurrentUser(res.nickname).then(e => {
          let user = e.tableContent[0];
          
          //用户姓名
          this.userName = user.nickname;
          //用户级别
          if(user.role){
            if(user.role.indexOf(',') == -1 ){
              that.userRole = user.role;
            }else{
              that.userRole = user.role.split(',')[0];
            }
          }
          //用户银行
          if(user.HOME_BANK){
            if(user.HOME_BANK.indexOf(',') == -1){
              that.userBank = user.HOME_BANK;
            }else{
              that.userBank = user.HOME_BANK.split(',')[0];
            }
          }
          //用户部门
          if(user.dept){
            if(user.dept.indexOf(',') == -1 ){
              that.userDept = user.dept;
            }else{
              that.userDept = user.dept.split(',')[0];
            }
          }

        });
      }).catch(e =>{
        this.showToast(e.message);
      });
    },
    //获取待办
    Tobedone(e) {
      let data = {
          entityId: 20000,
          _dc: Date.parse(new Date()),
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
          that.scroll.closePullUp();
          return;
        } else {
          for (let i = 0; i < res.tableContent.length; i++) {
            that.TobedoneList.push(res.tableContent[i]);
          }
          that.TobedoneLoad = false;
        }
        that.$nextTick(function(){
          that.scroll.refresh();
        })
        that.scroll.finishPullUp();
      }).catch( e =>{
        this.showToast(e.message);
      });
    },
    //获取进行中
    underWay(e) {
      let data = {
          entityId: 20000,
          _dc: Date.parse(new Date()),
          status: 2,
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
          that.scroll.closePullUp();
          return;
        } else {
          for (let i = 0; i < res.tableContent.length; i++) {
            that.underWayList.push(res.tableContent[i]);
          }
          that.underWayLoad = false ;
        }
        that.$nextTick(function(){
          that.scroll.refresh();
        })
        that.scroll.finishPullUp();
      }).catch( e =>{
        this.showToast(e.message);
      });
    },
    //获取已完成
    over(e) {
      let data = {
          entityId: 20000,
          _dc: Date.parse(new Date()),
          status: 1,
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
          that.scroll.closePullUp();
          return;
        } else {
          for (let i = 0; i < res.tableContent.length; i++) {
            that.overList.push(res.tableContent[i]);
          }
          that.overLoad = false;
        }
        that.$nextTick(function(){
          that.scroll.refresh();
        })
        that.scroll.finishPullUp();
      }).catch( e =>{
        this.showToast(e.message);
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
      sessionStorage.setItem('MYLIST_TAB',val);
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
      this.$nextTick(() => {
        let tabH = document.querySelector(".tabSelect").offsetHeight;
        let topH = document.querySelector(".m_top").offsetHeight;
        let ch = window.innerHeight - tabH - topH - 20;
        document.querySelector(".m_list").style.height = ch + "px";
        this.scroll = new Bscroll(this.$refs.wrapper, {
          click: true
        });
        this.scroll.openPullUp();
        this.scroll.on("pullingUp", function(e) {
          console.log('pullingUp')
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
      let {listId,formKey,businessKey, taskId, transId, assignee, assigneeId} = item;
      let canSubmit = '0';
      let map = {
        'a583be9b-c632-493c-b509-0f004504b8a2': '/spreadDetail',
        'a9238c91-36f3-4b09-9705-9d50870b3c46': '/spreadDetail',
        'b2df7403-56c7-4a1c-bdb7-8f6b4c95c7eb': '/meetingDetail',
        'd189cc14-3a77-4e81-a220-55c771a2bdff': '/meetingDetail',
        'e21f5960-7f7a-4e8b-9faf-bd10595ff768': '/houseDetail',
        'e59dcb25-3a14-44b7-b619-433c63d2327b': '/houseDetail',
        '1034f15e-3f90-4e9c-a401-0955db09e179': '/assetsDetail',
        '1ab51ee6-2836-4728-b0a5-9fa5c8902c31': '/assetsDetail',
      };
      // 待处理页签才允许审批
      if (!this.whichIndex) {
        map['a9238c91-36f3-4b09-9705-9d50870b3c46'] = '/spread';
        map['d189cc14-3a77-4e81-a220-55c771a2bdff'] = '/meeting';
        map['e59dcb25-3a14-44b7-b619-433c63d2327b'] = '/house';
        map['1ab51ee6-2836-4728-b0a5-9fa5c8902c31'] = '/assets';
        if (assignee) {
          canSubmit = `${assignee}` === `${this.currentUser.userId}` ? '1' : '0';
        }
        if (assigneeId) {
          canSubmit = `${assigneeId}` === `${this.currentUser.userId}` ? '1' : '0';
        }
      }
      this.$router.push({
        path: map[formKey],
        query: {
          list: listId,
          formKey: formKey,
          transCode: businessKey || transId,
          taskId,
          canSubmit,
        }
      })
    },
    // TODO 加载数据
    loadData() {
      switch (this.whichIndex) {
        case 0:
          this.Tobedone();
          break;
        case 1:
          this.underWay();
          break;
        case 2:
          this.over();
          break;
        default:
          break;
      }
    },
    // TODO 显示错误提示
    showToast(test = '') {
      this.$vux.toast.show({
        text: test,
        type: 'text',
        position: 'middle',
        width: 'auto',
        isShowMask: true,
        time: 1000
      });
    },
  },
  created() {
    //获取顶部头像名字
    this.headerInfo = JSON.parse(localStorage.getItem("ROSE_LOGIN_TOKEN"));
    if(sessionStorage.getItem('MYLIST_TAB')){
      this.whichIndex = Number(sessionStorage.getItem('MYLIST_TAB'));
    }
    this.getUser();
    this.scrollOn();
    this.loadData();
  },
  mounted() {
  },
};
</script>

<style lang='scss' scoped>
.m_top {
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  background: #5077aa;
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
  width: 100%;
  .each_list {
    width: 90%;
    margin: 20px auto;
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
</style>
