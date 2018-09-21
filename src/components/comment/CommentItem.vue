<template>
  <div class="comment-item" @click.stop="reply">
    <header class="header">
      <div class="header-left">
        <img class="avatar" :src="item.photo || require('assets/ava01.png')" @error="getDefaultImg">
        <span class="creator-name">{{item.creatorName}}</span>
        <span class="time">{{item.CRT_TIME | filterTime}}</span>
      </div>
      <div class="header-right" @click.stop="savePraise">
        <!-- isPraise: 是否能点赞 -->
        <i class="iconfont icon-L2" :class="{praise: !item.isPraise}"></i><span>{{item.praiseNum}}</span>
      </div>
    </header>
    <div class="comment" v-html="item.CONTENT"></div>
    <div class="comment-reply">
      <slot name="reply"></slot>
    </div>
  </div>
</template>

<script>
  import {savePraise} from 'service/commentService'

  export default {
    name: "CommentItem",
    props: {
      item: {
        type: Object,
        default() {
          return {}
        }
      }
    },
    data() {
      return {}
    },
    methods: {
      // TODO 获取默认用户图片
      getDefaultImg(e) {
        e.target.src = require('assets/ava01.png');
      },
      // TODO 抛出回复事件
      reply() {
        this.$emit('on-reply', this.item);
      },
      // TODO 点赞
      savePraise() {
        // 已点过赞，不允许点击
        if (!this.item.isPraise) {
          return
        }
        return savePraise(this.item.ID).then((success = true, message) => {
          if (success) {
            this.$emit('on-praise-success', this.item);
          }
        })
      },
    },
    filters: {
      // TODO 处理时间
      filterTime(val) {
        if (!val) {
          return
        }
        let now = Date.now();
        if (typeof val === 'string') {
          val = val.replace(/-/g, '/').replace(/\..*/g, '');
        }
        let date = +new Date(val);
        let calc = now - date;
        let second = calc / 1000;
        let minute = second / 60;
        let hour = minute / 60;
        let day = hour / 24;
        if (second < 60) {
          return '刚刚';
        } else if (minute < 60) {
          return `${parseInt(minute)}分钟前`;
        } else if (hour < 24) {
          return `${parseInt(hour)}小时前`;
        } else if (day < 30) {
          return `${parseInt(day)}天前`;
        }
        return val
      }
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  /* 单条评论项 */
  .comment-item {
    $avatarSize: .35rem;
    padding: .1rem;
    .header {
      display: flex;
      justify-content: space-between;
    }
    .header-left {
      display: flex;
      align-items: center;
    }
    .header-right {
      .iconfont {
        margin-right: .05rem;
      }
      .icon-L2 {
        &.praise {
          color: #c93d1b;
        }
      }
    }
    /* 评论者头像 */
    .avatar {
      margin-right: .1rem;
      width: $avatarSize;
      height: $avatarSize;
      border-radius: $avatarSize/2;
    }
    /* 评论者名称 */
    .creator-name {
      margin-right: .1rem;
      color: #111;
      font-weight: bold;
    }
    /* 时间 */
    .time {
      color: #757575;
    }

    /* 评论内容 */
    .comment {
      padding-left: $avatarSize + .1rem;
      color: #454545;
    }

    /* 回复内容 */
    .comment-reply {
      padding-left: $avatarSize + .1rem;
      .comment-item {
        padding: 0;
      }
    }
  }
</style>
