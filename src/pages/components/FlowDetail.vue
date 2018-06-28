<template>
  <div class="flow-detail-container">
    <h1 class="f_title">
      工作流
    </h1>
    <div class="f_main">
      <div class="f_main_wrapper">
        <!--<group title="请填写对应的信息" class="info-container">
          <cell title="财务" value='财务'></cell>
          <cell title="总裁" value='王珏'></cell>
        </group>-->
        <div class="f_flow">
          <group title="流程图"></group>
          <flow class="flows" orientation="vertical">
            <flow-state state="1" title="省长" :is-done="sz.stateDone"></flow-state>
            <flow-line tip-direction="right" :tip="sz.tip" :is-done="sz.lineDone"></flow-line>
            <flow-state state="2" title="常委" :is-done="cw.stateDone"></flow-state>
            <flow-line tip-direction="right" :tip="cw.tip" :is-done="cw.lineDone"></flow-line>
            <flow-state state="3" title="副总" :is-done="fz.stateDone"></flow-state>
            <flow-line tip-direction="right" :tip="fz.tip" :is-done="fz.lineDone"></flow-line>
            <flow-state state="4" title="财务" :is-done="cwu.stateDone"></flow-state>
            <flow-line :line-span="30" tip-direction="right" :tip="cwu.tip" :is-done="cwu.lineDone"></flow-line>
            <flow-state state="5" title="总裁——王珏" :is-done="zc.stateDone"></flow-state>
          </flow>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {Flow, Cell, Group, XInput, FlowState, FlowLine} from "vux";
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
        sz: {
          stateDone: true,
          lineDone: false,
          tip: '',
        },
        cw: {
          stateDone: false,
          lineDone: false,
          tip: '',
        },
        fz: {
          stateDone: false,
          lineDone: false,
          tip: '',
        },
        cwu: {
          stateDone: false,
          lineDone: false,
          tip: '',
        },
        zc: {
          stateDone: false,
          lineDone: false,
          tip: '',
        }
      }
    },
    components: {
      Flow,
      Cell,
      Group,
      XInput,
      FlowLine,
      FlowState,
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
          switch (last.actName) {
            case 'Start':
              this.sz = doing;
              break;
            case '常委审批':
              this.sz = done;
              this.cw = doing;
              break;
            case '副总裁审批':
              this.sz = done;
              this.cw = done;
              this.fz = doing;
              break;
            case '财务审批':
              this.sz = done;
              this.cw = done;
              this.fz = done;
              this.cwu = doing;
              break;
            case '总裁审批':
              this.sz = done;
              this.cw = done;
              this.fz = done;
              this.cwu = done;
              this.zc = {
                stateDone: false,
                lineDone: false,
                tip: '',
              };
              break;
            case '重新提交':
              this.sz = doing;
              break;
            case '生效表单':
              break;
            case 'End':
              this.sz = done;
              this.cw = done;
              this.fz = done;
              this.cwu = done;
              this.zc = done;
              break;
            default:
              break;
          }
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
  }
</style>
