<template>
  <div class="pages">
    <div class="m_top">
      <img class="user_img" :src="headerInfo.avatar">
      <div class="user_part">
        <div class="user_name_part">
          <span class="user_name" v-if="headerInfo.name !== ''">{{headerInfo.name}}</span>
          <span class="user_level" v-if="userRole !== ''">{{userRole}}</span>
        </div>
        <div class="user_info_part">
          <span class="user_bank" v-if="userBank !== ''">{{userBank}}</span>
          <span class="user_dp" v-if="userDept !== ''">{{userDept}}</span>
        </div>
      </div>
    </div>
    <tab bar-active-color="#5077AA" active-color="#5077AA" :line-width=1 class="tabSelect">
      <tab-item v-for="(item, index) in tabList" :key="index" :selected="whichIndex===index" @on-item-click="selStatus">
        {{item.text}}
      </tab-item>
    </tab>
    <div class="m_list" style="height:auto;">
      <div class="wrapper" ref="wrapper">
        <div class="content">
          <!-- 待处理 -->
          <div class="each_list" v-for="(val,idx) in listData" :key="idx" @click="goDetail(val)">
            <div class="e_top">
              <span class="e_status" :class="[val.statusClass]">{{val.text}}</span><span class="e_name">{{val.transType}}</span>
            </div>
            <div class="e_main">
              <span class="e_code">{{val.code}}
                <span class="e_crtname">{{val.name}}</span></span>
              <span class="e_time">{{val.time}}</span>
            </div>
          </div>
          <spinner class="loading" type="crescent" size="2em" v-show="hasNext"></spinner>
          <load-more :show-loading="false" tip="没有更多了" v-show="!hasNext"></load-more>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {Tab, TabItem, LoadMore, Spinner} from "vux";
  import mylistService from "../service/mylistService.js";
  import createService from "./../service/createService.js";
  import Bscroll from "better-scroll";
  import Loading from './components/loading'
  import common from './mixins/common'

  const USER_INFO = 'RFD_CURRENT_USER_INFO';
  export default {
    components: {
      Tab,
      TabItem,
      LoadMore,
      Loading,
      Spinner,
    },
    data() {
      return {
        whichIndex: 0, // 当前选中页签的索引
        headerInfo: "",
        userRole: '',
        userBank: '',
        userDept: '',
        currentUser: {}, // 当前用户信息
        hasNext: true, // 判断是否有下一页
        tabList: [
          {
            text: '待处理',
            statusClass: 'wait_c',
          },
          {
            text: '进行中',
            statusClass: 'ing_c',
          },
          {
            text: '已完成',
            statusClass: 'done_c',
          },
        ], // 页签列表
        listData: [], // 数据列表
        page: 0, // 当前页数
        limit: 10, // 每页显示条数
      };
    },
    computed: {
      start() {
        return this.page * this.limit;
      }
    },
    mixins: [common],
    methods: {
      //获取当前用户
      getUser() {
        let handleBaseInfo = (data = {}) => {
          this.currentUser = data;
          this.userRole = data.position.split(',')[0];
          this.userBank = data.homeBank.split(',')[0];
          this.userDept = data.groupName.split(',')[0];
        };
        let currentUser = sessionStorage.getItem(USER_INFO);
        if (currentUser) {
          currentUser = JSON.parse(currentUser);
          handleBaseInfo(currentUser);
          return Promise.resolve();
        }
        return createService.getBaseInfoData().then(handleBaseInfo).catch(e => {
          this.showToast(e.message);
        });
      },
      // TODO 处理响应数据
      handleData(res) {
        let {tableContent = [], dataCount = 0} = res;
        let tab = this.tabList[this.whichIndex];
        this.hasNext = dataCount > tableContent.length + (this.page - 1) * this.limit;
        tableContent = tableContent && tableContent.map(item => {
          return Object.assign(item, {
            statusClass: tab.statusClass,
            text: tab.text,
            name: item.crtName || item.creatorName || '',
            code: item.businessKey || item.transId || '',
            time: this.changeDate(item.endTime || item.crtTime),
          })
        });
        this.listData = this.page === 1 ? tableContent : this.listData.concat(tableContent);
        this.$nextTick(() => {
          this.scroll.refresh();
        });
      },
      //获取待办
      Tobedone(e) {
        let data = {
            _dc: Date.parse(new Date()),
            start: this.start,
            page: ++this.page,
            limit: this.limit
          },
          that = this;
        return mylistService.getTasksListData(data).then(this.handleData).catch(e => {
          this.showToast(e.message);
        });
      },
      //获取进行中
      underWay(e) {
        let data = {
            _dc: Date.parse(new Date()),
            status: 2,
            start: this.start,
            page: ++this.page,
            limit: this.limit
          },
          that = this;
        return mylistService.getCompletedListDataByStatus(data).then(this.handleData).catch(e => {
          this.showToast(e.message);
        });
      },
      //获取已完成
      over(e) {
        let data = {
            _dc: Date.parse(new Date()),
            status: 1,
            start: this.start,
            page: ++this.page,
            limit: this.limit
          },
          that = this;
        return mylistService.getCompletedListDataByStatus(data).then(this.handleData).catch(e => {
          this.showToast(e.message);
        });
      },
      //tab切换
      selStatus(val) {
        this.whichIndex = val;
        sessionStorage.setItem('MYLIST_TAB', val);
        this.listData = [];
        this.page = 0;
        this.hasNext = true;
        this.scroll.scrollTo(0, 0);
        this.loadData();
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
          // this.scroll.openPullUp();
          this.scroll.on("pullingUp", (e) => {
            if (!this.hasNext) {
              return
            }
            this.loadData();
          });
        });
      },
      // TODO 查看详情
      goDetail(item) {
        let {listId, formKey, businessKey, taskId, transId, assignee, assigneeId} = item;
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
        let requestsArr = ['Tobedone', 'underWay', 'over'];
        this[requestsArr[this.whichIndex]]().then(() => {
          if (!this.hasNext) {
            this.scroll.closePullUp();
            return
          } else {
            this.scroll.openPullUp();
          }
          this.scroll.finishPullUp();
        });
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
      this.headerInfo = JSON.parse(localStorage.getItem("ROSE_LOGIN_TOKEN")) || {};
      if (sessionStorage.getItem('MYLIST_TAB')) {
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
      margin: 0 auto 20px;
      padding: 4px 10px;
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

  .wrapper {
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    .content {
      padding-top: 20px;
    }
    .loading {
      display: block;
      margin: 0 auto;
    }
  }
</style>
