<template>
  <!-- 工作流 -->
  <div class="work_flow mg_auto box_sd" @click="popupShow = true" :class="{hidden : simpleWL.length<=0}">
    <!-- 右箭头 -->
    <x-icon class="r_arrow" type="ios-arrow-down" size="30"></x-icon>
    <!-- 表单状态 及 编码 -->
    <div class="work_info">
      <!-- 状态 -->
      <span class="work_status" :class="workFlowInfo.dyClass">{{workFlowInfo.biStatus}}</span>
      <!-- 编码 -->
      <span class="work_code"
            :class="workFlowInfo.coClass">{{workFlowInfo.transCode && workFlowInfo.transCode.replace(/_/g,'')}}</span>
    </div>
    <!-- 简化版工作流 -->
    <div class="flow_list">
      <div class="each_msg vux-1px-b"
           v-for="(item, index) in simpleWL"
           :key=index>
        <!-- 头像 -->
        <div class="user_avatar">
          <img :src='index % 2 ? defaulImg2: defaulImg' alt="avatar">
        </div>
        <!-- 操作信息 -->
        <div class="handle_info">
          <div class="handle_name">
            <!-- 操作动作 -->
            <span>{{item.nodeName}}</span>
            <!-- 操作状态 A(没有返回状态) -->
            <span class="status" v-if="!item.status">{{workFlowInfo.biStatus}}</span>
            <!-- 操作状态 B(有返回状态) -->
            <span class="status" :class=item.dyClass v-else-if="item.status">{{item.status}}</span>
          </div>
          <!-- 流程节点 用户名 -->
          <div class="user_name">
            {{item.userName}}
          </div>
          <!-- 备注 -->
          <div class="remark">备注: {{item.message || '无'}}</div>
        </div>
      </div>
    </div>
    <!-- 工作流详情 -->
    <div v-transfer-dom>
      <popup v-model="popupShow" position="bottom" height="100%">
        <r-scroll class="full-flow-container" ref="bScroll">
          <div class="flow">
            <div class='flow_top'>
              <span class="title">工作流详情</span>
              <span class="close" @click="closePop" v-if="fullWorkFlow.length >= 5">关闭</span>
              <!-- <icon type="cancel" @click.native="closePop"></icon> -->
            </div>
            <div class="flow_list">
              <div class="each_msg"
                   :class="isMyTask && index === fullWorkFlow.length - 1 || userName === item.userName ? 'whenisMine' : ''"
                   v-for="(item, index) in fullWorkFlow"
                   :key=index>
                <!-- 接收时间 -->
                <div class="recive_time">
                  <span class="num">{{item.startTime || crtTime}}</span>
                </div>
                <div class="info_part">
                  <!-- 头像 -->
                  <div class="user_info">
                    <div class="user_avatar">
                      <img :src='item.userName === userName ? defaulImg: defaulImg2' alt="avatar">
                      <div class="name">{{item.userName}}</div>
                    </div>
                  </div>
                  <!-- 操作信息 -->
                  <div class="handle_info">
                    <div class="triangle"></div>
                    <div class="content">
                      <div class="handle_name">
                        <!-- 操作动作 -->
                        <span>{{item.nodeName}}</span>
                        <!-- 操作状态 B(有返回状态) -->
                        <span class="status"
                              :class=item.dyClass
                              v-if='index > 0'>
                      {{item.status === '撤回'? '提交者主动撤回' : item.status || noStatus}}
                    </span>
                      </div>
                      <!-- 备注 -->
                      <div class="remark">备注: {{item.message || '无'}}</div>
                      <div class="handle" v-if="item.endTime">处理时间: {{item.endTime || '暂无'}}</div>
                    </div>
                  </div>
                  <!-- 此处为空白div 解决因为浮动而没有高度的问题 -->
                  <div class="del_f"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="btn" v-if="fullWorkFlow.length >= 5">
            <span class="cfm_btn" @click="closePop">关闭工作流</span>
          </div>
        </r-scroll>
        <!-- 少于5条数据时固定在底部 -->
        <div class="btn when_less" v-if="fullWorkFlow.length < 5">
          <span class="cfm_btn" @click="closePop">关闭工作流</span>
        </div>
      </popup>
    </div>
  </div>
</template>
<script>
  import {TransferDom, Popup, Group, Icon, XButton} from 'vux'
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
        defaulImg2: require('assets/ava04.png'),       // 默认图片2
        simpleWL: [],
        popupShow: false,
      }
    },
    watch: {
      fullWorkFlow: {
        handler() {
          this.workFlowHandler();
        }
      },
      popupShow: {
        handler(bool) {
          if (bool) {
            this.$nextTick(() => {
              if (this.$refs.bScroll) {
                this.$refs.bScroll.refresh();
              }
            });
          }
        }
      }
    },
    directives: {
      TransferDom
    },
    components: {
      Popup,
      Group,
      Icon,
      XButton,
      RScroll,
    },
    methods: {
      closePop() {
        this.popupShow = false;
      },
      workFlowHandler() {
        for (let item of this.fullWorkFlow) {
          // 去除名字中的空格
          item.userName = item.userName.replace(/\s*/g, "");
          switch (item.status) {
            case '同意':
              item.dyClass = 'agree_c';
              break;
            case '不同意':
              item.dyClass = 'reject_c';
              break;
            case '终止':
              item.dyClass = 'reject_c';
              break;
          }
        }
        this.simpleWL = this.fullWorkFlow.slice(-2);
      },
    },
    created() {
      this.workFlowHandler();
    }
  }
</script>

<style lang='scss' scoped>
  .vux-1px-b:after {
    border-color: #e8e8e8;
  }

  // 居中
  .mg_auto {
    width: 95%;
    margin: 10px auto;
  }

  // 阴影
  .box_sd {
    box-sizing: border-box;
    box-shadow: 0 0 8px #e8e8e8;
  }

  // 简易版工作流
  .work_flow {
    position: relative;
    padding: .06rem .08rem .2rem;
    // 右箭头
    .r_arrow {
      bottom: 0;
      left: 50%;
      position: absolute;
      transform: translate(-50%, 0);
    }
    .hidden {
      display: none;
    }
    // 提示文字
    .tip_tx {
      width: 100%;
      font-size: .1rem;
      color: #757575;
      padding: .04rem 0;
    }
    // 表单基本信息
    .work_info {
      display: flex;
      .work_status,
      .work_code {
        font-weight: bold;
        font-size: .14rem;
        padding: 0 .06rem;
        display: inline-block;
      }
      // 表单状态
      .work_status {
        color: #fff;
        background: #53d397;
        border-top-left-radius: .12rem;
      }
      // 进行中
      .doing_work {
        background: #5077aa;
      }
      // 已失效
      .invalid_work {
        background: #c93d1b;
      }
      // 表单编码
      .work_code {
        display: inline-block;
        background: #455d7a;
        color: #fff;
      }
      // 进行中 编码 {
      .doing_code {
        color: #111;
        background: #dbe2ef;
      }

    }
    // 工作流信息
    .flow_list {
      margin-top: .1rem;
      position: relative;
      // 每一个明细
      .each_msg {
        display: flex;
        padding-bottom: .1rem;
        margin-bottom: .1rem;
        // 用户头像
        .user_avatar {
          width: .65rem;
          height: .65rem;
          img {
            width: 100%;
          }
        }
        // 操作信息
        .handle_info {
          color: #111;
          display: flex;
          font-size: .12rem;
          margin-left: .1rem;
          flex-direction: column;
          justify-content: center;
          // 用户名称
          .user_name {
            font-size: .14rem;
          }
          // 操作名称
          .handle_name {
            font-size: .18rem;
            font-weight: bold;
            span {
              display: inline-block;
            }
            // 默认样式
            .status {
              color: #fff;
              font-size: .1rem;
              padding: 0 .04rem;
              margin-top: -.02rem;
              background: #5077aa;
              vertical-align: middle;
            }
            // 同意样式
            .agree_c {
              background: #53d397;
            }
            // 拒绝样式
            .reject_c {
              background: #c93d1b;
            }
          }
          // 备注
          .remark {
            max-width: 2.6rem;
            overflow: hidden;
            white-space: nowrap;
            font-size: .1rem;
            color: #757575;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }

  // 完整版工作流
  .vux-popup-dialog {
    background: #fff;
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    .full-flow-container {
      height: 100%;
    }
    .flow {
      .flow_top {
        display: flex;
        align-items: center;
        padding: .05rem .1rem;
        justify-content: space-between;
        // 标题
        .title {
          color: #111;
          font-weight: bold;
          font-size: .24rem;
        }
        // 关闭按钮
        .close {
          display: block;
          color: #fff;
          padding: 0 .1rem;
          font-size: .18rem;
          background: #dd0a35;
          border-radius: .24rem;
        }
      }
      // 工作流信息
      .flow_list {
        position: relative;
        padding: .06rem .08rem 0;
        // 每一个明细
        .each_msg {
          margin-bottom: .2rem;
          position: relative;
          // 接收时间
          .recive_time {
            width: 100%;
            font-size: .12rem;
            color: #757575;
            text-align: center;
            box-sizing: border-box;
            margin-bottom: .02rem;
          }
          // 内容部分
          .info_part {
            position: relative;
            padding-left: .44rem;
            .user_info {
              position: absolute;
              left: 0;
              top: 0;
              // 用户头像
              .user_avatar {
                width: .5rem;
                display: flex;
                font-size: .1rem;
                flex-direction: column;
                // 图片
                img {
                  width: 100%;
                  border-radius: .24rem;
                }
                // 名字
                .name {
                  margin-top: .02rem;
                  text-align: center;
                }
              }
            }
            // 操作信息
            .handle_info {
              color: #111;
              font-size: .12rem;
              margin-left: .2rem;
              position: relative;
              display: inline-block;
              // 内容区域
              .content {
                background: #F4F4F4;
                border-radius: .08rem;
                padding: .04rem .1rem .02rem;
                box-sizing: border-box;
                // 用户名称
                .user_name {
                  font-size: .14rem;
                }
                // 操作名称
                .handle_name {
                  font-size: .18rem;
                  font-weight: bold;
                  span {
                    display: inline-block;
                  }
                  // 默认样式
                  .status {
                    color: #fff;
                    font-size: .1rem;
                    padding: 0 .04rem;
                    margin-top: -.02rem;
                    background: #5077aa;
                    vertical-align: middle;
                  }
                  // 同意样式
                  .agree_c {
                    background: #53d397;
                  }
                  // 拒绝样式
                  .reject_c {
                    background: #c93d1b;
                  }
                }
                // 备注
                .remark {
                  font-size: .14rem;
                  color: #757575;
                }
              }
              // 三角
              .triangle {
                content: "";
                width: 0;
                height: 0;
                top: .14rem;
                left: -.1rem;
                position: absolute;
                border-top: .1rem solid transparent;
                border-right: .1rem solid #F4F4F4;
                border-bottom: .1rem solid transparent;
              }
            }
          }
        }
        // 当工作流为最后一个 并且节点与我有关时
        .whenisMine {
          .info_part {
            .user_info {
              right: 0;
              left: inherit;
            }
            .handle_info {
              float: right;
              margin-left: inherit;
              margin-right: .64rem;
              //#cde3eb
              $bgcolor: #d6e4f0;
              .content {
                background: $bgcolor;
              }
              .triangle {
                content: "";
                width: 0;
                height: 0;
                top: .14rem;
                left: inherit;
                right: -.1rem;
                position: absolute;
                border-right: inherit;
                border-top: .1rem solid transparent;
                border-left: .1rem solid $bgcolor;
                border-bottom: .1rem solid transparent;
              }
            }
            .del_f {
              clear: both;
            }
          }
        }
      }
    }
    // 确定
    .btn {
      width: 100%;
      background: #fff;
      text-align: center;
      margin-bottom: .1rem;
      .cfm_btn {
        width: 2.8rem;
        color: #fff;
        height: .44rem;
        line-height: .44rem;
        text-align: center;
        background: #5077aa;
        display: inline-block;
        border-radius: .4rem;
        box-shadow: 0 2px 5px #5077aa;
      }
    }
    // 工作流数据少的时候 按钮固定在底部
    .when_less {
      left: 0;
      bottom: 0;
      position: fixed;
    }
  }
</style>
