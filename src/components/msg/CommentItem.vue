<template>
  <div class="comment-item" :class="{visited: item.visited, 'is-reply': isReply}">
    <!-- 图片 和 应用名称 -->
    <div class="app-info" v-if="!noHeader">
      <img class="app-img" :src='item.pic' alt="appImg" @error="getDefaultIcon(item)">
      <span class="app-name">{{item.listName}}</span>
    </div>
    <div class="header" v-if="!noHeader">
      <div class="header-left">
        <img class="avatar" :src="item.photo || require('assets/ava01.png')" @error="getDefaultImg">
        <span class="creator-name">{{item.creatorName}}</span>
        <span class="time">{{item.crtTime | filterTime}}</span>
      </div>
      <div class="header-right">{{item.other}}</div>
    </div>
    <div class="comment" v-html="handleComment()"></div>
    <div class="comment-image" v-if="item.attachment">
      <img class="comment-image-item" :src="img.attachment" v-for="(img, iIndex) in item.attachment"
           @click.stop="scaleImg(img)" :key="iIndex" v-if="img.type === 'image'"/>
    </div>
    <div class="comment-reply" v-if="this.$slots.reply">
      <slot name="reply"></slot>
    </div>
  </div>
</template>

<script>
  import emotion from '@/home/pages/maps/emotion'
  import {dateFormat} from 'vux'
  import Vue from 'vue'

  export default {
    name: "CommentItem",
    props: {
      item: {
        type: Object,
        default() {
          return {}
        }
      },
      // 是否展示头部
      noHeader: {
        type: Boolean,
        default: false
      },
      // 是否为回复内容
      isReply: {
        type: Boolean,
        default: false
      },
    },
    data() {
      return {}
    },
    methods: {
      // TODO 获取应用icon
      getDefaultIcon(item) {
        let url = require('assets/defaultApp.png');
        if (item) {
          item.pic = url;
        }
        return url
      },
      // TODO 获取默认用户图片
      getDefaultImg(e) {
        e.target.src = require('assets/ava01.png');
      },
      // TODO 放大图片
      scaleImg(img) {
        let imgUrl = `${location.origin}${img}`;
        wx.previewImage({
          current: imgUrl, // 当前显示图片的http链接
          urls: [imgUrl] // 需要预览的图片http链接列表
        });
      },
      // TODO 替换表情图片地址
      handleComment() {
        let {CONTENT: content = '', type = '', noticeSource = ''} = this.item;
        let emotionList = [...emotion];
        let comment = this.item.comment;
        let reg = /\[(.+?)\]/g;
        // 处理PC的表情图片
        comment = comment.replace(/src="resources/g, 'src="/dist/resources');
        // 处理移动端的表情图片
        comment = comment.replace(reg, (word) => {
          // 寻找表情索引
          let idx = emotionList.findIndex(item => item === word.replace(/(\[|\])/g, ''));
          // 没有匹配项则返回原文字
          if (idx === -1) {
            return word
          }
          return `<span class="img-emotion" style="background-position: -${24 * idx}px 0;"></span>`
        });
        return comment;
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
        return dateFormat(val, 'YYYY-MM-DD')
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
    margin: .1rem auto .2rem;
    padding: .1rem;
    width: 95%;
    border-radius: .08rem;
    background-color: #fff;
    box-shadow: 0 2px 10px #e8e8e8;
    box-sizing: border-box;
    transition: background-color 200ms linear;
    &.visited {
      background-color: #e8e8e8;
    }
    &.is-reply {
      margin: 0;
      padding: 0;
      background-color: transparent;
      box-shadow: none;
      .comment {
        padding-left: 0;
      }
    }
    // 图片、应用名称
    .app-info {
      display: flex;
      align-items: center;
      margin-bottom: .1rem;
      // 图片
      .app-img {
        width: .24rem;
        height: .24rem;
        border-radius: .06rem;
      }
      // 应用名称
      .app-name {
        font-size: .14rem;
        margin-left: .06rem;
      }
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header-left {
      display: flex;
      align-items: center;
    }
    .header-right {
      font-size: .12rem;
      color: #757575;
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
      max-width: .8rem;
      color: #111;
      font-weight: bold;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    /* 时间 */
    .time {
      color: #757575;
      font-size: .14rem;
    }

    /* 评论内容 */
    .comment {
      padding-left: $avatarSize + .1rem;
      color: #454545;
      word-wrap: break-word;
      /deep/ .img-emotion {
        display: inline-block;
        width: 24px;
        height: 24px;
        vertical-align: top;
        background: url(https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/default218877.gif);
      }
      /deep/ .img-emotion + .img-emotion {
        margin-left: .04rem;
      }
    }

    /* 回复内容 */
    .comment-reply {
      padding-left: $avatarSize + .1rem;
      .comment-item {
        padding: .1rem 0;
      }
    }

    /* 上传的图片 */
    .comment-image {
      padding-left: $avatarSize + .1rem;
      .comment-image-item {
        margin-right: .1rem;
        width: .6rem;
        height: .6rem;
      }
    }
  }

  /* 放大的图片 */
  .scale-image-mask {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 11;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .8);
    .scale-image {
      position: absolute;
      top: 50%;
      width: 100%;
      padding-top: 100%;
      transform: translateY(-50%);
      background-repeat: no-repeat;
      background-size: 100% 100%;
    }
  }
</style>
