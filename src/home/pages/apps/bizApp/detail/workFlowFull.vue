<template>
  <div class="work-flow-full-container">
    <slot name="nav"></slot>
    <r-scroll>
      <header class="work-flow-header">工作流</header>
      <div class="work-flow-wrapper">
        <div
          class="work_flow_item vux-1px-l"
          v-for="(item, index) in workFlowList"
          :class="[item.statusClass, {is_my_node: item.isMyNode}]"
          :key="index"
        >
          <div class="work_flow_time">
            <span>{{item.startTime | dateFormat('YYYY-MM-DD')}}</span>
            <span class="hour">{{item.startTime | dateFormat('HH:mm:ss')}}</span>
          </div>
          <div class="work_flow_info">
            <img :src="item.photoUrl" alt="avatar" class="avatar" @error="getDefaultIcon(item)">
            <div class="work_flow_info_right">
              <div class="work_flow_node">
                <div class="node_info">
                  <div class="node_name">{{item.nodeName}}</div>
                  <div class="node_user">{{item.userName}}</div>
                  <div class="node_user">{{item.endTime | dateFormat('YYYY-MM-DD HH:mm:ss')}}</div>
                </div>
                <div class="node_status">{{item.status || item.statusText}}</div>
              </div>
              <div class="work_flow_remark">备注：{{item.message || '无'}}</div>
            </div>
          </div>
        </div>
      </div>
    </r-scroll>
  </div>
</template>

<script>
import { listTaskLogByTransCode} from "service/detailService";
import { getBasicInfo} from "service/commonService";
import { dateFormat } from "vux";
import RScroll from "plugins/scroll/RScroll";

export default {
  name: "WorkFlowFull",
  data() {
    return {
      transCode: "",
      currentUser: {}, // 当前用户信息
      workFlow: [],
      defaulImg: require("assets/ava01.png") // 默认图片1
    };
  },
  computed: {
    // 工作流列表
    workFlowList() {
      let workFlow = this.workFlow;
      let { userId = "" } = this.currentUser;
      workFlow.forEach(item => {
        item.isMyNode = `${userId}` === `${item.assignee}`;
      });
      return workFlow;
    }
  },
  components: {
    RScroll
  },
  methods: {
    // 设置默认图片
    getDefaultIcon(item) {
      let url = this.defaulImg;
      if (item) {
        item.photoUrl = url;
      }
      return url;
    },
    // 获取当前用户信息
    getCurrentUser() {
      return getBasicInfo().then(data => {
        this.currentUser = data.currentUser;
      });
    },
    // 获取工作流
    getTaskLogs() {
      return listTaskLogByTransCode({
        transCode: this.transCode
      }).then(({ tableContent = [] }) => {
        let [firstNode = {}] = tableContent;
        let [lastNode] = tableContent.slice(-1);
        tableContent.forEach((item, index) => {
          item.statusClass = "";
          item.statusText = "已完成";
        });
        // 设置第一个节点的状态文案
        firstNode.statusText = "已提交";
        // 设置最后一个节点的状态文案
        if (!lastNode.endTime) {
          lastNode.statusClass = "doing";
          lastNode.statusText = "进行中";
        } else {
          lastNode.statusClass = "done";
        }
        this.workFlow = tableContent.reverse();
      });
    }
  },
  filters: {
    dateFormat
  },
  created() {
    let { transCode } = this.$route.query;
    let promises = [];
    this.transCode = transCode;
    this.$loading.show();
    promises.push(this.getCurrentUser());
    promises.push(this.getTaskLogs());
    Promise.all(promises).then(() => {
      this.$loading.hide();
    });
  }
};
</script>

<style scoped lang="scss">
.work-flow-full-container {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 10;
  /*padding: .15rem 0 0;*/
  width: 100%;
  height: 100%;
  background-color: #fff;
  color: #333;
  overflow: hidden;
  box-sizing: border-box;
  .scroll-container {
    width: 100%;
    height: 100%;
    /deep/ .scroll-wrapper {
      padding: 0 0.15rem 0 0.23rem;
      width: 100%;
      box-sizing: border-box;
    }
  }
  .work-flow-header {
    margin-top: 0.15rem;
    line-height: 0.14rem;
    font-size: 0.16rem;
  }
  .work-flow-wrapper {
    width: 100%;
    margin-bottom: 0.15rem;
    box-sizing: border-box;
  }
  .work_flow_item {
    padding: 0.15rem 0 0 0.14rem;
    /* 最新的审批节点 */
    &:first-child {
      margin-top: 0.15rem;
      padding-top: 0;
      &:before {
        top: 0.03rem;
      }
      &:after {
        top: 0;
      }
    }
    &:before {
      color: #d9d9d9;
    }
    /* 圆点 */
    &:after {
      content: "";
      position: absolute;
      left: 0;
      top: 0.15rem;
      display: inline-block;
      width: 0.06rem;
      height: 0.06rem;
      border-radius: 50%;
      background-color: #d8d8d8;
      transform: translate(-50%, 50%);
    }
    /* 进行中 */
    &.doing {
      .node_status {
        line-height: 0.16rem;
        color: #3296fa;
        font-size: 0.16rem;
      }
      &:after {
        top: -0.04rem;
        width: 0.1rem;
        height: 0.1rem;
        background-color: #3296fa;
      }
    }
    &.done {
      &:after {
        top: -0.1rem;
        width: 0.16rem;
        height: 0.16rem;
        background: url("~assets/iconfont/success.png");
        background-size: cover;
      }
    }
    /* 我提交/审批节点 */
    &.is_my_node {
      .work_flow_info {
        background-color: #f1f5fd;
      }
      .node_name {
        color: #1983e9;
      }
      .node_user {
        color: #6aaff0;
      }
      .node_status {
        color: #6aaff0;
      }
      .work_flow_remark {
        color: #228ff6;
      }
    }
  }
  /* 工作流节点创建时间 */
  .work_flow_time {
    display: flex;
    line-height: 0.12rem;
    font-size: 0.12rem;
    .hour {
      margin-left: 0.05rem;
      color: #999;
    }
  }
  .work_flow_info {
    display: flex;
    margin-top: 0.15rem;
    padding: 0.15rem;
    border-radius: 4px;
    background-color: #f7f7f7;
    box-sizing: border-box;
    /* 头像 */
    .avatar {
      width: 0.4rem;
      height: 0.4rem;
      border-radius: 50%;
    }
    .work_flow_info_right {
      flex: 1;
      margin-left: 0.1rem;
    }
    .work_flow_node {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.05rem;
    }
    /* 节点名称 */
    .node_name {
      line-height: 0.14rem;
      color: #696969;
      font-size: 0.14rem;
    }
    /* 节点责任人 */
    .node_user {
      margin-top: 0.05rem;
      line-height: 0.12rem;
      color: #999;
      font-size: 0.12rem;
    }
    /* 节点状态 */
    .node_status {
      line-height: 0.12rem;
      font-size: 0.12rem;
    }
    /* 备注 */
    .work_flow_remark {
      margin-top: 0.15rem;
      line-height: 0.18rem;
      color: #696969;
      font-size: 0.12rem;
    }
  }
}
.hasNav .scroll-container{
   height: calc(100% - 46px);
}
</style>
