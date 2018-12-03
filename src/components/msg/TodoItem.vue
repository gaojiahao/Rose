<template>
  <div class='each-msg' :class="{visited: item.visited}">
    <div class="app-img-part">
      <img :src='item.list && item.list[0].pic' alt="appImg" @error='getDefaultImg(item[0] || "")'>
    </div>
    <div class="msg-container-part">
      <div class="top_part">
        <span class="app_name">{{name}}</span>
        <span class="msg_time">{{item.list | handleCrt}}</span>
      </div>
      <div class="main_part vux-1px-b">
        <span>
          您收到{{item.list && item.list.length > 1 ? '多' : '一'}}条新的消息
        </span>
        <badge :text="item.list && item.list.length"></badge>
      </div>
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
.vux-1px-b:after {
  border-color: #e8e8e8;
}
.each-msg {
  width: 100%;
  display: flex;
  background: #fff;
  position: relative;
  padding: .1rem .1rem 0;
  box-sizing: border-box;
  transition: background-color 300ms linear;
  &.visited {
    background-color: #e8e8e8;
  }
  .app-img-part {
    width: .5rem;
    height: .5rem;
    margin-right: .1rem;
    img {
      width: 100%;
      height: 100%;
      border-radius: .08rem;
    }
  }
  .msg-container-part {
    flex: 1;
    box-sizing: border-box;
    .top_part {
      display: flex;
      margin-bottom: .04rem;
      justify-content: space-between;
      .app_name {
        font-weight: bold;
      }
      .msg_time {
        color: #757575;
        font-size: .14rem;
      }
    }
    .main_part {
      display: flex;
      color: #757575;
      font-size: .14rem;
      align-items: center;
      padding-bottom: .1rem;
      justify-content: space-between;

    }
  }
}
</style>
