<template>
  <div>
    <div id="app">

      <h1 class="cp_title">销售预报</h1>

      <div class="select_part">

        <x-button
          class="each_select"
          :gradients="['#B99763', '#E7D0A2']"
          @click.native="goSP"
        >销售预报提交
        </x-button>

        <x-button
          class="each_select"
          :gradients="['#B99763', '#E7D0A2']"
          @click.native="gohelp"
        >销售预报提交（支援）
        </x-button>

        <x-button
          class="each_select"
          :gradients="['#B99763', '#E7D0A2']"
          @click.native="goMR"
        >个人业绩查看
        </x-button>

        <x-button
          class="each_select"
          :gradients="['#B99763', '#E7D0A2']"
          @click.native="goRP"
          v-if="showLookReport"
        >查看报表
        </x-button>

      </div>

      <h2 class="tech_bottom">
        Powered by <span class="cp_name">Refordom</span>
      </h2>

    </div>
    <loading :show="showLoading"></loading>
    <!--<router-view></router-view>-->
  </div>

</template>

<script>
  import {XButton, Confirm, querystring} from 'vux'
  import tokenService from '../service/tokenService'
  import Loading from './loading'

  const ROSE_OPTION_KEY = 'ROSE_OPTION';
  export default {
    components: {
      XButton,
      Confirm,
      Loading
    },
    data() {
      return {
        showLookReport: false, // 是否展示查看报表按钮
        showLoading: false
      }
    },
    methods: {
      /*
       * 销售预报
       */
      goSP() {
        this.$router.push({path: '/saleReport'})
      },
      //支援
      gohelp() {
        this.$router.push({path: '/help'})
      },
      /*
       * 个人业绩
       */
      goMR() {
        this.$router.push({path: '/myRecord'})
      },
      /*
       * 查看报表
       */
      goRP() {
        this.$router.push({path: '/reportsOp'})
      }
    },
    beforeCreate() {
      let query = querystring.parse(location.search.slice(1));
      if (process.env.NODE_ENV !== 'development' && !query.code) {
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
          if (`${data.statu}` === '1') { // statu为1则为总裁
            this.showLookReport = true
          }
        });
        await tokenService.getUser().then(data => {
          localStorage.setItem(ROSE_OPTION_KEY, JSON.stringify({
            region: data.shengName || '',
            bank: data.bankName || '',
            dept: data.sybName || '',
            captain: data.bmName || ''
          }))
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

<style scoped>
  /* 公司名  */
  .cp_title {
    width: 100%;
    height: 150px;
    line-height: 150px;
    text-align: center;
    font-size: 50px;
    font-weight: 200;
    color: #CFCFCF;
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

  /* 选项框 */
  .select_part {
    width: 90%;
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
