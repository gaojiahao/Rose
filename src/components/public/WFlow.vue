<template>
  <!-- 工作流 -->
  <div class="work-flow-container" @click="goWorkFlowFull">
    <div class="work-flow-header">
      <span class="work_flow_title vux-1px-l">{{this.formData.transTypeName}}</span>
      <span class="check_more" v-if="fullWorkFlow.length">
        查看工作流<i class="icon-right"></i>
      </span>
    </div>
    <div class="work-flow-status-wrapper">
      <!-- <i class="icon-success"></i> -->
      <span class="work-flow-text">
        交易号：{{this.formData.transCode}} 当前状态：<span :class="[statusClass]">{{workFlowInfo.biStatus}}</span>
      </span>
    </div>
    <div class="work-flow-status-wrapper" v-if="fullWorkFlow.length">
      <i class="icon-flow-time"></i>
      <span class="work-flow-text">
        工作流已到{{currentStatus.nodeName}}
      </span>
    </div>
    <!-- <div class="work-flow-time">{{currentStatus.startTime}}</div> -->
  </div>
</template>
<script>
import Vue from 'vue';
import {Popup, Group, Icon, XButton, dateFormat} from 'vux'
import RScroll from 'plugins/scroll/RScroll'
import { isMyflow,getWorkFlow } from "service/detailService";
import { getBasicInfo } from "service/commonService";
var component = {
  props: {
    formData: {
      type: Object,
      default() {
        return {}
      }
    },
    fullWorkFlow: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data() {
    return {
      defaulImg: require('assets/ava01.png'),   // 默认图片1
      currentStatus: {},
      workFlowInfo: {},
    }
  },
  computed: {
    statusClass() {
      let {biStatus = ''} = this.workFlowInfo;
      switch (biStatus) {
        case '进行中':
          return 'doing';
        case '已失效':
          return 'failure';
        default:
          return ''
      }
    },
    biStatusClass() {
      let {biStatus = ''} = this.workFlowInfo;
      switch (biStatus) {
        case '进行中':
          return 'doing';
        case '已失效':
          return 'failure';
        default:
          return ''
      }
    }
  },
  watch: {
    formData: {
      handler() {
        this.workFlowInfoHandler();  
      }
    },
    fullWorkFlow: {
      handler() {
        this.workFlowHandler();
      },
      immediate: true,
    },
  },
  components: {
    Popup, Group, Icon, XButton, RScroll,
  },
  methods: {
    // 处理简易版工作流数据
    workFlowInfoHandler() {
      this.workFlowInfo = {
        biStatus: this.formData.biStatus,
        transCode: this.formData.transCode,
      };
      switch (this.formData.biStatus) {
        case '进行中':
          let newkey = 'dyClass',
          cokey = 'coClass';
          this.workFlowInfo[newkey] = 'doing_work';
          this.workFlowInfo[cokey] = 'doing_code';
          break;
        case '草稿':
          newkey = 'dyClass';
          this.workFlowInfo[newkey] = 'invalid_work';
          break;
        case '已失效':
          newkey = 'dyClass';
          this.workFlowInfo[newkey] = 'invalid_work';
          break;
      }
    },
    workFlowHandler() {
      let [currentStatus = {}] = this.fullWorkFlow.slice(-1);
      for (let item of this.fullWorkFlow) {
        // 去除名字中的空格
        item.userName = item.userName.replace(/\s*/g, "");
      }
      this.currentStatus = currentStatus;
    },
    // 跳转到工作流列表页面
    goWorkFlowFull() {
      let {transCode = ''} = this.workFlowInfo;
      this.$router.push({
        path: '/workFlowFull',
        query: {
          transCode,
        }
      })
    },
  },
  filters: {
    dateFormat,
  },
  created() {
  }
}
export default Vue.component('WFlow',component)
</script>

<style lang='scss' scoped>
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }

  %icon {
    display: inline-block;
    width: .16rem;
    height: .16rem;
  }

  .work-flow-container {
    color: #333;
    padding: .15rem;
    border-radius: .04rem;
    margin: .1rem .1rem 0;
    box-sizing: border-box;
    background-color: #fff;
    width: calc(100% - .2rem);
    .work-flow-header {
      display: flex;
      font-size: .16rem;
      line-height: .14rem;
      justify-content: space-between;
      .work_flow_title {
        line-height: .16rem;
        font-size: 16px;
        font-weight: 600;
        &:before {
          left: -.15rem;
          width: .08rem;
          border-left: .08rem solid #3296FA;
        }
      }
      .check_more {
        color: #999;
        display: flex;
        font-size: .12rem;
      }
      .icon-right {
        width: .08rem;
        height: .14rem;
        margin-left: .04rem;
        display: inline-block;
      }
    }
    /* 已生效、草稿为#333 */
    .work-flow-status-wrapper {
      display: flex;
      align-items: flex-start;
      margin-top: .1rem;
      line-height: .16rem;
      font-size: .14rem;
      /* 进行中 */
      .doing {
        color: #3296fa;
      }
      /* 已失效 */
      .failure {
        color: #999;
      }
    }
    .icon-flow-time {
      @extend %icon;
      margin-right: .1rem;
    }
    .work-flow-text {
      flex: 1;
    }
    .work-flow-time {
      margin-left: .26rem;
      margin-top: .1rem;
      line-height: .12rem;
      color: #696969;
      font-size: .12rem;
    }
    /* 查看更多 */
    .work-flow-more {
      display: flex;
      justify-content: center;
      margin-top: .3rem;
      .work_flow_more_button {
        display: flex;
        align-items: center;
        padding: .1rem .15rem;
        line-height: .14rem;
        border: 1px solid #979797;
        border-radius: .17rem;
        font-size: .14rem;
      }
      .icon-filter-down {
        display: inline-block;
        margin-left: .05rem;
        width: .11rem;
        height: .05rem;
        background-size: 100% 100%;
      }
    }
  }
</style>
