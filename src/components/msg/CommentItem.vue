<template>
  <div class="comment-item" :class="{'visited': item.visited}">
    <div class="comment-left">
      <!-- 头像 -->
      <img :src="item.photo || require('assets/ava01.png')" @error="getDefaultImg" class="avatar">
    </div>
    <div class="comment-right" :class="{'vux-1px-b': !noBorder}">
      <!-- 评论/点赞者名称 -->
      <div class="creator-name">{{item.creatorName}}</div>
      <!-- 时间 -->
      <div class="time">{{item.crtTime | filterTime}}</div>
      <div class="comment" v-html="handleComment()"></div>
      <!-- 附件 -->
      <div class="comment-attachments" v-if="item.attachment && item.attachment.length">
        <img class="comment_image_item" :src="img.attachment" v-for="(img, iIndex) in item.attachment"
             @click.stop="scaleImg(img)" :key="iIndex" v-if="img.isImg"/>
        <div class="each_file" v-for="(file, index) in item.attachment" :key="index" v-if="!file.isImg"
             @click.stop="checkFile(file.attachment)">附件{{index + 1}}: {{file.name}}
        </div>
      </div>
      <!-- 实例创建者信息 -->
      <div class="belong-container" :class="{'has-reply': item.reply}">
        <div class="reply-part" v-if="item.reply" v-html="handleComment('reply')"></div>
        <div class="belong-part">
          <div class="app_img">
            <img class="app_img" :src='item.pic' alt="appImg" @error="getDefaultIcon(item)">
          </div>
          <div class="other_info">
            <p class="app-name">{{item.listName}}</p>
            <p class="app_status_info">{{item.other}}</p>
          </div>
        </div>
      </div>
      <div class="praise-count-container" v-if="item.type === 'praise' && item.praiseUserList">
        <div class="praise-left">
          <!--<img class="avatar" :src="praiser.photo" @error="getDefaultImg"
               v-for="(praiser, index) in item.praiseUserList" v-if="index < 4">-->
          <r-popover v-for="(praiser, index) in item.praiseUserList" :key="index" ref="popover" @click.native.stop=""
                     @on-click="onPopoverClick" v-if="index < 4">
            <img class="avatar" :src="praiser.photo" @error="getDefaultImg">
            <div class="praise-user" slot="content">{{praiser.nickname}}</div>
          </r-popover>
        </div>
        <div class="praise-right">
          <span>共{{item.praiseUserList.length}}人点赞这个动态</span>
          <!--<x-icon type="ios-arrow-right" size="12"></x-icon>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import emotion from '@/home/pages/maps/emotion'
  import {dateFormat} from 'vux'
  import RPopover from 'components/comment/RPopover'

  export default {
    name: "CommentItem",
    props: {
      item: {
        type: Object,
        default() {
          return {}
        }
      },
      // 是否展示底部边框
      noBorder: {
        type: Boolean,
        default: false
      },
    },
    watch: {
      item: {
        handler() {
          // 校验消息当中图片的后缀名
          this.checkImgSuffix();
        },
        immediate: true
      }
    },
    components: {
      RPopover,
    },
    data() {
      return {
        attachmentImgs: [], // 预览图片数组
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
      // 获取预览图片链接
      getImgUrl(item) {
        return `${location.origin}${item.attachment}`
      },
      // 放大图片
      scaleImg(img) {
        let imgUrl = this.getImgUrl(img);
        wx.previewImage({
          current: imgUrl, // 当前显示图片的http链接
          urls: this.attachmentImgs // 需要预览的图片http链接列表
        });
      },
      // 校验图片后缀名
      checkImgSuffix() {
        let suffixList = [
          'jpg', 'jpeg', 'png', 'gif', 'bmp',
          'tif', 'pcx', 'tga', 'exif',
          'fpx', 'svg', 'psd', 'cdr',
          'pcd', 'dxf', 'ufo', 'eps',
          'ai', 'raw', 'WMF', 'webp'
        ];
        let attachmentImgs = [];
        if (this.item.attachment) {
          for (let val of this.item.attachment) {
            // 获取后缀名
            let index = val.name.lastIndexOf('.'),
              Imgsuffix = val.name.substr(index + 1);
            // 校验后缀名
            if (suffixList.includes(Imgsuffix)) {
              val.isImg = true;
              attachmentImgs.push(this.getImgUrl(val));
            }
          }
          this.attachmentImgs = attachmentImgs;
        }
      },
      // 查看附件
      checkFile(file) {
        window.location.href = `${location.origin}${file}`
      },
      // 替换表情图片地址
      handleComment(commentType = 'comment') {
        let {type = '', reply = {}, content = '', noticeSource = ''} = this.item;
        let emotionList = [...emotion];
        let comment = '';
        let reg = /\[(.+?)\]/g;
        if (commentType === 'reply') {
          comment = reply.comment;
        }
        else {
          comment = this.item.comment;
        }
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
      // popover点击事件
      onPopoverClick() {
        this.$emit('on-popover-click');
      },
      // 隐藏popover
      hidePopover() {
        let $popover = this.$refs.popover || [];
        $popover.forEach(pop => {
          pop.hidePopover();
        })
      },
    },
    filters: {
      // 处理时间
      filterTime(val) {
        if (!val) {
          return
        }
        if (typeof val === 'string') {
          val = val.replace(/-/g, '/').replace(/\..*/g, '');
        }
        let now = Date.now();
        const dayTime = 24 * 3600 * 1000;
        let prefix = dateFormat(val, 'YYYY-MM-DD');
        let date = +new Date(val);
        let calc = now - date;
        if (calc < dayTime) {
          prefix = '今天'
        } else if (calc < 2 * dayTime) {
          prefix = '昨天'
        }
        return `${prefix} ${dateFormat(val, 'HH:mm:ss')}`;
      },
    },
    created() {
    }
  }
</script>

<style scoped lang="scss">
  /* 单条评论项 */
  .comment-item {
    $avatarSize: .4rem;
    display: flex;
    padding: .15rem .15rem 0;
    width: 100%;
    box-sizing: border-box;
    background-color: #fff;
    transition: background-color 200ms linear;
    &.visited {
      $bgVisited: #e8e8e8;
      background-color: $bgVisited;
      .comment-right {
        .belong-container {
          background-color: $bgVisited;
        }
      }
    }
    .comment-left {
      width: $avatarSize + .1rem;
      .avatar {
        width: $avatarSize;
        height: $avatarSize;
        border-radius: 50%;
      }
    }
    .vux-1px-b:after {
      border-color: #ECEDEC;
    }
    .comment-right {
      padding-bottom: .15rem;
      width: calc(100% - .5rem);
      /* 创建者 */
      .creator-name {
        line-height: .14rem;
        color: #696969;
        font-size: .14rem;
      }
      /* 创建时间 */
      .time {
        margin-top: .05rem;
        line-height: .12rem;
        color: #ccc;
        font-size: .12rem;
      }
      /* 评论内容 */
      .comment {
        margin-top: .15rem;
        line-height: .22rem;
        color: #333;
        word-break: break-all;
        /* PC端表情 */
        /deep/ img {
          display: inline-block;
          vertical-align: middle;
        }
        /* 移动端表情 */
        /deep/ .img-emotion {
          width: 24px;
          height: 24px;
          vertical-align: top;
          display: inline-block;
          background: url(https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/default218877.gif);
          & + .img-emotion {
            margin-left: .04rem;
          }
        }
      }
      /* 附件 */
      .comment-attachments {
        display: flex;
        flex-wrap: wrap;
        margin-top: .1rem;
        /* 图片 */
        .comment_image_item {
          width: .6rem;
          height: .6rem;
          margin-right: .1rem;
          border-radius: 2px;
        }
        .each_file {
          color: #5893d4;
        }
      }
      /* 实例内容 */
      .belong-container {
        margin-top: .15rem;
        padding: .1rem;
        width: 100%;
        background-color: #F7F7F7;
        color: #333;
        box-sizing: border-box;
        &.has-reply {
          .belong-part {
          }
        }
        .reply-part {
          margin-bottom: .15rem;
          line-height: .22rem;
          word-break: break-all;
        }
        .belong-part {
          display: flex;
          align-items: center;
          .app_img {
            padding: .01rem;
            width: .4rem;
            height: .4rem;
            margin-right: .1rem;
            box-sizing: border-box;
            img {
              width: 100%;
              height: 100%;
              border-radius: 50%;
            }
          }
          .other_info {
            font-size: .14rem;
            .app-name {
              line-height: .14rem;
            }
            .app_status_info {
              margin-top: .05rem;
              line-height: .12rem;
              color: #979797;
              font-size: .12rem;
            }
          }
        }
      }
      /* 点赞者 */
      .praise-count-container {
        display: flex;
        justify-content: space-between;
        margin-top: .15rem;
        .praise-left {
          display: flex;
          .r-popover-container {
            & + .r-popover-container {
              margin-left: .1rem;
            }
          }
          .praise-user {
            white-space: nowrap;
          }
          .avatar {
            width: .2rem;
            height: .2rem;
            border-radius: 50%;
          }
        }
        .praise-right {
          display: flex;
          align-items: center;
          color: #999;
          font-size: .12rem;
          .vux-x-icon-ios-arrow-right {
            fill: #999;
          }
        }
      }
    }
  }
</style>
