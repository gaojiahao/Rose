<template>
  <div class="pages">
    <div class="list_top">
      <search class="search"></search>
    </div>
    <div class="todo_msg">
      <div class="msg_top">
        <!-- 表单状态 及 编码 -->
        <div class="work_info">
          <!-- 状态 -->
          <span class="work_status doing_work">待处理</span>
          <!-- 编码 -->
          <span class="work_code doing_code">SO18080010</span>
        </div>
        <!-- 时间 -->
        <div class="time">
          54分钟前
        </div>
      </div>
      <!-- 上个节点审批信息 -->
      <div class="handle_info vux-1px-b">
        <div class="handle_avatar">
          <img src="../../assets/avatar.png" alt="avatar">
        </div>
        <div class="info">
          <div class="handle_part">
            <span class="name">瑞福登-001</span>
            <span class="handle">进行了审批</span>
            <span class="tips">[上个节点]</span>
          </div>
          <div class="handle_result">
            审批结果：<span class="result">同意</span>
          </div>
        </div>
      </div>
      <!-- 用户需要进行的操作 -->
      <div class="user_handle">
        <div class="tips">此单你需要进行:</div>
        <div class="info">MRP审批</div>
      </div>
    </div>
    <div class="todo_msg">
      <div class="msg_top">
        <!-- 表单状态 及 编码 -->
        <div class="work_info">
          <!-- 状态 -->
          <span class="work_status doing_work">待处理</span>
          <!-- 编码 -->
          <span class="work_code doing_code">SO18080005</span>
        </div>
        <!-- 时间 -->
        <div class="time">
          两个小时前
        </div>
      </div>
      <!-- 上个节点审批信息 -->
      <div class="handle_info vux-1px-b">
        <div class="handle_avatar">
          <img src="../../assets/io.jpg" alt="avatar">
        </div>
        <div class="info">
          <div class="handle_part">
            <span class="name">瑞福登-002</span>
            <span class="handle">进行了审批</span>
            <span class="tips">[上个节点]</span>
          </div>
          <div class="handle_result">
            审批结果：<span class="result" style="background:#c93d1b">不同意</span>
          </div>
        </div>
      </div>
      <!-- 用户需要进行的操作 -->
      <div class="user_handle">
        <div class="tips">此单你需要进行:</div>
        <div class="info">重新提交</div>
      </div>
    </div>

  </div>
</template>

<script>
import search from 'components/search'
export default {
  components: {
    search
  }
}
</script>

<style lang='scss' scoped>
.vux-1px-b:after {
  border-color: #e8e8e8;
}
.list_top {
  padding: .1rem 0;
}
// 待处理消息
.todo_msg {
  width: 95%;
  margin: 0 auto .2rem;
  position: relative;
  padding: .06rem .08rem .04rem;
  box-sizing: border-box;
  box-shadow: 0 2px 10px #e8e8e8;
  // 消息顶部
  .msg_top {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    // 时间
    .time {
      font-size: .12rem;
      color: #757575;
    }
  }
  // 上个节点经办人
  .handle_info {
    margin-top: .06rem;
    display: flex;
    align-items: center;
    padding-bottom: .1rem;
    // 经办人头像
    .handle_avatar {
      width: .5rem;
      height: .5rem;
      img {
        width: 100%;
        border-radius: .08rem;
      }
    }
    //
    .info {
      margin-left: .04rem;
      // 节点操作信息
      .handle_part {
        margin-bottom: .02rem;
        // 操作人名称
        .name {
          font-size: .18rem;
          font-weight: 500;
        }
        // 操作
        .handle {
          font-size: .14rem;
          font-weight: 200;
        }
        .tips {
          color: #757575;
          font-size: .1rem;
        }
      }
      // 审批结果
      .handle_result {
        color: #757575;
        font-size: .12rem;
        .result {
          color: #fff;
          background: #53d397;
          padding: 0 .04rem;
          display: inline-block;
        }
      }
    }
  }
  // 用户操作部分
  .user_handle {
    width: 100%;
    text-align: center; 
    margin-top: .04rem;   
    .tips {
      color: #757575;
      font-size: .14rem;
      font-weight: 200;
    }
    .info {
      font-size: .18rem;
      color: #111;
      font-weight: bold;
    }
  }
    
  
}


</style>
