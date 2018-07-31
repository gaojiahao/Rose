<template>
  <div class="inPage">
    <!-- 搜索框 -->
    <search></search>

    <div class="msg_list">
      <div class="each_msg">
        <div class="msg_info">
          <!-- 图片 和 应用名称 -->
          <div class="app_info">
            <span class="app_img">
              <img :src='defaultImg' alt="appImg">
            </span>
            <span class="app_name">销售订单</span>
          </div>
          <!-- 时间 -->
          <div class="msg_time">15分钟前</div>
        </div>
        <div class="recv_msg">
          您收到一条新的消息
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import search from 'components/search'
export default {
  data(){
    return{
      defaultImg: require('assets/sales-stock.png')
    }
  },
  components: {
    search
  }
}
</script>

<style lang='scss' scoped>
.search {
  margin: .1rem 0;
}
.each_msg {
  width: 95%;
  padding: .1rem;
  background: #fff;
  margin: 0 auto .1rem;
  box-sizing: border-box;
  border-radius: .08rem;
  box-shadow: 0 2px 10px #e8e8e8;
  // 消息头部信息
  .msg_info {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    span {
      display: inline-block;      
    }
    // 图片、应用名称
    .app_info {
      display: flex;
      align-items: center;
      // 图片
      .app_img {
        width: .24rem;
        height: .24rem;
        img {
          width: 100%;
          border-radius: .06rem;
        }
      }
      // 应用名称
      .app_name {
        font-size: .14rem;
        margin-left: .06rem;
      }
    }
    // 产生时间
    .msg_time {
      font-size: .14rem;
      color: #757575;
    }
  }
  // 消息内容
  .recv_msg {
    color: #3a3a3a;
    font-weight: 200;
    margin-top: .1rem;
  }
}
</style>
