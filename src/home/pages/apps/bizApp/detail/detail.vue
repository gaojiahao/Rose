<template>
  <div class="pages">
    <div class="detail-container" :class="{'has-comment': hasComment}" ref='detail'>
      <component
        :is='currentComponent'
        @change='modifyRoute'
        @refresh-scroll="refresh"
        @is-subscribe="isSubscribe"
        ref="detailComponent">
      </component>
    </div>
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
// 映射表 引入
import Apps from '@/home/pages/maps/businessApp'
import AppsFile from '@/home/pages/maps/businessFile'
// 插件 引入
import Bscroll from 'better-scroll'
// 请求 引入
import { isSubscribeByRelationKey, subscribeApp, unsubscribeApp, getUserList } from 'service/commentService.js'
/* 引入微信相关 */
import {register} from 'plugins/wx'
export default {
  data() {
    return {
      transCode: '',
      currentComponent: '',
      submitSuccess: false,
      detailScroll: null,
      commentCount: 0,
      hasComment: true, // 是否展示底部评论栏
      isConcern : 0, // 是否关注，0 未关注，1已关注
      concernCount : 0, //关注人数
    }
  },
  // watch:{
  //   $route:{
  //     handler(to, from){
  //       let { code } = to.params;
  //       let { name } = this.$route.query;
  //       let { fromRalted } = from.query;
  //       let {file} = from.query;
  //       let fromCode = from.params.code || '';
  //       try {
  //         // 从相关实例进入另一个详情
  //         if (to.name === 'DETAIL') {
  //           this.currentComponent = require(`components/detail/${file}/${Apps[code]}Form.vue`).default;
  //           // 如果进入的应用与当前应用相同，需要调用该方法请求数据
  //           if (fromCode === code) {
  //             this.$nextTick(() => {
  //               this.$refs.detailComponent.loadPage();
  //             })
  //           }
  //         }
  //       } catch (e) {
  //         this.$vux.alert.show({
  //           content: '抱歉，无法支持该应用的查看',
  //           onHide: () => {
  //             this.$router.go(-1);
  //           }
  //         });
  //       }
  //       this.$nextTick(() => {
  //         this.detailScroll = new Bscroll(this.$refs.detail, {
  //           click: true,
  //         })
  //       });
  //       document.title = `${name}详情`;
  //     }
  //   }

  // },
  methods: {
    modifyRoute(val) {
      this.submitSuccess = val;
    },
    // TODO 刷新better-scroll
    refresh() {
      this.$nextTick(() => {
        this.detailScroll.refresh();
      })
    },
    // TODO 底部评论返回按钮事件
    /*back() {
      this.$router.go(-1);
    },*/
    // TODO 跳转到评论页面
    goDiscuss() {
      this.$router.push({
        path: '/commentList',
        query: {
          transCode: this.transCode
        }
      })
    },
    // TODO 是否已经关注该订单
    isSubscribe(val){
      this.isConcern = val;
    },
    // TODO 关注或取关
    goConcern() {
      let operation = subscribeApp,
          data = {
            type: 'instance',
            relationKey: this.transCode
          };
      if(this.isConcern === 1) {
        operation = unsubscribeApp;
        delete data.type;
      }
      operation(data).then(({success = true, message = ''})=>{
        if(success) {
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
    // TODO 初始化页面
    initPage(){
      // this.$loading.show();
      let { childId, transCode } = this.$route.query,
        { fileId, listId } = this.$route.params;
      this.hasComment = !!transCode;
      this.transCode = transCode;
      try {
        if(childId) {
          this.currentComponent = require(`components/detail/${AppsFile[fileId]}/${Apps[fileId][childId][listId]}Form.vue`).default;
        }
        else {
          this.currentComponent = require(`components/detail/${AppsFile[fileId]}/${Apps[fileId][listId]}Form.vue`).default;
        }
        // 监听详情页传回来的 ‘评论’
        this.$event.$on('commentCount', (val) => {
          this.commentCount = val;
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
      this.$nextTick(() => {
        if (!this.detailScroll) {
          this.detailScroll = new Bscroll(this.$refs.detail, {
            click: true,
          })
        }
      })
    },
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
  created() {
    this.initPage();
  },
  activated() {
    let reload = this.$route.meta.reload;
    if(reload) {
      this.initPage();
      this.$route.meta.reload = false;
    }
  },
  beforeRouteLeave(to, from, next) {
    let { path } = to;
    let isGoList = to.name === 'LIST' || to.name === 'MSGHOME';
    console.log(to)
    this.$HandleLoad.hide();
    if (isGoList) {
      this.currentComponent = null;
      // 销毁better-scroll
      this.detailScroll.destroy();
      this.detailScroll = null;
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
        width: .22rem;
        height: .2rem;
      }
      /** 关注 */
      .concern{
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
