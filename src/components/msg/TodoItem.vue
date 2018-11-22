<template>
  <div class='each_msg' :class="{visited: item.visited}">
    <div class="msg_info">
      <!-- 图片 和 应用名称 -->
      <div class="app_info">
          <span class="app_img">
            <img :src='item.list && item.list[0].pic' alt="appImg" @error='getDefaultImg(item[0] || "")'>
          </span>
        <span class="app_name">{{name}}</span>
      </div>
      <!-- 时间 -->
      <div class="msg_time">{{item.list | handleCrt }}</div>
      <badge :text="item.list && item.list.length"></badge>
    </div>
    <div class="recv_msg">
      您收到{{item.list && item.list.length > 1 ? '多' : '一'}}条新的消息
    </div>
  </div>
</template>

<script>
  import {Badge} from 'vux'

  export default {
    name: "TodoItem",
    props: {
      item: {
        type: Object,
        default() {
          return {}
        }
      },
      name: {
        type: String,
        default: ''
      }
    },
    components: {
      Badge,
    },
    data() {
      return {}
    },
    methods: {
      getDefaultImg(item) {
        let url = require('assets/defaultApp.png');
        if (item) {
          item.pic = url;
        }
        return url
      },
    },
    filters: {
      handleCrt(val) {
        if (!val) {
          return
        }
        let [first = {}] = val;
        let date = first.duration,
          //计算出小时数
          hours = parseInt(date / (3600)),
          //计算相差分钟数
          leave2 = date - (hours * 3600),       //计算小时数后剩余的毫秒数
          minutes = Math.floor(leave2 / (60)),
          //计算相差秒数
          leave3 = leave2 - (minutes * 60),     //计算分钟数后剩余的毫秒数
          seconds = Math.round(leave3),
          backTime;
        if (hours > 0) {
          backTime = `${hours}小时前`;
        }
        else {
          backTime = minutes === 0 ? '1分钟前' : `${minutes}分钟前`;
        }
        return hours < 24 ? backTime : `${first.crtTime.split(' ')[0]}`;

      }
    },
  }
</script>

<style scoped lang="scss">
  .each_msg {
    position: relative;
    width: 95%;
    padding: .1rem;
    background: #fff;
    margin: .1rem auto .2rem;
    box-sizing: border-box;
    border-radius: .08rem;
    box-shadow: 0 2px 10px #e8e8e8;
    transition: background-color 200ms linear;
    &.visited {
      background-color: #e8e8e8;
    }
    .vux-badge {
      position: absolute;
      right: 0;
      top: -.1rem;
    }
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

      margin-top: .1rem;
    }
  }
</style>
