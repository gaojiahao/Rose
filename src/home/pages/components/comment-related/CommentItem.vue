<template>
  <div class="comment-item" @click.stop="reply">
    <div class="comment-left">
      <!-- 头像 -->
      <img :src="item.photo || require('assets/ava01.png')" @error="getDefaultImg" class="avatar">
    </div>
    <div class="comment-right" :class="{'vux-1px-b': !noBorder}">
      <div class="comment-header">
        <div class="header_left">
          <!-- 评论/点赞者名称 -->
          <div class="creator-name">{{item.creatorName}}</div>
          <!-- 时间 -->
          <div class="time">{{item.CRT_TIME | filterTime}}</div>
        </div>
        <div class="header_right" @click.stop="savePraise">
          <!--  isPraise: 是否能点赞 -->
          <span class="praise_num" v-if="item.praiseNum">{{item.praiseNum}}</span>
          <i class="icon" :class="[!item.isPraise ? 'icon-praise-fill' : 'icon-praise']"></i>
        </div>
      </div>
      <!-- 评论内容 -->
      <div class="comment" v-html="handleComment()"></div>
      <!-- 附件 -->
      <div class="comment-attachments" v-if="item.commentAttachments && item.commentAttachments.length">
        <img class="comment_image_item" :src="img.ATTACHMENT" v-for="(img, iIndex) in item.commentAttachments"
             @click.stop="scaleImg(img)" :key="iIndex" v-if="img.isImg"/>
        <div class="each_file" v-for="(file, index) in item.commentAttachments" :key="index" v-if="!file.isImg"
             @click.stop="checkFile(file.ATTACHMENT)">附件{{index + 1}}: {{file.name}}
        </div>
      </div>
      <div class="comment-reply" v-if="this.$slots.reply">
        <slot name="reply"></slot>
      </div>
    </div>
  </div>
</template>

<script>
  import {savePraise} from 'service/commentService'
  import emotion from 'plugins/emoji/emotion'
  import {WechatEmotion as Emotion, dateFormat} from 'vux'

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
    components: {
      Emotion,
    },
    data() {
      return {
        attachmentImgs: [], // 预览图片数组
      }
    },
    methods: {
      // 获取默认用户图片
      getDefaultImg(e) {
        e.target.src = require('assets/ava01.png');
      },
      // 抛出回复事件
      reply() {
        this.$emit('on-reply', this.item);
      },
      // 点赞
      savePraise() {
        // 已点过赞，不允许点击
        if (!this.item.isPraise) {
          return
        }
        return savePraise(this.item.ID).then((success = true, message) => {
          if (success) {
            this.$emit('on-praise-success', this.item);
          }
        });
      },
      // 获取预览图片链接
      getImgUrl(item) {
        return `${location.origin}${item.ATTACHMENT}`
      },
      // 放大图片
      scaleImg(img) {
        let imgUrl = this.getImgUrl(img);
        wx.previewImage({
          current: imgUrl, // 当前显示图片的http链接
          urls: this.attachmentImgs // 需要预览的图片http链接列表
        });
      },
      // 替换表情图片地址
      handleComment() {
        let emotionList = [...emotion];
        let comment = this.item.CONTENT;
        let reg = /\[(.+?)\]/g;
        // 处理PC的表情图片
        comment = comment.replace(/src="resources/g, 'src="/dist/resources');
        // 处理移动端的表情图片
        comment = comment.replace(/\[[\u4E00-\u9FA5]{1,3}\]/gi, (word) =>{
            var newWord = word.replace(/\[|\]/gi,'');
            var index = emotionList.indexOf(newWord);
            var backgroundPositionX = -index * 24
            var imgHTML = '';
            if(index<0){
                return word;
            }
            var path = index>104 ? '/img' : 'https://res.wx.qq.com/mpres/htmledition/images/icon';
            imgHTML = `<img class="static-emotion-gif" style="vertical-align: middle" src="${path}/emotion/${index}.gif">`
            return imgHTML;
        });
        return comment;
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
        if (this.item.commentAttachments) {
          for (let val of this.item.commentAttachments) {
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
      }
    },
    created() {
      this.checkImgSuffix()
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
      margin-top: .05rem;
      padding-bottom: .15rem;
      width: calc(100% - .5rem);
      /* 顶部评论者信息 */
      .comment-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .comment{
        /deep/ img{
          max-height: 80px;
        }
      }
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
      .header_right {
        display: flex;
        align-items: center;
        line-height: .14rem;
        padding: 0 0 .1rem .1rem;
      }
      /* 点赞数量 */
      .praise_num {
        margin-right: .05rem;
        line-height: .12rem;
        color: #696969;
        font-size: .12rem;
      }
      .icon {
        display: inline-block;
        width: .14rem;
        height: .15rem;
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

      /* 回复 */
      .comment-reply {
        margin-top: .15rem;
        .comment-item {
          padding: .1rem;
          background-color: #f7f7f7;
        }
        .comment-right {
          padding-bottom: 0;
        }
      }
    }
  }
</style>
