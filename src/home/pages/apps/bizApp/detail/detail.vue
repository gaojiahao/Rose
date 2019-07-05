<template>
  <div class="pages">
    <div class="detail-container" :class="{'has-comment': hasComment}" ref='detail'>
      <v-touch @swipeleft="swiperleft" @swiperight="swiperright" class="wrapper" :class="{'wrapper2': isShow}">
        <component
          :is='currentComponent'
          @change='modifyRoute'
          @refresh-scroll="refresh"
          @subscribeChange="setSubscribe"
          @slideStatus="slideStatus"
          :showTab="showTab['comm']"
          ref="detailComponent">
        </component>
        <auto-subject :showTab="showTab['subject']"></auto-subject>
        <app-example :showTab="showTab['example']" :tabData="tabData['example']"></app-example>
      </v-touch>
    </div>
    <slideBar :showSlide="showSlide" @swiperleft="swiperleft" @goTab="goTab" :appExample="appExample" :autoSubjectCount="autoSubjectCount"></slideBar>
    <div class="detail-comment-container vux-1px-t" v-if="hasComment">
      <div class="concern" @click="goConcern">
        <span class="icon icon-heart" v-if="isConcern === 0"></span>
        <span class="icon icon-heart-fill" v-else></span>
      </div>
      <!-- 评论 -->
      <div class="operation" @click="goDiscuss">
        <span class="icon icon-dialog"></span>
        <span class="count">{{commentCount || ''}}</span>
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
import { getAppExampleDetails,getAutoSubjectCount } from "service/detailService";
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
  methods: {
    modifyRoute(val) {
      this.submitSuccess = val;
    },
    // 刷新better-scroll
    refresh() {
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
      try {
        if(fileName == 'null'){
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
    //由于视图的样式不同，导致侧滑菜单也要不同样式
    slideStatus(data) {
      if(data == 'view') {
        this.isShow = false;
      } else {
        this.isShow = true;
      }
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
  .wrapper {

  }
  .wrapper2 {
    height: 100%;
    // overflow: hidden;
    z-index: 11;
  }
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
        height: calc(100% - .44rem);
      }
    }
    .detail-comment-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: .44rem;
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
        display: flex;
        justify-content: center;
        align-items: center;
        .icon-xihuan{
          color: #c93d1b;
        }
      }
      .operation {
        display: flex;
        align-items: center;
      }
      .count{
        margin-left: .04rem;
        font-size: .12rem;
      }
    }
  }
</style>
