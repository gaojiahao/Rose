<template>
  <div class="flow-detail-container">
    <h1 class="f_title">工作流</h1>
    <div class="f_main">
      <div class="f_main_wrapper">
        <div class="f_flow">
          <group title="流程图"></group>
          <flow class="flows" orientation="vertical">
            <flow-state state="1" title="省长" :is-done="governor.stateDone"></flow-state>
            <flow-line tip-direction="right" :tip="governor.tip" :is-done="governor.lineDone"></flow-line>
            <flow-state state="2" title="常委" :is-done="committee.stateDone"></flow-state>
            <flow-line tip-direction="right" :tip="committee.tip" :is-done="committee.lineDone"></flow-line>
            <flow-state state="3" title="副总" :is-done="vicePresident.stateDone"></flow-state>
            <flow-line tip-direction="right" :tip="vicePresident.tip" :is-done="vicePresident.lineDone"></flow-line>
            <flow-state state="4" title="财务" :is-done="finance.stateDone"></flow-state>
            <flow-line :line-span="30" tip-direction="right" :tip="finance.tip" :is-done="finance.lineDone"></flow-line>
            <flow-state state="5" title="总裁——王珏" :is-done="ceo.stateDone"></flow-state>
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
          </group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {Flow, Cell, Group, FlowState, FlowLine, Panel} from "vux";
  import createService from './../../service/createService'

  export default {
    props: {
      transCode: {
        type: String,
        default: ''
      }
    },
    name: "FlowDetail",
    data() {
      return {
        // 省长
        governor: {
          stateDone: true,
          lineDone: false,
          tip: '',
        },
        // 常委
        committee: {
          stateDone: false,
          lineDone: false,
          tip: '',
        },
        // 副总
        vicePresident: {
          stateDone: false,
          lineDone: false,
          tip: '',
        },
        // 财务
        finance: {
          stateDone: false,
          lineDone: false,
          tip: '',
        },
        // 总裁
        ceo: {
          stateDone: false,
          lineDone: false,
          tip: '',
        },
        commentList: [],
      }
    },
    components: {
      Flow,
      Cell,
      Group,
      FlowLine,
      FlowState,
      Panel,
    },
    methods: {
      // TODO 获取工作流
      getFlows() {
        return createService.getWorkFlow({
          transCode: this.transCode
        }).then(data => {
          let last = data.pop();
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
          let showList = ['常委审批', '副总裁审批', '财务审批', '总裁审批'];
          data && data.forEach((item, index) => {
            // 只取四个审批节点的数据做展示
            if (showList.indexOf(item.actName) !== -1) {
              this.commentList.push({
                title: item.name,
                desc: item.comment || '无',
                time: item.startTime,
                meta: {
                  date: item.startTime
                }
              })
            }
          });
          switch (last.actName) {
            case 'Start':
              this.governor = doing;
              break;
            case '常委审批':
              this.governor = done;
              this.committee = doing;
              break;
            case '副总裁审批':
              this.governor = done;
              this.committee = done;
              this.vicePresident = doing;
              break;
            case '财务审批':
              this.governor = done;
              this.committee = done;
              this.vicePresident = done;
              this.finance = doing;
              break;
            case '总裁审批':
              this.governor = done;
              this.committee = done;
              this.vicePresident = done;
              this.finance = done;
              this.ceo = {
                stateDone: false,
                lineDone: false,
                tip: '',
              };
              break;
            case '重新提交':
              this.governor = doing;
              break;
            case '生效表单':
              break;
            case 'End':
              this.governor = done;
              this.committee = done;
              this.vicePresident = done;
              this.finance = done;
              this.ceo = done;
              break;
            default:
              break;
          }
        }).catch(e => {
          this.$parent.showToastText(e.message);
        })
      }
    },
    created() {
      this.getFlows();
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
          flex: 3;
          .title {
            margin-bottom: 5px;
          }
          .time {
            color: #cecece;
            font-size: 14px;
          }
        }
        .comment-right {
          flex: 4;
          padding-left: 10px;
          text-align: right;
        }
      }
    }
  }
</style>
