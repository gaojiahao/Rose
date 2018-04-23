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
    <!--<router-view></router-view>-->
  </div>

</template>

<script>
  import {XButton, Confirm, querystring} from 'vux'
  import tokenService from '../service/tokenService'

  export default {
    components: {
      XButton,
      Confirm
    },
    data() {
      return {
        show: false,
        showLookReport: true
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
    created() {
      tokenService.getToken()
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
