<template>
  <div class="pages">
    <div class="h_title">
      立项申请
      <span class="username">欢迎,{{currentUser.nickname}}</span>
    </div>
    <div class="h_main">
      <ul class="sel_list">
        <li class="each_part"
            v-for=" (item, index) in sel_list"
            :key="index"
            @click="goForward(item)"
        >
          {{item.name}}
          <x-icon class="right_arrow" type="ios-arrow-forward" size="16"></x-icon>
        </li>
      </ul>
    </div>
    <h2 class="tech_bottom">
      Proudly presented by <span class="cp_name">Refordom</span>
    </h2>
    <loading :show="showLoading"></loading>
  </div>
</template>

<script>
  import createService from './../service/createService'
  import Loading from './components/loading'
  import common from './mixins/common'

  export default {
    data() {
      return {
        sel_list: [
          {
            name: '市场费用',
            path: '/spread',
            query: {
              view: 'a9238c91-36f3-4b09-9705-9d50870b3c46',
              list: 'cefa61bb-8a2c-48f5-819b-011e0cf4fb6c',
            },
          }, {
            name: '会务立项申请',
            path: '/meeting',
            query: {
              view: 'd189cc14-3a77-4e81-a220-55c771a2bdff',
              list: '696c5648-88ba-4bea-b5b1-1780f3c4febf',
            },
          }, {
            name: '房屋立项申请',
            path: '/house',
            query: {
              view: 'e59dcb25-3a14-44b7-b619-433c63d2327b',
              list: '4912df2a-612e-462a-a6f4-c7c72f497bb8',
            },
          }, {
            name: '固定资产',
            path: '/assets',
            query: {
              view: '1ab51ee6-2836-4728-b0a5-9fa5c8902c31',
              list: 'e3937a5c-98d2-4799-a74c-759222fb4a6d',
            },
          }, {
            name: '查看我的',
            path: '/mylist',
            query: {},
          }, {
            name: '我的提交',
            path: '/mySubmit',
            query: {},
          }
        ],
        currentUser: {}
      }
    },
    mixins: [common],
    components: {Loading},
    methods: {
      goForward({path, query}) {
        this.$router.push({
          path, query
        })
      }
    },
    created() {
      if (sessionStorage.getItem('MYLIST_TAB')) {
        sessionStorage.removeItem('MYLIST_TAB')
      }
      if (sessionStorage.getItem('MYLIST_LIST')) {
        sessionStorage.removeItem('MYLIST_LIST')
      }
      this.showLoading = true;
      createService.getBaseInfoData().then(data => {
        this.currentUser = data || {};
        this.showLoading = false;
      }).catch(e => {
        this.showToast(e.message);
      });
    }
  }
</script>

<style lang='scss' scoped>
  .h_title {
    width: 100%;
    height: 150px;
    line-height: 120px;
    text-align: center;
    font-size: 50px;
    font-weight: 200;
    color: #CDCED3;
    position: relative;
    .username {
      line-height: initial;
      font-size: 16px;
      font-weight: normal;
      position: absolute;
      left: 50%;
      bottom: 20%;
      transform: translate(-50%);
    }
  }

  .h_main {
    width: 90%;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .each_part {
      width: 100%;
      height: 44px;
      line-height: 44px;
      padding: 0 8px;
      text-align: center;
      box-sizing: border-box;
      color: #fff;
      font-weight: 600;
      // background: -webkit-linear-gradient(left bottom, rgba(29,101,240,1), rgba(25,211,253,1));
      background: #5077AA;
      // background: #f1b841 url('../assets/bg-header-618.png') no-repeat ;
      // background-size: cover;
      // background-color: #FFE172;
      // background-image: url(data:image/png;base64,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);
      margin-top: 20px;
      border-radius: 4px;
      position: relative;
      .right_arrow {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translate(0, -50%);
        fill: #fff;
      }
    }
  }

  /* 技术支持公司名  */
  .tech_bottom {
    width: 100%;
    max-width: 640px;
    text-align: center;
    position: fixed;
    bottom: 0;
    font-size: 16px;
    color: #CDCED3;
    font-weight: 200;
  }

  .cp_name {
    color: dodgerblue;
    // color: #f1b841;
  }

</style>
