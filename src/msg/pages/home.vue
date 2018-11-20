<template>
  <div class="inPage">
    <r-tab :data="tabList" @on-click="onTabClick"></r-tab>
    <template v-if="listData">
      <r-scroll class="wrapper" :options="scrollOptions" :has-next="hasNext" :no-data="false"
                @on-pulling-up="onPullingUp" ref="bScroll">
        <div class="when_null" v-if="isNull">{{noDataText}}</div>
        <div class="msg_list" v-else>
          <template v-if="activeTab === 'todo'">
            <todo-item :name="key" :item="value" v-for='(value, key) in listData'
                       @click.native="goMsglist(value, key)" :key='key'></todo-item>
          </template>
          <template v-else-if="activeTab === 'comment' || activeTab === 'praise'">
            <comment-item :item="item" v-for="(item, index) in commentList"
                          @click.native="goDetail(item, index)" :key="index">
              <comment-item :item="item.reply" v-if="item.reply" slot="reply" no-header is-reply></comment-item>
            </comment-item>
          </template>
        </div>
      </r-scroll>
    </template>
    <!--<router-view></router-view>-->
  </div>
</template>
<script>
  // vux组件引入
  import {Badge} from 'vux'
  // 映射表 引入
  import Apps from '@/home/pages/apps/bizApp/maps/Apps'
  // 请求 引入
  import {getMsgList, getNotice} from 'service/msgService'
  // 组件 引入
  import BScroll from 'better-scroll'
  import RTab from 'components/list/commonPart/RTab'
  import RScroll from 'components/RScroll'
  import TodoItem from 'components/msg/TodoItem'
  import CommentItem from 'components/msg/CommentItem'
  /* 引入微信相关 */
  import {register} from 'plugins/wx'

  export default {
    data() {
      return {
        listData: {},
        isNull: false,
        tabList: [
          {name: '待办', status: 'todo'},
          {name: '评论', status: 'comment'},
          {name: '点赞', status: 'praise'},
        ],
        activeTab: 'todo',
        commentList: [],
        scrollOptions: {
          // pullDownRefresh: true,
          pullUpLoad: true,
        },
        page: 1,
        limit: 10,
        hasNext: true,
      }
    },
    computed: {
      // 暂无数据
      noDataText() {
        let map = {
          todo: '暂无待办消息',
          comment: '暂无评论消息',
          praise: '暂无点赞消息',
        };
        return map[this.activeTab]
      },
    },
    components: {
      Badge, RTab, RScroll, TodoItem, CommentItem,
    },
    methods: {
      // TODO tab切换
      onTabClick(item) {
        let map = {
          todo: this.getList,
          comment: this.getComment,
          praise: this.getPraise,
        };
        this.activeTab = item.status;
        this.$loading.show();
        this.$refs.bScroll.scrollTo(0, 0);
        this.resetCondition();
        map[this.activeTab]().then(() => {
          this.$loading.hide();
        });
      },
      // TODO 重置条件
      resetCondition() {
        this.page = 1;
        this.commentList = [];
        this.hasNext = true;
      },
      //获取应用消息数据
      getList() {
        return getMsgList().then(({dataCount = 0, tableContent = []}) => {
          this.$event.$emit('badgeNum', dataCount);
          this.hasNext = false;
          if (!tableContent.length) {
            // 没有数据的时候
            this.isNull = true;
            return;
          }
          tableContent.forEach(item => {
            this.isNull = false;
            // app图标处理
            item.pic = item.icon
              ? `/dist/${item.icon}`
              : this.getDefaultImg();
            // 只针对已经移动化的应用做消息的显示
            if (Apps[item.listId]) {
              if (!this.listData[item.title]) {
                // 以 <应用名称> 进行分类
                this.$set(this.listData, item.title, {list: [item]})
              }
              else {
                this.listData[item.title].list.push(item);
              }
            }
          });
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          })
        })
      },
      // 前往应用消息列表
      goMsglist(item, name) {
        // 高亮点击的应用
        item.visited = true;
        this.$set(this.listData, name, {...item});
        // 等待动画结束后跳转
        setTimeout(() => {
          this.$router.push({
            path: '/msglist', query: {name}
          })
        }, 200);
      },
      // TODO 获取通知，默认取评论
      getNotice(noticeType = 'comment') {
        let filter = [{
          property: 'type',
          operator: 'eq',
          value: noticeType
        }];
        return getNotice({
          page: this.page,
          limit: this.limit,
          filter: JSON.stringify(filter)
        }).then(data => {
          let {dataCount = 0, tableContent = []} = data;
          this.isNull = !tableContent.length;
          this.hasNext = dataCount > (this.page - 1) * this.limit + tableContent.length;
          tableContent = tableContent.reduce((arr, item) => {
            let content = JSON.parse(item.content);
            item.comment = content.content;
            item.attachment = content.attachment;
            item.commentType = content.type;
            // list为应用，instance为实例
            item.other = content.type === 'list' ? `评论了应用` : `评论了实例${content.relationKey}`;
            // 为回复，不为评论
            if (content.parentId !== -1) {
              item.reply = {
                createrName: content.objCreator,
                comment: `@${content.objCreator}: ${content.objContent}`,
              };
            }
            // 点赞
            if (item.type === 'praise') {
              item.comment = '赞了我';
              item.other = content.type === 'list' ? `赞了应用` : `赞了实例${content.relationKey}`;
              item.reply = {
                createrName: content.creator,
                comment: `@${content.creator}: ${content.content}`,
                attachment: content.attachment,
              };
            }

            arr.push(item);
            return arr
          }, []);
          this.commentList = this.page === 1 ? tableContent : [...this.commentList, ...tableContent];
          this.$nextTick(() => {
            this.$refs.bScroll.finishPullUp();
          });
          return data
        })
      },
      // TODO 获取评论
      getComment() {
        return this.getNotice();
      },
      // TODO 获取点赞
      getPraise() {
        return this.getNotice('praise');
      },
      // TODO 进入详情
      goDetail(item, index) {
        /*if (item.commentType === 'list') {
          return
        }
        // 高亮点击的应用
        item.visited = true;
        this.$set(this.listData, index, {...item});*/
        // 等待动画结束后跳转
        /*setTimeout(() => {
          this.$router.push({
            path: '/detail',
            query: {name}
          })
        }, 200);*/
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        if (this.activeTab === 'comment') {
          this.getNotice();
        } else if (this.activeTab === 'praise') {
          this.getPraise();
        }
      },
    },
    filters: {
      handleCrt(val) {
        let date = val.duration,
          //计算出小时数
          hours = parseInt(date / (3600)),
          //计算相差分钟数
          leave2 = date - (hours * 3600),       //计算小时数后剩余的毫秒数
          minutes = Math.floor(leave2 / (60)),
          //计算相差秒数
          leave3 = leave2 - (minutes * 60),     //计算分钟数后剩余的毫秒数
          seconds = Math.round(leave3),
          backTime;
        if (hours > 0) {
          backTime = `${hours}小时前`;
        }
        else {
          backTime = minutes === 0 ? '1分钟前' : `${minutes}分钟前`;
        }
        return hours < 24 ? backTime : `${val.crtTime.split(' ')[0]}`;

      }
    },
    created() {
      register();
      this.$loading.show();
      this.getList().then(() => {
        this.$loading.hide();
      });
    },
  }
</script>

<style lang='scss' scoped>
  .inPage {
    overflow: hidden;
    .wrapper {
      width: 100%;
      height: calc(100% - .92rem);
      overflow: hidden;
    }
    /deep/ .scroll-wrapper {
      position: relative;
      min-height: 100%;
    }
    .when_null {
      top: 50%;
      width: 100%;
      font-size: .24rem;
      color: #c8c8c8;
      font-weight: bold;
      text-align: center;
      position: absolute;
      transform: translate(0, -50%);
    }
    .msg_list {
      padding: .04rem 0 .02rem;
    }
  }
</style>
