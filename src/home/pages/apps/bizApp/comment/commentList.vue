<template>
  <div class="pages comment-list-container" :class="{'has-emotion': showEmotion}">
    <r-scroll class="comment-list-wrapper" :options="scrollOptions" :has-next="hasNext"
              :no-data="!hasNext && !commentList.length" @on-pulling-up="onPullingUp" ref="bScroll">
      <comment-item :item="item" v-for="(item, index) in commentList"
                    @on-reply="onReply" @on-praise-success="onPraiseSuccess"
                    :no-border="index === commentList.length - 1" :key="index">
        <comment-item :item="rItem" v-for="(rItem, rIndex) in item.allReply"
                      @on-reply="onReply" @on-praise-success="onPraiseSuccess"
                      slot="reply" :key="rIndex" no-border></comment-item>
      </comment-item>
    </r-scroll>
    <div class="send-container" :class="{focus: focusInput}">
      <i class="icon-emotion" @click="showEmotion = !showEmotion" ref="emotionIcon"></i>
      <textarea type="text" class="comment-value" v-model="comment" ref="commentValue" :placeholder="placeholder"
                @focusin="commentFocusIn" @focusout="commentFocusOut"></textarea>
      <span class="btn-send" @click.stop="saveComment">发送</span>
    </div>
    <r-emotion :show="showEmotion" @on-select="emotionSelected" ref="emotion"></r-emotion>
  </div>
</template>

<script>
  import {getCommentList, getPCCommentList, getReply, saveComment} from 'service/commentService'
  import RScroll from 'components/RScroll'
  import CommentItem from 'components/comment/CommentItem'
  import REmotion from 'components/comment/REmotion'
  /* 引入微信相关 */
  import {register} from 'plugins/wx'

  export default {
    name: "comment",
    components: {
      RScroll,
      CommentItem,
      REmotion,
    },
    data() {
      return {
        page: 1,
        total: 0,
        limit: 10,
        parentId: -1,
        placeholder: '添加评论...',
        scrollOptions: {
          pullUpLoad: true,
        },
        listId: '',
        comment: '',
        transCode: '',
        commentList: [],
        hasNext: true,
        focusInput: false,
        showEmotion: false,
      }
    },
    methods: {
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        this.getCommentList();
      },
      // TODO 设置回复内容的文字与颜色
      setReply(creator, conntent) {
        return `@<span style="color: #2994FD;">${creator}</span>：${conntent}`
      },
      // TODO 获取订单详情评论列表
      getCommentList() {
        let data = {
          transCode: this.transCode,
          page: this.page,
          limit: this.limit,
        };
        if (this.listId) {
          data.transCode = this.listId;
        }
        return getCommentList(data).then(({allCommentNum = 0, comment = []}) => {
          this.hasNext = allCommentNum > (this.page - 1) * this.limit + comment.length;
          comment.forEach(item => {
            item.allReply && item.allReply.forEach((rItem, index, arr) => {
              let matched = item.allReply.find(mItem => mItem.ID === rItem.PARENT_ID);
              if (matched) {
                rItem.CONTENT = this.setReply(matched.creatorName, rItem.CONTENT);
              } else {
                rItem.CONTENT = this.setReply(item.creatorName, rItem.CONTENT);
              }
            });
          });
          this.commentList = this.page === 1 ? comment : [...this.commentList, ...comment];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          });
        });
      },
      // TODO 回复
      onReply(item) {
        this.parentId = item.ID;
        this.placeholder = `回复${item.creatorName}:`;
        this.$refs.commentValue.focus();
        console.log('bScroll:', this.$$refs.bScroll);
      },
      // TODO 点赞成功
      onPraiseSuccess(item) {
        item.isPraise = false;
        item.praiseNum++;
      },
      // TODO 标签过滤
      tagFilter(val) {
        return val.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      },
      // TODO 评论
      saveComment() {
        if (!this.comment) {
          this.$vux.toast.show({
            text: '评论不能为空',
            position: 'top',
            width: '50%',
            type: "text",
            time: 700
          });
          return
        }
        //订单详情的评论
        let submitData = {
          content: this.tagFilter(this.comment),// 标签过滤
          parentId: this.parentId,
          relationKey: this.transCode,
          type: "instance",
        };
        //应用详情的评论
        if (this.listId) {
          submitData = {
            content: this.tagFilter(this.comment),// 标签过滤
            parentId: this.parentId,
            relationKey: this.listId,
            type: 'list'
          };
        }
        return saveComment(submitData).then(({success = true, message = ''}) => {
          if (success) {
            this.comment = '';
            this.parentId = -1;
            this.placeholder = '添加评论...';
            this.page = 1;
            this.$refs.bScroll.scrollTo(0, 0);
            this.getCommentList().then(() => {
              this.$loading.hide();
            });
          }
        });
      },
      // TODO 聚焦评论框
      commentFocusIn(e) {
        this.$nextTick(() => {
          e.target.scrollIntoView();
        });
        this.focusInput = true;
        this.showEmotion = false;
      },
      // TODO 评论框失去焦点
      commentFocusOut() {
        this.focusInput = false;
      },
      // TODO 选中表情
      emotionSelected(val) {
        this.comment += val;
      },
      // TODO 判断点击是否为表情容器内
      emotionClickOutside(e) {
        // 若点击不在表情容器内，且不为表情的展示图标，则隐藏表情包
        if (!this.$refs.emotion.$el.contains(e.target) && !this.$refs.emotionIcon.contains(e.target)) {
          this.showEmotion = false;
        }
      },
    },
    created() {
      let {transCode, listId} = this.$route.query;
      this.transCode = transCode;
      this.listId = listId;
      this.$loading.show();
      register();
      this.getCommentList().then(() => {
        this.$loading.hide();
      });
      this.$nextTick(() => {
        document.addEventListener('click', this.emotionClickOutside);
      })
    },
    beforeDestroy() {
      document.removeEventListener('click', this.emotionClickOutside);
    }
  }
</script>

<style scoped lang="scss">
  .comment-list-container {
    background-color: #fff;
    -webkit-overflow-scrolling: touch;
    &.has-emotion {
      .comment-list-wrapper {
        height: calc(100% - 2.5rem);
      }
    }
    .comment-list-wrapper {
      height: calc(100% - .5rem);
    }

    /* 评论框 */
    .send-container {
      padding: .08rem .1rem;
      height: .5rem;
      background-color: #f3f1f2;
      font-size: 0;
      box-sizing: border-box;
      &.focus {
        // position: relative;
        // top: -.5rem;
        // padding-bottom: .3rem;
        // height: 1rem;
      }
      .comment-value {
        display: inline-block;
        padding: .05rem .1rem;
        width: calc(100% - 1rem);
        height: 100%;
        outline: none;
        border-radius: 0.05rem;
        border: none;
        background-color: #fff;
        color: #2d2d2d;
        font-size: .16rem;
        resize: none;
        box-sizing: border-box;
        -webkit-appearance: none;
        appearance: none;
      }
      /* 表情图标 */
      .icon-emotion {
        display: inline-block;
        margin-right: .1rem;
        width: .3rem;
        height: .3rem;
        background: url(~@/assets/emotion.png) no-repeat;
        background-size: 100% 100%;
        vertical-align: top;
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
  }
</style>
