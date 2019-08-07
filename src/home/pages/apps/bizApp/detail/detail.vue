<template>
  <div class="pages">
    <div class="detail-container" :class="{'has-comment': hasComment}" ref='detail'>
      <v-touch @swipeleft="swiperleft" @swiperight="swiperright" class="wrapper">
        <component
          :is='currentComponent'
          @change='modifyRoute'
          @refresh-scroll="refresh"
          @subscribeChange="setSubscribe"
          :showTab="showTab['comm']"
          ref="detailComponent">
        </component>
        <auto-subject :showTab="showTab['subject']"></auto-subject>
        <app-example :showTab="showTab['example']" :tabData="tabData['example']"></app-example>
      </v-touch>
    </div>
    <slideBar :showSlide="showSlide" @swiperleft="swiperleft" @goTab="goTab" :appExample="appExample" :autoSubjectCount="autoSubjectCount"></slideBar>
    <div class="detail-comment-container vux-1px-t" v-if="hasComment">
      <!-- tab -->
      <div class="concern" @click="swiperright">
        <span class="icon icon-slide-bar"></span>
        <div class="heart-desc">更多</div>
      </div>
      <!-- 关注 -->
      <div class="concern" @click="goConcern">
        <span class="icon icon-heart" v-if="isConcern === 0"></span>
        <span class="icon icon-heart-fill" v-else></span>
        <div class="heart-desc">{{ isConcern === 0 ? '关注' : '取消关注' }}</div>
      </div>
      <!-- 评论 -->
      <div class="operation" @click="goDiscuss" v-if="isDiscuss">
        <span class="icon icon-dialog"></span>
        <span class="count">{{commentCount || 0}}</span>
        <div class="dialog-desc">评论</div>
      </div>
      <!-- 日志 -->
      <div class="task" @click="goTaskLogList" v-if="isTaskLog">
        <span class="icon icon-log"></span>
        <div class="task-desc">日志</div>
      </div>
    </div>
  </div>

</template>

<script>
// 插件 引入
import Bscroll from 'better-scroll'
import {
  initWebContext
} from "service/commonService";
// 请求 引入
import { isSubscribeByRelationKey, subscribeApp, unsubscribeApp, getUserList } from 'service/commentService'
import { getAppExampleDetails,getAutoSubjectCount,getAppFeaturesData } from "service/detailService";
/* 引入微信相关 */
import {register} from 'plugins/wx'
import { constants } from 'crypto';
export default {
  data() {
    return {
      transCode: '',
      listId: '',
      currentComponent: '',
      submitSuccess: false,
      isDiscuss: false,
      isTaskLog: false,
      detailScroll: null,
      commentCount: 0,
      hasComment: true, // 是否展示底部评论栏
      isConcern : 0, // 是否关注，0 未关注，1已关注
      concernCount : 0, //关注人数
      showSlide:false,
      isShow:false,
      showTab: {
        'comm': true,
        'subject': false,
        'example': false,
      },
      tabData: {
        'example': {}
      },
      appExample: [],
      autoSubjectCount: 0,
    }
  },
  watch: {
    //路由监听,解决返回后的tab不在详情页
    $route: {
      handler: function(val, oldVal){
        this.intTab();
        if(val.name == oldVal.name) {
          if(val.query.transCode != oldVal.query.transCode) {
            this.getAppFeature();
            initWebContext().then(()=>{
                this.initPage();
            });
            this.refresh();
          }
        }
      },
      // 深度观察监听
      deep: true
    }
  },
  methods: {
    modifyRoute(val) {
      this.submitSuccess = val;
    },
    // 刷新better-scroll
    refresh(model) {
      this.$nextTick(() => {
        if(this.detailScroll != null)this.detailScroll.refresh();
      })
    },
    // 跳转到评论页面
    goDiscuss() {
      this.$router.push({
        path: '/commentList',
        query: {
          transCode: this.transCode
        }
      })
    },
    // 设置是否已经关注该订单
    setSubscribe(val){
      this.isConcern = +val;
    },
    //打开任务日志列表
    goTaskLogList() {
      this.$router.push({
        path: '/taskLog',
        query: {
          listId: this.$route.params.listId,
          transCode: this.transCode
        }
      })
    },
    // 关注或取关
    goConcern() {
      let operation = subscribeApp,
          data = {
            type: 'instance',
            relationKey: this.transCode
          };
      if (this.isConcern === 1) {
        operation = unsubscribeApp;
        delete data.type;
      }
      operation(data).then(({success = true, message = ''}) => {
        if (success) {
          this.isConcern = message === '订阅成功！' ? 1 : 0;
          let tips = message === '订阅成功！' ? '关注成功' : '取消关注成功';
          this.$vux.toast.show({
            type: 'text',
            time: 1000,
            position: 'top',
            text: tips
          })
        }
      })
    },
    // 初始化页面
    initPage(){
      let { transCode,folder,fileName,listId} = this.$route.query;
      this.hasComment = !!transCode;
      this.transCode = transCode;
      this.listId = listId;
      this.getAppFeature();
      try {
        if(!fileName || fileName == 'null'){
            this.currentComponent = require(`components/detail/CommonForm.vue`).default;
            this.getAppExampleDetails();
            this.getAutoSubjectCount();
        } else {
            this.currentComponent = require(`components/detail/${folder}/${fileName}Form.vue`).default;
        }
        // 监听详情页传回来的 ‘评论’
        this.$event.$on('commentCount', (val) => {
          this.commentCount = val;
        })
        this.$nextTick(() => {
          if (!this.detailScroll) {
            this.detailScroll = new Bscroll(this.$refs.detail, {
              click: true,
            })
          }
        })
      } catch (e) {
        console.log(e);
        this.$vux.alert.show({
          content: '抱歉，无法支持该应用的查看',
          onHide: () => {
            this.$router.go(-1);
          }
        });
      } 
    },
    //关闭侧滑菜单
    swiperleft() {
      this.showSlide = false;
    },
    //打开侧滑菜单
    swiperright() {
      this.showSlide = true;
    },
    //侧滑菜单切换tab
    goTab(val) {
      for(let item in this.showTab) {
        if(item == val.name) {
          this.showTab[item] = true;
          if(val.name=='example') {
            this.tabData[item] = val.data;
          }
        } else {
          this.showTab[item] = false;
        }
      }
    },
    //初始化tab
    intTab() {
      for(let item in this.showTab) {
        if(item == 'comm') {
          this.showTab[item] = true;
        } else {
          this.showTab[item] = false;
        }
      }  
    },
    //获取相关实例count
    getAppExampleDetails() {
      let data = {
        transCode : this.transCode,
        listId : this.listId
      };
      return getAppExampleDetails(data).then(data => {
        this.appExample = data.relevantItems;
      });  
    },
    //获取自动分录count
    getAutoSubjectCount() {
      let data = {
          trans_code: this.transCode,
      };
      return getAutoSubjectCount(data).then(data => {
          this.autoSubjectCount = data.data.count;
      });    
    },
    //获取应用特性管理数据
    getAppFeature() {
      this.isDiscuss = false;
      this.isTaskLog = false;
      getAppFeaturesData(this.$route.params.listId).then(res => {
        if(res.success){
          res.data.forEach(val => {
            if(val.status === '1'){
              if(val.title === '评论'){
                  this.isDiscuss = true;
              }
              if(val.title === '工作日志'){
                  //工作日志控件
                  if (this.$route.params.listId !=='2750a13d-295d-4776-9673-290c51bfc568') {     
                      this.isTaskLog = true;
                  }
              }
            }
          })
        }else{
          this.$vux.alert.show({
            title: "错误",
            content: res.message
          });
        }
      })
    }
  },
  created() {
    initWebContext().then(()=>{
        this.initPage();
    })
  },
  activated() {
    let reload = this.$route.meta.reload;
    if (reload) {
      this.initPage();
      this.$route.meta.reload = false;
    }
    this.refresh();
  },
  beforeRouteEnter(to, from, next) {
    let { name = '' } = to.query;
    if (name.includes('表')){
      to.meta.title = name;
      next();
    }
    to.meta.title = `${name}详情`;
    next();
  },
  beforeRouteLeave(to, from, next) {
    let goLists = ['LIST', 'MSGHOME', 'MSGLIST', 'FILLFORM'];
    let isGoList = goLists.includes(to.name);
    this.$HandleLoad.hide();
    if (isGoList) {
      this.currentComponent = null;
      // 销毁better-scroll
      if(this.detailScroll != null){
        this.detailScroll.destroy();
        this.detailScroll = null;
      }
      // 销毁监听
      this.$event.$off('commentCount');
      from.meta.reload = true;
    }
    // 新建物料，修改列表页的meta值
    if (this.submitSuccess && isGoList) {
      to.meta.reload = true;
    }
    next();
  },
}
</script>

<style lang='scss' scoped>
  .vux-1px-t:before {
    border-color: #e8e8e8;
  }
  .apply_detail {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .pages {
    background: #F8F8F8;
    .detail-container {
      height: 100%;
      overflow: hidden;
      // background: #FFF;
      &.has-comment {
        height: calc(100% - .5rem);
      }
    }
    .detail-comment-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: .5rem;
      background-color: #fafafa;
      color: #999;
      &:before {
        border-color: #d9d9d9
      }
      .icon {
        display: inline-block;
        width: .2rem;
        height: .19rem;
      }
      .icon-heart {
        width: .22rem;
        height: .2rem;
      }
      .icon-heart-fill {
        width: .2rem;
        height: .18rem;
      }
      /** 关注 */
      .concern{
        text-align: center;
        .icon-xihuan{
          color: #c93d1b;
        }
        .heart-desc{
          font-size: .1rem;
          margin-top: -.05rem;
        }
      }
      .operation {
        .dialog-desc{
          font-size: .1rem;
          margin-top: -.06rem;
        }
      }
      .count{
        font-size: .12rem;
      }
      .task{
        .task-desc{
          font-size: .1rem;
          margin-top: -.06rem;
          margin-left: -.03rem;
        }
      }
    }
  }
</style>
