<template>
  <div class="other_comment">
    <div class="title" @click="popupShow = true">
      <span>评论</span>
      <span class="more"  @click="popupShow = true" v-show="commentList.length">查看更多</span>
    </div>
    <div class="no_data" v-if="!commentList.length">暂无评论</div>
    <div class="comment_list" v-else>
      <div class="each_comment" v-for="(item,index) in commentList" :key="index" v-if="index<5">
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
            <div class="handler">
              <span class="iconfont icon-huifu"></span>
              <span>
                <span class="iconfont icon-L2 praise"></span>{{item.praiseNum}}
              </span>
            </div>
          </div>
          <div class="comment" v-html="item.content">            
          </div>
        </div>
      </div>
    </div>
    <!--评论列表-->
    <div v-transfer-dom>
      <popup v-model="popupShow" position="bottom" height="100%">
        <r-scroll class="full-flow-container" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !commentList.length" @on-pulling-up="onPullingUp"
                   ref="bScroll">
          <div class="change_list">
            <div class="title vux-1px-b">
              评论
            </div>
            <div class="each_comment" v-for="(item,index) in commentList" :key="index">
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
                  <div class="handler">
                    <span class="iconfont icon-huifu"></span>
                    <span>
                      <span class="iconfont icon-L2 praise"></span>{{item.praiseNum}}
                    </span>
                  </div>
                </div>
                <div class="comment" v-html="changeImgPath(item)"></div>
              </div>
            </div>
          </div>
        </r-scroll>
         <div class="btn when_less vux-1px-t">
          <span class="cfm_btn" @click="closePop">关闭</span>
        </div>
      </popup>
    </div>
    
  </div>
  
</template>

<script>
// vux插件引入
import {TransferDom, Popup, Group, Icon, XButton,dateFormat} from 'vux'
import RScroll from 'components/RScroll'
//请求 引入
import {getPCCommentList} from 'service/appSettingService.js'
export default {
  name:'ChangeLog',
  data(){
    return {
      latestLog : {},
      commentList : [],
      listId : 'a4897429-f4f2-44a4-ade7-2fe8dc67c3cf',
      popupShow : false,
      page : 1,
      limit : 10,
      hasNext: true,
      scrollOptions: {
        click: true,
        pullUpLoad: true,
      },
      
    }
  },
  directives: {
    TransferDom
  },
  components: {
    Popup,
    Group,
    Icon,
    XButton,
    RScroll,
  },
  watch: {
    popupShow: {
      handler(bool) {
        if (bool) {
          this.$nextTick(() => {
            if (this.$refs.bScroll) {
              this.$refs.bScroll.refresh();
            }
          });
        }
      }
    }
  },
  filters:{
    handleCrt(val){
      let d1 = val.replace(/\-/g, "/"),
      date1 = new Date(d1),
      date2 = new Date(),
      date = date2 - date1,
      //计算出小时数
      hours = parseInt( date / (3600) ),
      //计算相差分钟数
      leave2 = date - ( hours * 3600 ) ,       //计算小时数后剩余的毫秒数
      minutes = Math.floor( leave2 / (60) ),
      //计算相差秒数
      leave3 = leave2 - ( minutes * 60 ) ,     //计算分钟数后剩余的毫秒数
      seconds = Math.round(leave3),
      backTime;
      if(hours > 0){
        backTime = `${hours}小时前`;
      }
      else{
        backTime = minutes === 0 ? '1分钟前' :`${minutes}分钟前`;
      }
      return hours < 24 ? backTime : `${val.split(' ')[0]}`;

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
        limit: this.limit,
        page: this.page,
        total: (this.page-1)*76
      }).then(({dataCount = 0, tableContent = []}) =>{
        if(this.page === 1){
          this.latestLog = tableContent[0];
        }
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        this.commentList = this.page === 1 ? tableContent : [...this.commentList, ...tableContent];
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        })
      })
    },
    // TODO 上拉加载
    onPullingUp() {
      this.page++;
      this.getCommetList();
    },
    closePop(){
      this.popupShow = false;
    },
    // TODO 替换表情图片地址
    changeImgPath(item) {
      let newContent= item.content.replace(/src="resources/g, 'src="/dist/resources');
      item.content = newContent;
      return newContent;
    },

  },
  created(){
    let { listId } = this.$route.params;
    if(listId){
      // this.$loading.show();
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
          display: flex;
          align-items: center;
          .icon-huifu{
            margin-right: 0.1rem;
          }
          .icon-L2{
            margin-right: 0.05rem;
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
  //管理员自评
  .other_comment{
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
    .no_data{
      font-size: 0.12rem;
      color: #757575;
      // padding: 0.1rem 0;
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
</style>
