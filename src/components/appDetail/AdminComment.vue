<template>
  <div class="admin_comment">
    <div class="title">
      <span>管理员自评</span>
      <span class="more" @click="popupShow = true" v-show="adminCommentList.length">查看更多</span>
    </div>
    <div class="no_data" v-if="!adminCommentList.length">暂无评论</div>
    <div class="swiper-container" :class="{'no_swiper' : !adminCommentList.length}">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(item,index) in adminCommentList" :key="index" v-if="index < 5">
          <div class="each_comment" >
            <div class="user_photo">
              <img :src="item.photo" @error="getUserDefault(item)"/>
            </div>
            <div class="comment_content">
              <div class="user_info">
                <span class="user_name">{{item.creator}}</span>
                <span class="comment_time">{{item.crtTime | handerTime}}</span>
              </div>
              <div class="comment">
                <div>
                  <span>改进结果:</span>
                  <span v-html="item.achievement" class="achievement"></span>
                </div>
                <div>
                  <span>改进机会:</span>
                  <span v-html="item.chance" class="chance"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="edit_comment" @click="EditAdmin" v-if="handle">
      <span class="iconfont icon-bianji"></span>
      <span>撰写评论</span>
    </div>
    <!--管理员评论列表-->
    <div v-transfer-dom>
      <popup v-model="popupShow" position="bottom" height="100%">
        <r-scroll class="full-flow-container" :options="scrollOptions" :has-next="hasNext"
                  :no-data="!hasNext && !adminCommentList.length" @on-pulling-up="onPullingUp"
                   ref="bScroll">
          <div class="change_list">
            <div class="title vux-1px-b">
              管理员自评
            </div>
            <div class="each_comment vux-1px-b" v-for="(item,index) in adminCommentList" :key="index">
              <div class="user_photo">
                <img :src="item.photo" @error="getUserDefault(item)"/>
              </div>
              <div class="comment_content">
                <div class="user_info">
                  <span class="user_name">{{item.creator}}</span>
                  <span class="comment_time">{{item.crtTime | handerTime}}</span>
                </div>
                <div class="comment">
                  <div>
                    <span>改进结果:</span>
                    <span v-html="item.achievement" class="achievement"></span>
                  </div>
                  <div>
                    <span>改进机会:</span>
                    <span v-html="item.chance" class="chance"></span>
                  </div>
                </div>
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
import {getAdminCommentList} from 'service/appSettingService.js'
export default {
  name:'ChangeLog',
  props:{
    handle: { //是否显示撰写
      type: Boolean,
      default : false
    }
  },
  data(){
    return {
      adminCommentList : [],
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
    handerTime(val){
      let time  = dateFormat(val,'YYYY-MM');
      return time
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
    getAdminComment(){
      return getAdminCommentList({
        listId: this.listId,
        limit: this.limit,
        page: this.page,
        sort : JSON.stringify([{property: 'crtTime',direction: 'DESC'}])
      }).then(({dataCount = 0, tableContent = []}) =>{
        this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
        this.adminCommentList = this.page === 1 ? tableContent : [...this.adminCommentList, ...tableContent];
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        })
      })
    },
    // TODO 上拉加载
    onPullingUp() {
      this.page++;
      this.getAdminComment();
    },
    closePop(){
      this.popupShow = false;
    },
    EditAdmin(){
      this.$router.push({
        path:`/appDetail/${this.listId}/addAdminComment`,
      })
    }

  },
  created(){
    let { listId } = this.$route.params;
    if(listId){
      // this.$loading.show();
      this.listId = listId;
      this.getAdminComment();
    }

  },
  mounted(){
    let Swiper = this.Swiper;
    this.mySwiper = new Swiper ('.swiper-container', {
      slidesPerView: 'auto',
      observer: true,       //修改swiper自己或子元素时，自动初始化swiper
      observeParents: true,
      centeredSlides: true,      
    })      

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
      flex: 1;
      margin-left:0.1rem;
      overflow: hidden;
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
      }
      .comment{
        height: calc( 100% - 0.22rem);
        box-sizing: border-box;
        overflow: hidden;
        padding: 0.03rem 0 0rem 0;
        font-size: 0.14rem;
      }

    }
  }
  //管理员自评
  .admin_comment{
    padding: 0.1rem 0;
    .title{
      width: 90%;
      margin: 0 auto 0.04rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.18rem;
      font-weight: bold;
      color: #111;
      .more{
        font-size: 0.14rem;
        font-weight: normal;
        color: #3c7bcb;
      }

    }
    //无数据提示
    .no_data{
      width: 90%;
      box-sizing: border-box;
      margin: 0 auto;
      font-size: 0.12rem;
      color: #757575;
      padding: 0.05rem 0;
    }
    //撰写评论
    .edit_comment{
      width: 90%;
      margin : 0.05rem auto 0;
      color: #3c7bcb;
      font-size: 0.14rem;
      display: flex;
      align-items: center;
      .iconfont{
        font-size: 0.14rem;
        margin-right: 0.03rem;
      }
    }
    .swiper-container{
      width: 100%;
      height: 1.8rem;
      .swiper-slide{
        width: 90%;
        margin: 0 5px;
        background: #f0f1f5;
        border-radius: 0.1rem;  
      }
      &.no_swiper{
        width: 0;
        height: 0;
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
      height: calc(100% - 0.62rem);
      margin-bottom: .1rem;
      /deep/ .scroll-wrapper {
        overflow: visible;
        
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
