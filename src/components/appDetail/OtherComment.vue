<template>
  <div class="other_comment vux-1px-t">
    <div class="title">
      <span>评论</span>
      <span class="more"  @click="goCommentList" v-show="commentList.length">查看更多</span>
    </div>
    <div class="no_data" v-if="!commentList.length">暂无评论</div>
    <div class="comment_list" v-else>
      <div class="each_comment" v-for="(item,index) in commentList" :key="index" v-if="index<5" @click="goCommentList">
        <!--用户头像-->
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
          <div class="comment" v-html="changeImgPath(item)">            
          </div>
        </div>
      </div>
    </div>
    
  </div>
  
</template>

<script>
//请求 引入
import {getPCCommentList} from 'service/appSettingService.js'
import {savePraise} from 'service/commentService'
import { setTimeout } from 'timers';
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
      let url = require('assets/ava03.png');
      if(item){
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
      }).then(({dataCount = 0, tableContent = []}) =>{
        tableContent.forEach(item=>{
          if(item.praises.length){
            item.isPraise = false;
            return
          }
          item.isPraise = true;
          
        })
        this.commentList = tableContent;
      })
    },
    // TODO 替换表情图片地址
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
    // TODO 点赞
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
    }

  },
  created(){
    let { listId } = this.$route.params;
    if(listId){
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
      .comment{
        height: calc( 100% - 0.22rem);
        box-sizing: border-box;
        overflow: hidden;
        padding: 0.03rem 0 0.1rem 0;
        font-size: 0.14rem;
        span{
          display: block;
        }
        .achievement,.chance{
          padding-left: 0.05rem;
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
    //撰写评论
    .edit_comment{
      margin-top:0.05rem;
      color: #3c7bcb;
      font-size: 0.14rem;
      display: flex;
      align-items: center;
      .iconfont{
        font-size: 0.14rem;
        margin-right: 0.03rem;
      }
    }
  }
  .vux-popup-dialog {
    background: #fff;
    height: 100%;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    .full-flow-container {
      // height: 100%;
      height: calc(100% - 0.54rem);
      /deep/ .scroll-wrapper {
        overflow: visible;
        padding-bottom: .01rem;
      }
      .change_list{
        padding: 0 0.1rem;
        .title{
          padding: 0.05rem 0;
          color: #111;
          font-weight: bold;
          font-size: .24rem;
        }
        .each_comment{
          padding: 0.1rem 0;
        }
      }
    }
    // 确定
    .btn {
      width: 100%;
      background: #fff;
      text-align: center;
      // margin-bottom: .1rem;
      padding: 0.1rem 0;
      box-sizing: border-box;
      .cfm_btn {
        width: 2.8rem;
        color: #fff;
        height: .44rem;
        line-height: .44rem;
        text-align: center;
        background: #5077aa;
        display: inline-block;
        border-radius: .4rem;
        box-shadow: 0 2px 5px #5077aa;
      }
    }
    // 工作流数据少的时候 按钮固定在底部
    .when_less {
      left: 0;
      bottom: 0;
      position: fixed;
    }
  }
  /* 评论框 */
  .send-container {
    padding: .08rem .1rem;
    height: .5rem;
    background-color: #f3f1f2;
    font-size: 0;
    box-sizing: border-box;
    &.focus {
      position: relative;
      top: -.5rem;
      padding-bottom: .3rem;
      height: 1rem;
    }
    .comment-value {
      padding: .05rem .1rem;
      width: calc(100% - .6rem);
      height: 100%;
      outline: none;
      border-radius: 0.05rem;
      border: none;
      color: #2d2d2d;
      font-size: .16rem;
      resize: none;
      box-sizing: border-box;
      -webkit-appearance: none;
      appearance: none;
    }
    /* 发送按钮 */
    .btn-send {
      display: inline-block;
      margin-left: .1rem;
      width: .5rem;
      line-height: .34rem;
      border-radius: .03rem;
      background-color: #5077aa;
      color: #fff;
      text-align: center;
      vertical-align: top;
      font-size: .16rem;
    }
  }
</style>
