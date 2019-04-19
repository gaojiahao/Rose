<template>
  <div class="inPage">
    <r-tab :data="tabList" :active-index="activeIndex" @on-click="onTabClick" mode="3"></r-tab>
    <div class="swiper-container notice-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(slide, key, idx) in noticeData" :key="key">
          <r-scroll
            class="wrapper"
            :options="scrollOptions"
            :has-next="slide.hasNext"
            :no-data="false"
            @on-pulling-up="onPullingUp"
            ref="bScroll"
          >
            <div class="when_null" v-if="slide.isNull">
              <img
                class="no_data"
                :class="[`no_data_${key}`]"
                :src="require(`assets/noData/${key}.png`)"
                alt="no-data"
              >
              <div class="text">{{noDataText}}</div>
            </div>
            <div class="msg_list" v-else>
              <template v-if="idx === 0">
                <todo-item
                  :name="key"
                  :item="value"
                  v-for="(value, key) in slide.listData"
                  :no-border="value.noBorder"
                  @click.native="goMsglist(value, key)"
                  :key="key"
                ></todo-item>
              </template>
              <template v-else-if="idx === 1 || idx === 2">
                <comment-item
                  :item="item"
                  v-for="(item, index) in slide.listData"
                  :no-border="index === slide.listData.length - 1"
                  @click.native="goDetail(item, index)"
                  @on-popover-click="onPopoverClick"
                  :key="index"
                  ref="commentItem"
                ></comment-item>
              </template>
            </div>
          </r-scroll>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
// vux组件引入
import { Badge } from "vux";
// 请求 引入
import { getMsgList, getNotice, getNoticeByPraise } from "service/msgService";
// 组件 引入
import RScroll from "plugins/scroll/RScroll";
import RTab from "components/list/commonPart/RTab";
import TodoItem from "msgPage/components/TodoItem";
import CommentItem from "msgPage/components/CommentItem";
/* 引入微信相关 */
import { register } from "plugins/wx";
import { debug } from "util";

const BASE_PARAMS = {
  page: 1,
  limit: 10,
  hasNext: true,
  isNull: false,
  listData: []
};
export default {
  data() {
    return {
      tabList: [
        { name: "待办", status: "todo" },
        { name: "评论", status: "comment" },
        { name: "点赞", status: "praise" }
      ],
      activeIndex: 0,
      scrollOptions: {
        bounce: { top: false },
        pullUpLoad: true
      },
      isClickDetail: false,
      pageSwiper: null,
      noticeData: {
        todo: { ...BASE_PARAMS, listData: {} },
        comment: { ...BASE_PARAMS },
        praise: { ...BASE_PARAMS }
      },
      isMovingSwiper: false // swiper是否滑动中，防止滑动时跳转到详情页
    };
  },
  computed: {
    // 暂无数据
    noDataText() {
      let list = ["暂无待办消息", "暂无评论消息", "暂无点赞消息"];
      return list[this.activeIndex];
    },
    // 当前滑块
    currentItem() {
      let { status } = this.tabList[this.activeIndex];
      return this.noticeData[status];
    },
    // 当前滚动容器
    currentScroll() {
      return this.$refs.bScroll[this.activeIndex];
    }
  },
  components: {
    Badge,
    RScroll,
    TodoItem,
    CommentItem,
    RTab
  },
  methods: {
    // tab切换
    onTabClick({ index }) {
      this.activeIndex = index;
      this.currentScroll.scrollTo(0, 0);
      this.resetCondition();
      this.pageSwiper.slideTo(index);
    },
    // 获取应用icon
    getDefaultIcon(item) {
      let url = require("assets/defaultApp.png");
      if (item) {
        item.icon = url;
      }
      return url;
    },
    // 重置条件
    resetCondition() {
      let { status } = this.tabList[this.activeIndex];
      let data = { ...BASE_PARAMS };
      if (!this.activeIndex) {
        data.listData = {};
      }
      this.noticeData[status] = data;
    },
    //获取应用消息数据
    getList() {
      return getMsgList().then(({ dataCount = 0, tableContent = [] }) => {
        let listData = {};
        this.$event.$emit("badgeNum", dataCount);
        this.currentItem.hasNext = false;
        tableContent.forEach(item => {
          // app图标处理
          item.pic = item.icon || this.getDefaultIcon();
          // 只针对已经移动化的应用做消息的显示
          if (item.packagePath) {
            if (!listData[item.title]) {
              // 以 <应用名称> 进行分类
              listData[item.title] = {
                list: [item],
                noBorder: false
              };
            } else {
              listData[item.title].list.push(item);
            }
          }
        });
        if (!Object.getOwnPropertyNames(listData).length) {
          this.currentItem.isNull = true;
          return;
        }
        let values = Object.values(listData);
        // 设置最后一项不展示边框
        if (values.length) {
          values[values.length - 1].noBorder = true;
        }
        this.currentItem.listData = listData;
        this.$nextTick(() => {
          this.currentScroll.finishPullUp();
        });
      });
    },
    // 前往应用消息列表
    goMsglist(item, name) {
      let { status } = this.tabList[this.activeIndex];
      // 判断是否在滑动swiper中
      if (this.isMovingSwiper) {
        return;
      }
      // 高亮点击的应用
      item.visited = true;
      this.isClickDetail = true;
      this.$set(this.noticeData[status].listData, name, { ...item });
      // 等待动画结束后跳转
      setTimeout(() => {
        this.$router.push({
          path: "/msglist",
          query: { name }
        });
      }, 200);
    },
    // 设置评论者/实例创建者的颜色
    setReply(name) {
      return `<span style="color: #2994FD;">${name}</span>`;
    },
    // 获取通知，默认取评论
    getNotice(noticeType = "comment") {
      let { page, limit } = this.currentItem;
      let filter = [
        {
          property: "type",
          operator: "eq",
          value: noticeType
        }
      ];
      return getNotice({
        page,
        limit,
        filter: JSON.stringify(filter)
      }).then(data => {
        let { dataCount = 0, tableContent = [] } = data;
        let { page, limit } = this.currentItem;
        this.currentItem.isNull = !tableContent.length;
        this.currentItem.hasNext =
          dataCount > (page - 1) * limit + tableContent.length;
        for (let item of tableContent) {
          let content = JSON.parse(item.content);
          item.comment = content.content; // 评论内容
          item.commentType = content.type; // 评论类型,list为应用,instance为实例
          item.attachment = content.attachment;
          item.RELATION_KEY = content.relationKey; // 实例的交易号
          item.pic = item.icon || this.getDefaultIcon(); // app图标处理
          // list为应用，instance为实例
          item.other =
            content.type === "list"
              ? `@应用详情`
              : `@实例编码：${content.relationKey}`;
          // 为回复，不为评论
          if (content.parentId !== -1) {
            item.comment = `回复@${this.setReply(content.objCreator)}：${
              content.content
            }`;
            item.reply = {
              createrName: content.objCreator,
              comment: `@${this.setReply(content.objCreator)} 评论：${
                content.objContent
              }`
            };
          }
        }
        this.currentItem.listData =
          this.page === 1
            ? tableContent
            : [...this.currentItem.listData, ...tableContent];
        this.$nextTick(() => {
          this.currentScroll.finishPullUp();
        });
        return data;
      });
    },
    // 获取点赞列表
    getNoticeByPraise() {
      let { page, limit } = this.currentItem;
      return getNoticeByPraise({
        page,
        limit
      }).then(data => {
        let { total = 0, praiseNoticeList = [] } = data;
        let { page, limit } = this.currentItem;
        this.currentItem.isNull = !praiseNoticeList.length;
        this.currentItem.hasNext =
          total > (page - 1) * limit + praiseNoticeList.length;
        for (let item of praiseNoticeList) {
          let content = JSON.parse(item.content);
          item.comment = "赞了这条评论";
          item.reply = {
            createrName: content.creator,
            comment: `@${this.setReply(content.creator)}: ${content.content}`,
            attachment: content.attachment
          };
          item.commentType = content.type; // 评论类型,list为应用,instance为实例
          item.attachment = content.attachment;
          item.RELATION_KEY = content.relationKey; // 实例的交易号
          item.pic = item.icon || this.getDefaultIcon(); // app图标处理
          // list为应用，instance为实例
          item.other =
            content.type === "list"
              ? `@应用详情`
              : `@实例编码：${content.relationKey}`;
        }
        this.currentItem.listData =
          this.page === 1
            ? praiseNoticeList
            : [...this.currentItem.listData, ...praiseNoticeList];
        this.$nextTick(() => {
          this.currentScroll.finishPullUp();
        });
        return data;
      });
    },
    // 获取评论
    getComment() {
      return this.getNotice();
    },
    // 获取点赞
    getPraise() {
      return this.getNoticeByPraise();
    },
    // 进入详情
    goDetail(item, index) {
      let {
        listId,
        folder,
        packagePath,
        listName,
        RELATION_KEY,
        commentType
      } = item;
      let query = {
        name: listName,
        transCode: RELATION_KEY
      };
      let path = `/detail/${folder}/${packagePath}`;
      let { status } = this.tabList[this.activeIndex];
      // 判断是否在滑动swiper中
      if (this.isMovingSwiper) {
        return;
      }
      if (commentType === "list") {
        path = `/appDetail/${listId}`;
        query = {};
      }
      // 高亮点击的应用
      item.visited = true;
      this.isClickDetail = true;
      this.$set(this.noticeData[status].listData, index, { ...item });
      // 等待动画结束后跳转
      setTimeout(() => {
        this.$router.push({ path, query });
      }, 200);
    },
    // 上拉加载
    onPullingUp() {
      this.currentItem.page++;
      if (this.activeIndex === 1) {
        this.getNotice();
      } else if (this.activeIndex === 2) {
        this.getPraise();
      }
    },
    // 改变访问状态
    changeVisitedStatus() {
      let tmp = [];
      if (this.activeIndex === 0) {
        tmp = { ...this.currentItem.listData };
        Object.values(tmp).forEach(item => {
          item.visited = false;
        });
      } else {
        tmp = [...this.currentItem.listData];
        tmp.forEach(item => {
          item.visited = false;
        });
      }
      setTimeout(() => {
        this.currentItem.listData = tmp;
      }, 200);
      this.isClickDetail = false;
    },
    // popover点击事件
    onPopoverClick() {
      let $commentItem = this.$refs.commentItem || [];
      $commentItem.forEach(comment => {
        comment.hidePopover();
      });
    },
    // 初始化swiper
    initSwiper() {
      this.$nextTick(() => {
        this.pageSwiper = new this.Swiper(".notice-container", {
          touchAngle: 30,
          on: {
            slideChangeTransitionStart: () => {
              let index = this.pageSwiper.activeIndex;
              let list = [this.getList, this.getComment, this.getPraise];
              let { status } = this.tabList[index];
              this.activeIndex = index;
              this.isMovingSwiper = true;
              // 已有数据则不重新请求
              if (Object.keys(this.currentItem.listData).length) {
                return;
              }
              this.resetCondition();
              list[this.activeIndex]();
            },
            slideChangeTransitionEnd: () => {
              this.isMovingSwiper = false;
            }
          }
        });
      });
    }
  },
  beforeRouteLeave(to, from, next) {
    let { path } = to;
    if (path === "/home") {
      this.activeIndex = 0;
      this.noticeData = {
        todo: { ...BASE_PARAMS, listData: {} },
        comment: { ...BASE_PARAMS },
        praise: { ...BASE_PARAMS }
      };
      this.pageSwiper.slideTo(0);
      from.meta.reload = true;
    }
    next();
  },
  created() {
    this.$loading.show();
    this.initSwiper();
    this.getList().then(() => {
      this.$loading.hide();
    });
  },
  activated() {
    let reload = this.$route.meta.reload;
    register();
    // 是否需要重新加载数据
    if (reload) {
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
};
</script>

<style lang='scss' scoped>
.inPage {
  overflow: hidden;
  .notice-container {
    width: 100%;
    height: calc(100% - 0.99rem);
  }
  .wrapper {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  /deep/ .scroll-wrapper {
    position: relative;
    min-height: 100%;
  }
  .when_null {
    position: absolute;
    top: 50%;
    width: 100%;
    line-height: 0.2rem;
    color: #999;
    text-align: center;
    font-size: 0;
    transform: translate(0, -50%);
    .no_data {
      vertical-align: top;
    }
    .no_data_ {
      width: 0.72rem;
      height: 0.66rem;
    }
    .no_data_comment {
      width: 0.7rem;
      height: 0.69rem;
    }
    .no_data_praise {
      width: 0.75rem;
      height: 0.71rem;
    }
    .text {
      margin-top: 0.14rem;
      font-size: 0.14rem;
    }
  }
  .msg_list {
    // background: #F6F6F6;
    // padding: .04rem 0 .02rem;
  }
}
</style>
