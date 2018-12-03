<template>
  <div class="comment-item" :class="{visited: item.visited, 'is-reply': isReply}">
    <!-- 图片 和 应用名称 -->
    <div class="top-info-part">
      <div class="header-part" v-if="!noHeader">
        <div class="avatar-part">
          <img class="avatar" :src="item.photo || require('assets/ava01.png')" @error="getDefaultImg">
        </div>
        <div class="main-container">
          <span class="creator_name">{{item.creatorName}}</span>
          <span class="time">{{item.crtTime}}</span>
        </div>
        <!-- <div class="header-right">{{item.other}}</div> -->
      </div>
      <div class="comment-container">
        <div class="comment" v-html="handleComment()"></div>
        <div class="comment-image" v-if="item.attachment">
          <img class="comment-image-item" :src="img.attachment" v-for="(img, iIndex) in item.attachment"
              @click.stop="scaleImg(img)" :key="iIndex" v-if="img.isImg"/>
          <div v-for="(file, index) in item.attachment" :key="index" v-if="!file.isImg"
          @click.stop="checkFile(file.attachment)">{{file.name}}</div>
        </div> 
      </div>
    </div>
    <div class="belong-container" :class="{'has-reply': item.reply}">
      <div class="reply-part">
        {{item.reply && item.reply.comment}}
      </div>
      <div class="belong-part">
        <div class="app_img">
          <img class="app_img" :src='item.pic' alt="appImg" @error="getDefaultIcon(item)">
        </div>
        <div class="other_info">
          <p class="app_name">{{item.listName}}</p>
          <p class="app_status_info">{{item.other}}</p>
        </div>
      </div>
      <!-- <div class="app-info" v-if="!noHeader">
        <img class="app-img" :src='item.pic' alt="appImg" @error="getDefaultIcon(item)">
        <span class="app-name">{{item.listName}}</span>
      </div> -->

    </div>
    <!-- <a href="javascript:window.open('%2FH_roleplay-si%2Fds%2Fdownload%3Furl%3D%2Fb62b550f-9e6d-4b3f-a130-0c59714009db%2Fef4cf29a-6ac7-4c00-bc6f-434c2b1b8b17.xlsx')" id="ext-element-9" data-tabindex-value="none" tabindex="-1" data-tabindex-counter="1">终版10.29-11.4 折算后数据  提供给IT2018.11.5.xlsx</a> -->
    <!-- <div class="comment" v-html="handleComment()"></div>
    <div class="comment-image" v-if="item.attachment">
      <img class="comment-image-item" :src="img.attachment" v-for="(img, iIndex) in item.attachment"
           @click.stop="scaleImg(img)" :key="iIndex" v-if="img.type === 'image'"/>
    </div>
    <div class="comment-reply" v-if="this.$slots.reply">
      <slot name="reply"></slot>
    </div> -->
  </div>
</template>

<script>
  import emotion from '@/home/pages/maps/emotion'
  import {dateFormat} from 'vux'
  import Vue from 'vue'
import { decode } from 'punycode';

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
      return {
        fileUrl: ''
      }
    },
    methods: {
      // 获取应用icon
      getDefaultIcon(item) {
        let url = require('assets/defaultApp.png');
        if (item) {
          item.pic = url;
        }
        return url
      },
      // 获取默认用户图片
      getDefaultImg(e) {
        e.target.src = require('assets/ava01.png');
      },
      // 放大图片
      scaleImg(img) {
        let imgUrl = `${location.origin}${img.attachment}`;
        wx.previewImage({
          current: imgUrl, // 当前显示图片的http链接
          urls: [imgUrl] // 需要预览的图片http链接列表
        });
      },
      // 校验图片后缀名
      checkImgSuffix() {
        let suffixList = [
          'jpg', 'jpeg', 'png', 'gif', 'bmp',
          'tif', 'pcx', 'tga', 'exif',
          'fpx','svg','psd','cdr', 
          'pcd','dxf','ufo','eps', 
          'ai','raw','WMF','webp'
        ]
        for(let val of this.item.attachment) {
          // 获取后缀名
          let index = val.name.lastIndexOf('.'),
              Imgsuffix = val.name.substr(index + 1);
          // 校验后缀名
          if(suffixList.includes(Imgsuffix)) {
            val.isImg = true;
          }
        }
      },
      // 查看附件
      checkFile(file) {
        console.log('file:', file);
        // console.log(`${location.origin}${file}`);
        // this.fileUrl = `${location.origin}${file}`
        this.$router.push({
          path: '/H_roleplay-si/ds/download',
          query: {
            name: file
          }
        })
        // window.location.href = `${location.origin}${file}`
        // window.history.go(`${location.origin}${file}`)
      },
      // 替换表情图片地址
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
      // 处理时间
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
      // 校验消息当中图片的后缀名
      this.checkImgSuffix();
    }
  }
</script>

<style scoped lang="scss">
  /* 单条评论项 */
  .comment-item {
    $avatarSize: .45rem;
    width: 100%;
    margin: .1rem 0;
    padding: .1rem 0;
    box-sizing: border-box;
    background-color: #fff;
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
    .top-info-part {
      width: 100%;
      padding: 0 .1rem;
      .header-part {
        display: flex;
        align-items: center;
        margin-bottom: .04rem;
        .avatar-part {
          margin-right: .1rem;
          width: $avatarSize;
          height: $avatarSize;
          img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
          }
        }
        .main-container {
          display: flex;
          flex-direction: column;
          .creator_name {
            margin-right: .1rem;
            max-width: .8rem;
            color: #111;
            font-weight: bold;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .time {
            color: #757575;
            font-size: .14rem;
          }
        }
      }
      .comment-container {
        .comment {
          // padding-left: $avatarSize + .1rem;
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
        .comment-image {
          // padding-left: $avatarSize + .1rem;
          .comment-image-item {
            margin-right: .1rem;
            width: .6rem;
            height: .6rem;
            border-radius: .06rem;
          }
        }
      }
    }
    /* 回复内容 */
    .comment-reply {
      padding-left: $avatarSize + .1rem;
      .comment-item {
        padding: .1rem 0;
      }
    }
    .belong-container {
      width: 100%;
      padding: .1rem;
      &.has-reply {
        margin-top: .04rem;
        background: #f1f1f1;
        .belong-part {
          background: #FFF;
        }
      }
      .belong-part {
        display: flex;
        align-items: center;
        // background: #FFF;
        // padding: .1rem 0;
        background: #f1f1f1;
        .app_img {
          width: .54rem;
          height: .54rem;
          margin-right: .1rem;
          img {
            width: 100%;
            height: 100%;
          }
        }
        .other_info {
          font-size: .14rem;
          .app_name {
            font-weight: bold;
          }
          .app_status_info {
            color: #757575;
          }
        }
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
