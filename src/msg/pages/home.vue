<template>
  <div class="inPage">
    <tab active-color='#5077aa' :line-width=2>
      <tab-item v-for="(item, index) in tabList" :selected="index === activeIndex" @on-item-click="onTabClick" :key="index">{{item.name}}</tab-item>
    </tab>
    <template v-if="listData">
      <r-scroll class="wrapper" :class="{'other-wrapper' :  activeIndex != 0}"
                :options="scrollOptions" :has-next="hasNext" :no-data="false"
                @on-pulling-up="onPullingUp" ref="bScroll">
        <div class="when_null" v-if="isNull">{{noDataText}}</div>
        <div class="msg_list" v-else>
          <template v-if="activeIndex === 0">
            <todo-item :name="key" :item="value" v-for='(value, key) in listData'
                       @click.native="goMsglist(value, key)" :key='key'></todo-item>
          </template>
          <template v-else-if="activeIndex === 1 || activeIndex === 2">
            <comment-item :item="item" v-for="(item, index) in commentList"
                          @click.native="goDetail(item, index)" :key="index">
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
  import {Badge, Tab, TabItem} from 'vux'
  // 映射表 引入
  import Apps from '@/home/pages/apps/bizApp/maps/Apps'
  // 请求 引入
  import {getMsgList, getNotice} from 'service/msgService'
  // 组件 引入
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
        activeIndex: 0,
        commentList: [],
        scrollOptions: {
          pullUpLoad: true,
        },
        page: 1,
        limit: 10,
        hasNext: true,
        isClickDetail: false,
      }
    },
    computed: {
      // 暂无数据
      noDataText() {
        let list = ['暂无待办消息', '暂无评论消息', '暂无点赞消息'];
        return list[this.activeIndex]
      },
    },
    components: {
      Badge, RScroll, TodoItem, CommentItem, Tab, TabItem,
    },
    methods: {
      // TODO tab切换
      onTabClick(index) {
        let list = [this.getList, this.getComment, this.getPraise];
        this.activeIndex = index;
        this.$refs.bScroll.scrollTo(0, 0);
        this.resetCondition();
        list[this.activeIndex]();
      },
      // TODO 获取应用icon
      getDefaultIcon(item) {
        let url = require('assets/defaultApp.png');
        if (item) {
          item.icon = url;
        }
        return url
      },
      // TODO 重置条件
      resetCondition() {
        this.page = 1;
        this.commentList = [];
        this.listData = {};
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
            item.pic = item.icon ? `/dist/${item.icon}` : this.getDefaultIcon();
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
        this.isClickDetail = true;
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
          for(let item of tableContent) {
            let content = JSON.parse(item.content);
            item.comment = content.content; // 评论内容
            item.commentType = content.type; // 评论类型,list为应用,instance为实例
            item.attachment = content.attachment;
            item.RELATION_KEY = content.relationKey; // 实例的交易号
            item.pic = item.icon ? `/dist/${item.icon}` : this.getDefaultIcon(); // app图标处理
            // list为应用，instance为实例
            item.other = content.type === 'list' ? `@应用详情` : `@实例编码: ${content.relationKey}`;
            // 为回复，不为评论
            if (content.parentId !== -1) {
              item.comment = `回复@${content.objCreator}: ${content.content}`;
              item.reply = {
                createrName: content.objCreator,
                comment: `@${content.objCreator} 评论: ${content.objContent}`,
              };
            }
            // 点赞
            if (item.type === 'praise') {
              item.comment = '赞了这条评论';
              item.reply = {
                createrName: content.creator,
                comment: `@${content.creator}: ${content.content}`,
                attachment: content.attachment,
              };
            }
          }          
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
        let {commentType = '', listId = '', listName = '', RELATION_KEY = ''} = item;
        let fileId = item.typeId, 
            childId = item.childId;
        let query = {
          childId,
          name: listName,
          transCode: RELATION_KEY,
        };
        let path = `/detail/${fileId}/${listId}`;
        if (commentType === 'list') {
          path = `/appDetail/${listId}`;
          query = {};
        }
        // 高亮点击的应用
        item.visited = true;
        this.isClickDetail = true;
        this.$set(this.commentList, index, {...item});
        // 等待动画结束后跳转
        setTimeout(() => {
          this.$router.push({path, query,})
        }, 200);
      },
      // TODO 上拉加载
      onPullingUp() {
        this.page++;
        if (this.activeIndex === 1) {
          this.getNotice();
        } else if (this.activeIndex === 2) {
          this.getPraise();
        }
      },
      // TODO 改变访问状态
      changeVisitedStatus() {
        if (this.activeIndex === 0) {
          let tmp = {...this.listData};
          Object.values(tmp).forEach(item => {
            item.visited = false;
          });
          setTimeout(() => {
            this.listData = tmp;
          }, 200);
        } else {
          let tmp = [...this.commentList];
          tmp.forEach(item => {
            item.visited = false;
          });
          setTimeout(() => {
            this.commentList = tmp;
          }, 200);
        }
        this.isClickDetail = false;
      },
    },
    beforeRouteLeave(to, from, next) {
      let {path} = to;
      if (path === '/home') {
        from.meta.reload = true;
      }
      next();
    },
    created() {
      this.$loading.show();
      this.getList().then(() => {
        this.$loading.hide();
      });
    },
    activated() {
      let reload = this.$route.meta.reload;
      register();
      // 是否需要重新加载数据
      if (reload) {
        this.listData = {};
        this.activeIndex = 0;
        this.$loading.show();
        this.getList().then(() => {
          this.$loading.hide();
        });
        this.$route.meta.reload = false;
      } else {
        // 进入过详情才改变状态
        this.isClickDetail && this.changeVisitedStatus();
      }
    }
  }
</script>

<style lang='scss' scoped>
  .inPage {
    overflow: hidden;
    .wrapper {
      width: 100%;
      overflow: hidden;
      height: calc(100% - .92rem);
      &.other-wrapper {
        background: #EEE; 
      }
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
      // background: #F6F6F6;
      // padding: .04rem 0 .02rem;
    }
  }
</style>
