<template>
  <div class="pages app_detail">
    <div class='content'>
      <r-scroll class="list_wrapper" :options="scrollOptions" ref="bScroll">
        <div class="app_top vux-1px-b">
          <div class="app_icon">
            <img :src="appInfo.icon" @error="getDefaultIcon(appInfo)"/>
          </div>
          <div class="app_info">
            <div class="app_name">{{appInfo.title}}</div>
            <div class="base_style app_type">{{appInfo.TRANS_NAME}}</div>
            <div class="base_style app_admin" v-show="appInfo.administrator">应用管理员：{{appInfo.administrator}}</div>
            <div class="base_style crt_time" v-show="appInfo.crtTime">创建时间：{{appInfo.crtTime}}</div>
          </div>
        </div>
        <!--更新日志-->
        <change-log ref="changeLog"></change-log>
        <!--互动-->
        <div class="interaction">
          <!--管理员自评-->
          <admin-comment ref="adminComment"></admin-comment>
          <!--评论-->
          <othe-comment ref="comment"></othe-comment>
        </div>
      </r-scroll>
    </div>
    <router-view></router-view>   
  </div>
  
</template>

<script>
// vux插件引入
import {dateFormat} from 'vux'
//请求 引入
import {getAppDetail} from 'service/appSettingService.js'
//组件引入
import RScroll from 'components/RScroll'
import ChangeLog from 'components/appDetail/ChangeLog'
import AdminComment from 'components/appDetail/AdminComment'
import OtheComment from 'components/appDetail/OtherComment'
export default {
  data(){
    return {
      scrollOptions: {
        click: true,
        // pullDownRefresh: true,
        // pullUpLoad: true,
      },
      listId : 'a4897429-f4f2-44a4-ade7-2fe8dc67c3cf',
      appInfo:{},//应用信息
      LatestchangeLog: {},
      adminCommentList : [],
      commentList : [],
      mySwiper : null,

    }
  },
  components:{
    RScroll,ChangeLog,AdminComment,OtheComment
  },
  filters:{
    handerTime(val){
      let time  = dateFormat(val,'YYYY-MM-DD');
      return time

    },
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
  watch: {
    $route: {
      handler(to, from) {
        let {meta = {}} = to;
        if (to.name === 'APPDETAIL') {
          // 判断是否重新请求页面
          if (meta.reload) {
            this.$loading.show();
            to.meta.reload = false;
            this.getAppInfo();
            this.$refs.changeLog.getChangeList();
            this.$refs.adminComment.getAdminComment();
            this.$refs.comment.getCommetList();
            this.$loading.hide();
          }
        }
      },
    }
  },
  methods:{
    // 设置默认图片
    getDefaultIcon(app){
      let url = require('assets/defaultApp.png');
      if(app){
        app.icon = url;
      }
      return url;
    },
    //获取应用信息
    getAppInfo(){
      return getAppDetail(this.listId).then(data =>{
        this.appInfo = data[0];
        this.appInfo.icon = this.appInfo.icon ?`/dist/${this.appInfo.icon}`: '';
        this.appInfo.crtTime = dateFormat(this.appInfo.crtTime, 'YYYY-MM-DD');
        this.appInfo.modTime = dateFormat(this.appInfo.modTime, 'YYYY-MM-DD')
      })
    },
  },
  created(){
    let { listId } = this.$route.params;
    if(listId){
      this.$loading.show();
      this.listId = listId;
      this.getAppInfo();
      setTimeout(()=>{
        this.$loading.hide();
      },500)
    }
  },
  

}
</script>

<style lang='scss' scoped>
  .childPage {
    position: fixed;
    width: 100%;
    height: 100%;
    bottom:0;
    z-index: 5;
    background: #fff;
  }
  .vux-1px-b:after{
    border-color: #e8e8e8;
  }
  .app_detail{
    .content{
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow: hidden;
      .list_wrapper{
        height: 100%;
      }
      //应用基本嘻嘻
      .app_top{
        width: 90%;
        margin: 0 auto;
        box-sizing: border-box;
        color: #111;
        background: #fff;
        display: flex;
        padding: 0.1rem 0;
        border-radius: .04rem;
        box-sizing: border-box;
        .app_icon{
          width: 0.8rem;
          height: 0.8rem;
          img{
            width:100%;
            height: 100%;
            border-radius: 0.15rem;
          }
        }
        .app_info{
          margin-left: 0.1rem;
          flex: 1;
          .app_name{
            font-size: 0.18rem;
            font-weight: bold;
          }
          .base_style{
            font-size: 0.12rem;
            color: #757575;
          }
        }
      }
    }
  }

</style>
