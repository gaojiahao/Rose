<template>
  <div class="pages">
    <div class="m_top">
      <img class="user_img" :src="avatar">
      <div class="user_part">
        <div class="user_name_part">
          <span class="user_name" v-if="userInfo.nickname">{{userInfo.nickname}}</span>
          <span class="user_level" v-if="userInfo.position">{{userInfo.position}}</span>
        </div>
        <div class="user_info_part">
          <span class="user_bank" v-if="userInfo.homeBank">{{userInfo.homeBank}}</span>
          <span class="user_dp" v-if="userInfo.groupName">{{userInfo.groupName}}</span>
        </div>
      </div>
    </div>
    <tab bar-active-color="#5077AA" active-color="#5077AA" :line-width=1 class="tabSelect">
      <tab-item :selected="item.value === activeTab" v-for="(item, index) in tabList" @on-item-click="selStatus"
                :key="index">{{item.name}}
      </tab-item>
    </tab>
    <div class="m_list">
      <r-scroll class="wrapper" :options="scrollOptions" :has-next="hasNext"
                :no-data="!hasNext && !listData.length" @on-pulling-up="onPullingUp" ref="bScroll">
        <div class="each_list" v-for="(item,idx) in listData" :key="idx" @click="goDetail(item)">
          <div class="e_top">
              <span class="e_status"
                    :class="item.statusText === '进行中' ? 'ing_c' : 'done_c'">{{item.statusText}}</span><span
            class="e_name">{{item.title}}</span>
          </div>
          <div class="e_main">
              <span class="e_code">
                {{item.transCode}}
                <span class="e_crtname">{{item.starterName}}</span></span>
            <span class="e_time" v-html="item.startTime?item.startTime.split(' ')[0]:''"></span>
          </div>
        </div>
      </r-scroll>
    </div>
  </div>
</template>

<script>
  import {Tab, TabItem,} from 'vux';
  import mylistService from '../service/mylistService.js';
  import createService from './../service/createService.js';
  import RScroll from './components/RScroll'

  const RELOAD_SUBMIT = 'RFD_RELOAD_MY_SUBMIT';
  export default {
    name: 'mySubmit',
    components: {
      Tab,
      TabItem,
      RScroll,
    },
    data() {
      return {
        avatar: '',
        listData: [], // 数据列表
        page: 1, // 当前页数
        limit: 10, // 每页条数
        hasNext: true, // 是否有下一页
        tabList: [
          {
            name: '市场费用',
            value: '市场宣传费用预申请'
          }, {
            name: '会务立项',
            value: '会务立项申请'
          }, {
            name: '房屋立项',
            value: '房屋立项申请'
          }, {
            name: '固定资产',
            value: '固定资产预申请'
          }
        ], // tab列表
        activeTab: '市场宣传费用预申请', // 选中的tab
        userInfo: {}, // 用户信息
        scrollOptions: { // 滚动配置
          click: true,
          pullUpLoad: true,
        }
      };
    },
    watch: {
      $route: {
        handler(to) {
          if (to.name === 'Home') {
            this.activeTab = this.tabList[0].value;
            this.resetCondition();
            sessionStorage.setItem(RELOAD_SUBMIT, 1);
          }
        }
      }
    },
    methods: {
      //获取当前用户
      getUser() {
        createService.getBaseInfoData().then((data = {}) => {
          this.userInfo = data;
        }).catch(e => {
          this.showToast(e.message);
        });
      },
      //tab切换
      selStatus(val) {
        this.activeTab = this.tabList[val].value;
        this.resetCondition();
        this.loadData();
      },
      // TODO 查看详情
      goDetail(item) {
        let {listID, transCode, taskId, starterId} = item;
        let isMyTask = '1'; // 是否为我提交
        let canSubmit = '0'; // 是否允许审批
        let map = {
          SCEX: '/spreadDetail',
          MEEX: '/meetingDetail',
          HOEX: '/houseDetail',
          GDZC: '/assetsDetail',
        };
        let key = transCode.split('_')[0];
        this.$router.push({
          path: map[key],
          query: {
            list: listID,
            transCode,
            taskId,
            canSubmit,
            isMyTask,
          }
        });
      },
      // TODO 加载数据
      loadData() {
        let filter = [{
          operator: 'like',
          value: this.activeTab,
          property: 'title'
        }];
        return mylistService.getListStartedByMe({
          page: this.page,
          start: (this.page - 1) * this.limit,
          limit: this.limit,
          filter: JSON.stringify(filter),
        }).then(({dataCount = 0, tableContent = []}) => {
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          this.listData = this.page === 1 ? tableContent : [...this.listData, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        }).catch(e => {
          this.showToast(e.message);
        })
      },
      // TODO 重置列表条件
      resetCondition() {
        this.listData = [];
        this.page = 1;
        this.hasNext = true;
        this.$refs.bScroll && this.$refs.bScroll.scrollTo(0, 0);
      },
      onPullingUp() {
        this.page++;
        this.loadData();
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
      }
    },
    created() {
      let {avatar = ''} = JSON.parse(localStorage.getItem('ROSE_LOGIN_TOKEN') || '{}');
      //获取顶部头像图片
      this.avatar = avatar;
      this.getUser();
      this.loadData();
    },
    activated() {
      let reload = sessionStorage.getItem(RELOAD_SUBMIT);
      if (reload) {
        this.loadData();
        sessionStorage.removeItem(RELOAD_SUBMIT);
      }
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
    height: calc(100% - 144px);
    .each_list {
      width: 90%;
      margin: 20px auto;
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
    .spinner_container {
      .loading-container {
        height: 50vh;
      }
    }
  }

  .dbnothing,
  .underWaynothing,
  .overnothing {
    text-align: center;
  }
</style>
