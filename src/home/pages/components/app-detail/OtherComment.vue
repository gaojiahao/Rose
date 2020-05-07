<template>
  <div class="other_comment vux-1px-t">
    <div class="title">
      <span>评论</span>
      <span class="more"  @click="goCommentList">发表评论</span>
    </div>
    <div class="no_data" v-if="!commentList.length">暂无评论</div>
    <div class="comment_list" v-else>
      <div class="each_comment" v-for="(item, index) in commentList" :key="index" @click="goCommentList">
        <template v-if="index < 5">
          <div class="user_photo">
            <img :src="item.photo" @error="getUserDefault(item)"/>
          </div>
          <div class="comment_content vux-1px-b">
            <div class="user_info">
              <div>
                <span class="user_name">{{item.creatorName}}</span>
                <span class="comment_time">{{item.crtTime | handleCrt}}</span>
              </div>
              <!-- 点赞，回复-->
              <div class="handler" @click.stop="savePraise(item)">                           
                <span class="praise-num" v-if="item.praiseNum">{{item.praiseNum}}</span>
                <span class="iconfont icon-L2" :class="{praise: !item.isPraise}"></span>        
              </div>
            </div>
            <div class="comment-container">
              <div class="comment" v-html="handleComment(item)"></div>
              <div class="comment-image" v-if="item.commentAttachments.length">
                <img class="comment-image-item" :src="img.attachment" v-for="(img, iIndex) in item.commentAttachments"
                    @click.stop="scaleImg(img)" :key="iIndex" v-show="img.isImg"/>
                <div class="each_file" v-for="(file, index) in item.commentAttachments" :key="index" v-show="!file.isImg"
                @click.stop="checkFile(file.attachment)">附件{{index + 1}}: {{file.name}}</div>
              </div> 
            </div>
          </div>
        </template>
      </div>
    </div>
    
  </div>
  
</template>

<script>
//请求 引入
import {getPCCommentList} from 'service/app-basic/appSettingService'
import {savePraise} from 'service/commentService'
import emotion from 'plugins/emoji/emotion'
  /* 引入微信相关 */
import {register} from 'plugins/wx'
export default {
  name:'ChangeLog',
  data(){
    return {
      commentList : [],
      listId : 'a4897429-f4f2-44a4-ade7-2fe8dc67c3cf',
      
    }
  },
  filters:{
    handleCrt(val){
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
  methods:{
    getUserDefault(item){
      let url = require('assets/ava01.png');
      if (item){
        item.photo = url;
      }
      return url;
    },
    //获取更新日志日志列表
    getCommetList(){
      return getPCCommentList({
        relationKey: this.listId,
        limit: 10,
        page: 1,
        total: 0
      }).then(({dataCount = 0, tableContent = []}) => {
        tableContent.forEach(item=> {
          this.checkImgSuffix(item)
          if (item.praises.length){
            item.isPraise = false;
            return
          }
          item.isPraise = true;
          
        })
        this.commentList = tableContent;
      })
    },
    // 替换表情图片地址
    changeImgPath(item) {
      let newContent= item.content.replace(/src="resources/g, 'src="/dist/resources');
      item.content = newContent;
      return newContent;
    },
    goCommentList(){
      this.$router.push({
        path: '/commentList',
        query: {
          listId : this.listId
        }
        
      })
    },
    // 点赞
    savePraise(item) {
      // 已点过赞，不允许点击
      if (!item.isPraise) {
        return
      }
      return savePraise(item.id).then((success = true, message) => {
        if (success) {
          item.isPraise = false;
          item.praiseNum++;
        }
      });
    },
    // 校验图片后缀名
    checkImgSuffix(item) {
      let suffixList = [
        'jpg', 'jpeg', 'png', 'gif', 'bmp',
        'tif', 'pcx', 'tga', 'exif',
        'fpx','svg','psd','cdr', 
        'pcd','dxf','ufo','eps', 
        'ai','raw','WMF','webp'
      ]
      for (let val of item.commentAttachments) {
        // 获取后缀名
        let index = val.name.lastIndexOf('.'),
            Imgsuffix = val.name.substr(index + 1);
        // 校验后缀名
        if (suffixList.includes(Imgsuffix)) {
          val.isImg = true;
        }
      }
    },
    // 替换表情图片地址
    handleComment(item) {
      // let {CONTENT: content = '', type = '', noticeSource = ''} = this.item;
      let emotionList = [...emotion];
      let comment = item.content;
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
    // 放大图片
    scaleImg(img) {
      console.log('img:', img);
      let imgUrl = `${location.origin}${img.attachment}`;
      wx.previewImage({
        current: imgUrl, // 当前显示图片的http链接
        urls: [imgUrl] // 需要预览的图片http链接列表
      });
    },
    // 查看附件
    checkFile(file) {
      window.location.href = `${location.origin}${file}`
    },

  },
  created(){
    register();
    let { listId } = this.$route.params;
    if (listId){
      this.listId = listId;
      this.getCommetList();
    }

  },

}
</script>

<style lang='scss' scoped>
  .vux-1px-b:after,.vux-1px-t:before{
    border-color: #e8e8e8;
  }
  //每一条评论
  .each_comment{
    height: 100%;
    box-sizing: border-box;
    padding: 0.1rem;
    display: flex;
    //用户头像
    .user_photo{
      width: 0.35rem;
      height: 0.35rem;
      img{
        width:100%;
        height: 100%;
        border-radius: 50%;
      }
    }
    //评论内容
    .comment_content{
      width:100%;
      overflow: hidden;
      margin-left:0.1rem;
      flex: 1;
      .user_info{
        display: flex;
        justify-content: space-between;
        align-items: center;
        .user_name{
          font-weight: bold;
        }
        .comment_time{
          font-size: 0.12rem;
          color: #757575;
          margin-left:0.05rem;
        }
        //点赞，回复
        .handler{
          .praise-num {
            margin-right: .05rem;
            font-size: .16rem;
          }
          .icon-L2 {
            &.praise {
              color: #c93d1b;
            }
          }
        }
      }
      .comment-container {
        margin-bottom: .04rem;
        .comment {
          color: #454545;
          margin-bottom: .04rem;
          word-break: break-all;
          /deep/ img {
            display: inline-block;
            vertical-align: middle;
          }
          /deep/ .img-emotion {
            width: 24px;
            height: 24px;
            vertical-align: top;
            display: inline-block;
            background: url(https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/default218877.gif);
          }
          /deep/ .img-emotion + .img-emotion {
            margin-left: .04rem;
          }
        }
        .comment-image {
          .comment-image-item {
            width: .6rem;
            height: .6rem;
            margin-right: .1rem;
            border: 1px solid #eee;
          }
          .each_file {
            color: #5893d4;
          }
        }
      }
    }
  }
  //评论
  .other_comment{
    width: 90%;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 0.1rem 0;
    .each_comment{
      padding: 0.05rem 0;
    }
    .title{
      padding-bottom: 0.1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.18rem;
      font-weight: bold;
      color: #111;
      .more{
        font-size: 0.14rem;
        font-weight: normal;
        color: #5077aa;
      }

    }
    //无数据提示
    .no_data{
      font-size: 0.12rem;
      color: #757575;
      // padding: 0.1rem 0;
    }
  }
</style>
