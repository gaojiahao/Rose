<template>
  <div class="pages">
    <div class="detail-container" :class="{'has-comment': hasComment}" ref='detail'>
      <component
        :is='currentComponent'
        @change='modifyRoute'
        @refresh-scroll="refresh"
        ref="detailComponent">
      </component>
    </div>
    <div class="detail-comment-container vux-1px-t" v-if="hasComment">
      <x-icon class="left-arrow" type="ios-arrow-left" size="24" @click.native.stop="back"></x-icon>
      <ul class="operations">
        <li class="operation" @click="goDiscuss">
          <i class="iconfont icon-xiaoxi">
            <sup class="comment-count">{{commentCount || ''}}</sup>
          </i>
        </li>
      </ul>
    </div>
  </div>

</template>

<script>
  import Apps from '../maps/Apps'
  import Bscroll from 'better-scroll'
  import {getPCCommentList} from 'service/commentService'

  export default {
    data() {
      return {
        currentComponent: '',
        transCode: '',
        submitSuccess: false,
        detailScroll: null,
        commentCount: 0,
        hasComment: true, // 是否展示底部评论栏
      }
    },
    watch:{
      $route:{
        handler(to, from){
          let { code } = to.params;
          let { name } = this.$route.query;
          let { fromRalted } = from.query;
          let fromCode = from.params.code || '';
          try {
            // 从相关实例进入另一个详情
            if (to.name === 'DETAIL') {
              this.currentComponent = require(`components/detail/${Apps[code]}Form.vue`).default;
              // 如果进入的应用与当前应用相同，需要调用该方法请求数据
              if (fromCode === code) {
                this.$nextTick(() => {
                  this.$refs.detailComponent.loadPage();
                })
              }
            }
          } catch (e) {
            this.$vux.alert.show({
              content: '抱歉，无法支持该应用的查看',
              onHide: () => {
                this.$router.go(-1);
              }
            });
          }
          this.$nextTick(() => {
            this.detailScroll = new Bscroll(this.$refs.detail, {
              click: true,
            })
          });
          document.title = `${name}详情`;
        }
      }

    },
    methods: {
      modifyRoute(val) {
        this.submitSuccess = val;
      },
      // TODO 刷新better-scroll
      refresh() {
        this.detailScroll.refresh();
      },
      // TODO 底部评论返回按钮事件
      back() {
        this.$router.go(-1);
      },
      // TODO 跳转到评论页面
      goDiscuss() {
        this.$router.push({
          path: '/commentList',
          query: {
            transCode: this.transCode
          }
        })
      },
      // TODO 请求评论列表
      getCommentList() {
        return getPCCommentList({
          relationKey: this.transCode
        }).then(({dataCount = 0}) => {
          this.commentCount = dataCount;
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
      this.$loading.show();
      let {code = ''} = this.$route.params;
      let {transCode = ''} = this.$route.query;
      this.hasComment = !!transCode;
      this.transCode = transCode;
      try {
        this.getCommentList();
        this.currentComponent = require(`components/detail/${Apps[code]}Form.vue`).default;
      } catch (e) {
        this.$vux.alert.show({
          content: '抱歉，无法支持该应用的查看',
          onHide: () => {
            this.$router.go(-1);
          }
        });
      }
      this.$nextTick(() => {
        this.detailScroll = new Bscroll(this.$refs.detail, {
          click: true,
        })
      })

    },
    beforeRouteLeave(to, from, next) {
      let { path } = to;
      this.$HandleLoad.hide();
      // 新建物料，修改列表页的meta值
      if (this.submitSuccess && (to.name === 'LIST' || to.name === 'MSGLIST')) {
        to.meta.reload = true;
      }
      next();
    }

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
    background: #F4F4F4;
    .detail-container {
      height: 100%;
      overflow: hidden;
      &.has-comment {
        height: calc(100% - .48rem);
      }
    }
    .detail-comment-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 .1rem;
      height: .48rem;
      background: #fff;
      .left-arrow {
        fill: #757575;
      }
      .iconfont {
        color: #757575;
        font-size: .25rem;
      }
      /* 评论总数 */
      .comment-count {
        position: relative;
        top: -.05rem;
        font-size: .14rem;
      }
    }
  }
</style>
