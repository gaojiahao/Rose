<template>
  <div class='each-msg' :class="{visited: item.visited}">
    <div class="app-img-part">
      <img :src='item.list && item.list[0].pic' alt="appImg" @error='getDefaultImg(item[0] || "")'>
    </div>
    <div class="msg-container-part" :class="{'vux-1px-b': !noBorder}">
      <div class="top_part">
        <span class="app_name">{{name}}</span>
        <span class="msg_time">{{item.list | handleCrt}}</span>
      </div>
      <div class="main_part">
        <span class="info">您收到{{item.list && item.list.length > 1 ? '多' : '一'}}条新的消息</span>
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
      },
      // 是否展示底部边框
      noBorder: {
        type: Boolean,
        default: false
      },
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
  border-color: #ECEDEC;
}
.each-msg {
  width: 100%;
  display: flex;
  background: #fff;
  position: relative;
  padding: .15rem;
  box-sizing: border-box;
  transition: background-color 300ms linear;
  &.visited {
    background-color: #e8e8e8;
  }
  .app-img-part {
    width: .45rem;
    height: .45rem;
    margin-right: .1rem;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  .msg-container-part {
    flex: 1;
    padding-bottom: .15rem;
    box-sizing: border-box;
    .top_part {
      display: flex;
      margin-bottom: .1rem;
      justify-content: space-between;
      .app_name {
        line-height: .22rem;
        color: #333;
        font-weight: 600;
      }
      .msg_time {
        line-height: .17rem;
        color: #ccc;
        font-size: .12rem;
      }
    }
    .main_part {
      display: flex;
      color: #696969;
      align-items: center;
      justify-content: space-between;
      font-size: .12rem;
      .info {
        line-height: .17rem;
      }
    }
  }
}
</style>
