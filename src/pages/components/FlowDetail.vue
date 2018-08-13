<template>
  <div class="flow-detail-container">
    <h1 class="f_title">工作流</h1>
    <div class="f_main">
      <div class="f_main_wrapper">
        <div class="f_flow">
          <group title="流程图"></group>
          <flow class="flows" orientation="vertical">
            <template v-for="(item, index) in flowList">
              <flow-state :state="index + 1" :title="item.title" :is-done="item.stateDone"></flow-state>
              <flow-line tip-direction="right" :tip="item.tip" :is-done="item.lineDone"
                         v-if="index !== flowList.length - 1"></flow-line>
            </template>
          </flow>
          <!--<panel header="审批意见" :list="commentList" :type="'4'"></panel>-->
          <group title="审批意见">
            <ul class="comment-container">
              <li class="comment-item" v-for="(item, index) in commentList" :key="index">
                <div class="comment-left">
                  <div class="title">{{item.title}}</div>
                  <div class="time">{{item.time}}</div>
                </div>
                <div class="comment-right">{{item.desc}}</div>
              </li>
            </ul>
            <load-more :show-loading="false" tip="暂无审批意见" v-if="!commentList.length"></load-more>
          </group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {Flow, Cell, Group, FlowState, FlowLine, LoadMore, Panel} from "vux";
  import createService from './../../service/createService'

  export default {
    props: {
      workFlow: {
        type: Array,
        default() {
          return {}
        }
      }
    },
    name: "FlowDetail",
    data() {
      return {
        commentList: [],
        flowList: [
          {
            stateDone: true,
            lineDone: false,
            tip: '进行中',
            title: '省长'
          }, {
            stateDone: false,
            lineDone: false,
            tip: '',
            title: '部门'
          }, {
            stateDone: false,
            lineDone: false,
            tip: '',
            title: '副总'
          }, {
            stateDone: false,
            lineDone: false,
            tip: '',
            title: '财务'
          }, {
            stateDone: false,
            lineDone: false,
            tip: '',
            title: '总裁——王珏'
          },
        ],
      }
    },
    watch: {
      workFlow: {
        handler() {
          this.assembleWorkFlow();
        }
      }
    },
    components: {
      Flow,
      Cell,
      Group,
      FlowLine,
      FlowState,
      LoadMore,
      Panel,
    },
    methods: {
      // TODO 组装工作流数据
      assembleWorkFlow() {
        let showList = ['常委', '部门主管', '副总裁', '分管副总', '财务', '总裁'];
        let workFlow = [...this.workFlow];
        let [firstNode = {}] = workFlow;
        let secondNode = {};
        let lastNode = workFlow[workFlow.length - 1] || {};
        workFlow && workFlow.forEach((item, index) => {
          item.userName = item.userName && item.userName.split('-')[0];
          // 只取审批节点的数据做展示，获取已审批的备注
          if (item.endTime && showList.indexOf(item.nodeName) !== -1) {
            this.commentList.push({
              title: item.userName,
              desc: item.message || '无',
              time: item.startTime,
              meta: {
                date: item.startTime
              }
            })
          }
          if (item.nodeName === '常委' || item.nodeName === '部门主管') {
            this.flowList[1].title = item.userName;
          }
          if (item.nodeName === '副总裁' || item.nodeName === '分管副总') {
            this.flowList[2].title = item.userName;
          }
          if (item.nodeName === '财务') {
            this.flowList[3].title = item.userName;
          }
        });
        this.flowList[0].title = firstNode.userName;
        this.assembleFlow(lastNode);
      },
      // TODO 组装工作流流程图
      assembleFlow(item) {
        let tmp = [];
        let done = {
          stateDone: true,
          lineDone: true,
          tip: '',
        };
        let doing = {
          stateDone: true,
          lineDone: false,
          tip: '进行中',
        };
        switch (item.nodeName) {
          case 'Start':
            this.governor = doing;
            break;
          case '部门主管':
          case '常委':
            this.flowList[0] = {...this.flowList[0], ...done};
            this.flowList[1] = {...this.flowList[1], ...doing};
            break;
          case '分管副总':
          case '副总裁':
            this.flowList[0] = {...this.flowList[0], ...done};
            this.flowList[1] = {...this.flowList[1], ...done};
            this.flowList[2] = {...this.flowList[2], ...doing};
            break;
          case '财务':
            this.flowList[0] = {...this.flowList[0], ...done};
            this.flowList[1] = {...this.flowList[1], ...done};
            this.flowList[2] = {...this.flowList[2], ...done};
            this.flowList[3] = {...this.flowList[3], ...doing};
            break;
          case '生效表单':
            break;
          case '总裁':
          case 'End':
            this.flowList.forEach(item => {
              tmp.push({
                ...item,
                ...done,
              });
            });
            this.flowList = tmp;
            break;
          default:
            break;
        }
      },
      showToast(text = '') {
        this.$vux.toast.show({
          text: text,
          type: 'text',
          position: 'middle',
          width: 'auto',
          isShowMask: true,
        });
      },
    },
    created() {
      // this.getFlows();
      this.assembleWorkFlow();
    }
  }
</script>

<style lang="scss">
  .flow-detail-container {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    .flows {
      display: inline-block;
      margin: 0 auto 0 0;
      padding: 10px 20px;
      height: 300px;
    }
    .f_title {
      //标题
      width: 100%;
      height: 80px;
      line-height: 80px;
      font-size: 34px;
      text-align: center;
      color: #fff;
      font-weight: 200;
      background: #5077aa;
      position: relative;
      .s_user {
        line-height: initial;
        font-size: 16px;
        font-weight: normal;
        position: absolute;
        left: 50%;
        bottom: 20%;
        transform: translate(-50%);
        display: flex;
        align-items: center;
        .right_arrow {
          fill: #fff;
        }
      }
    }

    .f_main {
      width: 90%;
      max-width: 600px;
      position: absolute;
      top: 70px;
      left: 50%;
      transform: translate(-50%, 0);
      z-index: 100;
      padding-bottom: 56px;
      .f_main_wrapper {
        height: 100%;
        border-radius: 4px;
        background: #fff;
        box-shadow: 0 2px 10px #e8e8e8;
        overflow: hidden;
      }
    }

    .f_button {
      width: 100%;
      height: 44px;
      line-height: 44px;
      text-align: center;
      background: #5077aa;
      color: #fff;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 100;
    }

    /* 审批意见样式 */
    .comment-container {
      padding: 0 20px;
      .comment-item {
        display: flex;
        justify-content: space-between;
        margin: 10px 0;
        .comment-left {
          flex: 1;
          .title {
            margin-bottom: 5px;
          }
          .time {
            color: #cecece;
            font-size: 14px;
          }
        }
        .comment-right {
          flex: 1;
          padding-left: 10px;
          text-align: right;
        }
      }
    }
  }
</style>
