<template>
  <div id="app">
      <!-- <div class="cp_title">
        销售预报
        <span class="username" v-if="username">欢迎,{{username}}</span>
      </div> -->
      <template v-if="username">
        <div class="app-container">
          <!-- <img class="avatar-img" :src="userInfo.avatar" alt=""> -->
          <div class="avatar-part"></div>
          <div class="dashboard-container-part">
            <div class="place-holder"></div>
            <div class="top-part">
              <div>
                <div class="date-part">
                  <span>{{Today}},</span> 
                  <span>距离月底还有28天</span>
                </div>
                <div class="tips-title">
                  <!-- <p>本月目标 600套</p> -->
                  <p>{{username}}, 距离完成 {{100 - ProductCount.monthCoverNum || 0}}</p>
                </div>
              </div>
              <!-- <div class="user-info-container">
                <div class="user-avatar">
                  <img :src="userInfo.avatar">
                </div>
                <div class="user-info">
                  <div class="user-name">欢迎, {{username}}</div>
                  <div class="user-from">
                    <span class="each-form-msg">{{userInfo.bank}}</span>
                    <span class="each-form-msg">{{userInfo.region}}</span>
                  </div>
                </div> 
              </div> -->
            </div>
            <div class="dashboard-part">
              <div class="each-dashboard least-num">
                <div class="dashboard_title">本月目标</div>
                <div class="dashboard_count">100</div>
              </div>
              <div class="each-dashboard when-today">
                <div class="dashboard_title">当日完成</div>
                <div class="dashboard_count">{{ProductCount.todayCoverNum || 0}}</div>
              </div>
              <div class="each-dashboard when-month">
                <div class="dashboard_title">当月完成</div>
                <div class="dashboard_count">{{ProductCount.monthCoverNum || 0}}</div>
              </div>
            </div>
            <div class="place-holder"></div>
          </div>
          <div class="main-container-part">
            <div class="tips-title">操作选择</div>
            <div class="select-part">
              <div class="each-select" @click.stop="gohelp">销售预报提交</div>
              <div class="each-select" @click.stop="goMR">个人业绩查看</div>
              <div class="each-select" @click.stop="goRP" v-if="showLookReport">查看报表</div>
              <div class="each-select" @click.stop="goAchievement" v-if="showLookSales">销售业绩查看</div>
            </div>
            <h2 class="tech_bottom">
              Powered by <span class="cp_name">Refordom</span>
            </h2>
          </div>
        </div>
      </template>
    <loading :show="showLoading"></loading>
  </div>

</template>

<script>
  import {XButton, Confirm, querystring} from 'vux'
  import tokenService from 'service/tokenService'
  import { getProductCount } from 'service/homeService'
  import Loading from 'components/common/loading'
  const ROSE_OPTION_KEY = 'ROSE_OPTION';
  const ROSE_LOGIN_CODE = 'ROSE_CODE';
  export default {
    components: {
      XButton,
      Confirm,
      Loading
    },
    data() {
      return {
        Today: '',                  // 当前日期
        username: '',               // 用户名称
        userInfo: {},
        ProductCount: {},           // 用户项目类产品提交数量
        showLoading: false,
        showLookSales: false,       // 是否展示销售业绩查看
        showLookReport: false,      // 是否展示查看报表按钮
      }
    },
    methods: {
      // 销售预报
      goSP() {
        this.$router.push({path: '/saleReport'})
      },
      // 支援
      gohelp() {
        this.$router.push({path: '/help',
          query: {
            monthCoverNum: this.ProductCount.monthCoverNum
          }
        })
      },
      // 个人业绩
      goMR() {
        this.$router.push({path: '/myRecord'})
      },
      // 查看报表
      goRP() {
        this.$router.push({path: '/reportsOp'})
      },
      // TODO 查看销售业绩
      goAchievement() {
        this.$router.push({path: '/entry'})
      },
      getToday(){
        let now = new Date();
        let whichDay = ['星期天', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
        let Today = `${(now.getMonth()+1)}月${now.getDate()}号 ${whichDay[now.getDay()]}`;
        this.Today = Today;
      }
    },
    beforeCreate() {
      let query = querystring.parse(location.search.slice(1));
      let code = sessionStorage.getItem(ROSE_LOGIN_CODE);
      if (query.code) { // 获取到登录的code存储到session
        sessionStorage.setItem(ROSE_LOGIN_CODE, query.code);
      }
      if (process.env.NODE_ENV !== 'development' && !code && !query.code) { // 若不为开发环境，且链接没有code，sessionStorage也没有存储，则认为当前环境为非企业微信环境
        window.location.replace('https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx5311bd8608c14d98&redirect_uri=https%3a%2f%2fwww.gofuit.com%2fRose&response_type=code&scope=SCOPE&agentid=1000004&state=1#wechat_redirect')
      }
    },
    created() {
      (async () => {
        this.showLoading = true;
        await tokenService.getToken().catch(err => {
          this.$vux.alert.show({
            content: err.message
          })
        });
        await tokenService.isPresident().then(data => {
          this.username = data.nickname; //拿到当前用户
          if (`${data.statu}` === '1') { // statu为1则为总裁
            this.showLookReport = true
          }
        }).catch(err => {
          this.$vux.alert.show({
            content: err.message
          })
        });
        await tokenService.getUser().then(userInfo => {
          // 获取当前时间
          this.getToday();
          let {completeData = {}, userCode = ''} = userInfo;
          let allowList = ['0414', '1204', '1207', '1129', 'rfd9527', 'rfd125', '2025'];
          this.showLookSales = allowList.includes(userCode);
          // 获取 头像姓名
          let { name, avatar } = JSON.parse(sessionStorage.getItem('ROSE_LOGIN_TOKEN'));
          // 如果头像不存在则指定默认头像
          if(!avatar){
            let url = require('assets/ava03.png')
            // let url = require('assets/avatar.png')
            // let url = require('assets/io.jpg')
            avatar = url;
          };
          this.userInfo = { 
            name, 
            avatar,
            bank: completeData.homeBank || '',         //银行
            region: completeData.homeProvince || '',   //省份地区
            dept: completeData.area || '',             //事业部
          };
          localStorage.setItem(ROSE_OPTION_KEY, JSON.stringify({
            bank: completeData.homeBank || '',         //银行
            region: completeData.homeProvince || '',   //省份地区
            dept: completeData.area || '',             //事业部
            groupName: completeData.groupName || '',    //部门
            captain: completeData.bmName || '',        //队长（暂无）
            userCode: completeData.userCode || '',      //工号
          }))
        }).catch(err => {
          this.$vux.alert.show({
            content: err.message
          })
        });
        // await tokenService.getSuperior().then(({ tableContent }) => {
        //   console.log(tableContent);
        // })
        await getProductCount().then(({ tableContent }) => {
          let [ Count ={} ] = tableContent;
          this.ProductCount = Count; 
        }).catch(err => {
          this.$vux.alert.show({
            content: err.message
          })
        });
        this.showLoading = false;
      })()
    }
  }
</script>

<style scoped lang='scss'>
  #app {
    // background: #F5F5F5;
  }
  .app-container {
    padding-top: 2rem;
    background: #F5F5F5;

  }
  .avatar-part {
    top: 0;
    width: 100%;
    height: 2rem;
    // filter: blur(1px);
    position: absolute;
    background: #111 url('../assets/bg01.jpeg') top / cover no-repeat;
  }
  .avatar-img {
    top: 0;
    left: 0;
    width: 100%;
    height: 1.4rem;
    position: absolute;
  }
  .dashboard-container-part {
    width: 100%;
    position: relative;
    background: #FFF;
    box-sizing: border-box;
    padding: 0 .1rem .04rem;
    .place-holder {
      left: 0;
      top: -10px;
      z-index: 10;
      width: 100%;
      height: .12rem;
      position: absolute;
      background: #FFF;
      border-top-left-radius: .1rem;
      border-top-right-radius: .1rem;
    }
    .user-info-container {
      top: -40px;
      left: 20px;
      z-index: 20;
      color: #FFF;
      display: flex;
      font-size: .14rem;
      position: absolute;
      align-items: center;
      .user-avatar {
        width: .6rem;
        height: .6rem;
        img {
          width: 100%;
          border-radius: 50%;
        }
      }
      .user-info {
        margin-left: .1rem;
        .user-name {
          font-size: .16rem;
          font-weight: bold;
          margin-bottom: .06rem;
        }
        .user-from {
          font-size: .12rem;
          .each-form-msg {
            border-radius: .12rem;
            background: #5077aa;
            box-shadow: 0 2px 2px #5077aa;
            padding: .01rem .04rem;
          }
          .each-form-msg + .each-form-msg {
            margin-left: .04rem;
          }
        }
      }

    }
    .top-part {
      display: flex;
      align-items: center;
      margin-bottom: .1rem;
      justify-content: space-between;
      .tips-title {
        color: #111;
        font-size: .26rem;
        font-weight: bold;
        line-height: .32rem;
      }
    }
    .date-part {
      color: #8A8A8E;
      font-size: .14rem;
      font-weight: bold;
    }
    .dashboard-part {
      display: flex;
      .each-dashboard {
        flex: 1;
        color: #FFF;
        font-weight: bold;
        line-height: .22rem;
        border-radius: .08rem;
        padding: .06rem .04rem;
        .dashboard_title {
          font-size: .12rem;
        }
        .dashboard_count {
          font-size: .22rem;
        }
        &.when-today {
          // $bgColor: #2366FF;
          $bgColor: #111;
          color: $bgColor;
          // background: $bgColor;
          // box-shadow: 0 2px 5px $bgColor;
        }
        &.when-month {
          // $bgColor: #00C5C3;
          $bgColor: #111;
          color: $bgColor;
          // background: $bgColor;
          // box-shadow: 0 2px 5px $bgColor;
        }
        &.least-num {
          // margin-right: unset;
          $bgColor: #D2AD6B;
          color: $bgColor;
          // background: $bgColor;
          // box-shadow: 0 2px 5px $bgColor;
        }
      }
      .each-dashboard  + .each-dashboard  {
        margin-left: .1rem;
      }
    }
  }
  .main-container-part {
    width: 100%;
    padding: 0 .1rem;    
    margin-top: .1rem;
    position: relative;
    background: #FFF;
    box-sizing: border-box;
    .tips-title {
      width: 100%;
      font-size: .2rem;
      font-weight: bold;
      margin-bottom: .1rem;
    }
    /* 选项框 */
    .select-part {
      .each-select {
        width: 100%;
        height: .42rem;
        color: #EDE4A3;
        font-size: .18rem;
        font-weight: bold;
        text-align: center;
        line-height: .42rem;
        border-radius: .06rem;
        background: #D7030F;
        // background: #000;
      }
      .each-select + .each-select {
        margin-top: .15rem;
      }
    }
  }
  .username {
    line-height: initial;
    font-size: 16px;
    font-weight: normal;
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translate(-50%);
  }
  /* 公司名  */
  .cp_title {
    width: 100%;
    height: 150px;
    line-height: 150px;
    text-align: center;
    font-size: 50px;
    font-weight: 200;
    color: #CFCFCF;
    position: relative;
  }
  /* 技术支持公司名  */
  .tech_bottom {
    width: 100%;
    text-align: center;
    position: fixed;
    bottom: 0;
    font-size: 16px;
    color: #CDCED3;
    font-weight: 200;
  }
  .cp_name {
    color: dodgerblue;
  }
</style>
