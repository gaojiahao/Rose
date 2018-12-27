<template>
  <!-- 工作流 -->
  <div class="work-flow-container" v-if="fullWorkFlow.length">
    <div class="work-flow-header">工作流</div>
    <div class="work-flow-status-wrapper">
      <i class="icon-flow-time"></i>
      <span>工作流已到{{currentStatus.nodeName}}，当前状态：<span :class="[statusClass]">{{workFlowInfo.biStatus}}</span></span>
    </div>
    <div class="work-flow-time">{{currentStatus.startTime | dateFormat('YYYY-MM-DD')}}</div>
    <div class="work-flow-more" @click="goWorkFlowFull">
      <div class="work_flow_more_button">
        <span class="text">查看更多详情</span>
        <i class="icon-filter-down"></i>
      </div>
    </div>
  </div>
</template>
<script>
  import {Popup, Group, Icon, XButton, dateFormat} from 'vux'
  import RScroll from 'components/RScroll'

  export default {
    props: {
      noStatus: {
        type: String,
        require: true
      },
      crtTime: {
        type: String,
        require: true
      },
      // 完整工作流
      fullWorkFlow: {
        type: Array,
        default() {
          return []
        }
      },
      // 当前用户名-用户编码
      userName: {
        type: String,
        default: ''
      },
      // 是否为我的任务
      isMyTask: {
        type: Boolean,
        default: false
      },
      workFlowInfo: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      return {
        defaulImg: require('assets/ava03.png'),   // 默认图片1
        currentStatus: {},
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
      }
    },
    watch: {
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
      workFlowHandler() {
        let [currentStatus = {}] = this.fullWorkFlow.slice(-1);
        for (let item of this.fullWorkFlow) {
          // 去除名字中的空格
          item.userName = item.userName.replace(/\s*/g, "");
        }
        this.currentStatus = currentStatus;
      },
      // TODO 跳转到工作流列表页面
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
    margin: .1rem 0;
    padding: .15rem .25rem;
    width: 100%;
    background-color: #fff;
    color: #333;
    box-sizing: border-box;
    .work-flow-header {
      line-height: .14rem;
      font-size: .16rem;
    }
    /* 已生效、草稿为#333 */
    .work-flow-status-wrapper {
      display: flex;
      align-items: center;
      margin-top: .15rem;
      line-height: .14rem;
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
