<template>
    <r-scroll
        class="wrapper"
        :options="scrollOptions"
        :has-next="hasNext"
        :no-data="false"
        @on-pulling-down="onPullingDown"
        @on-pulling-up="onPullingUp"
        ref="bScroll" >
        <comment-item
            :item="item"
            v-for="(item, index) in praises"
            :key="index"
            ref="commentItem"
        ></comment-item>
    </r-scroll>
</template>

<script>
import CommentItem from "msgPage/components/CommentItem";
import { getNoticeByPraise} from "service/msgService";
import RScroll from "plugins/scroll/RScroll";
export default {
    name:"noticePraise",
    components:{
        RScroll,
        CommentItem
    },
     data(){
        return {
            praises:[],
            scrollOptions: {
                click: true,
                pullUpLoad: true,
                pullDownRefresh: true,
            },
            isNull:true,
            hasNext:true,
            params:{
                page: 1,
                start: 0,
                limit: 10
            }
        }
    },
    methods:{
         // 获取应用icon
        getDefaultIcon(item) {
        let url = require("assets/defaultApp.png");
            if (item) {
                item.icon = url;
            }
            return url;
        },
      // 获取点赞列表
    getNoticeByPraise() {
      let { page, limit } = this.params;
      getNoticeByPraise({
        page,
        limit
      }).then(data => {
        let { total = 0, praiseNoticeList = [] } = data;
        let { page, limit } = this.params;
        this.isNull = !praiseNoticeList.length;
        this.hasNext =
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
        this.praises =
          this.page === 1
            ? praiseNoticeList
            : [...this.praises, ...praiseNoticeList];
        this.$nextTick(() => {
          this.$refs.bScroll.finishPullUp();
        });
      });
    },
        // 设置评论者/实例创建者的颜色
        setReply(name) {
            return `<span style="color: #2994FD;">${name}</span>`;
        },
        // 上拉加载
        onPullingUp() {
            this.params.page++;
            this.getNoticeByPraise();
        },
        onPullingDown(){
            this.params.page=1;
            this.getNoticeByPraise();
        },
    },
    mounted(){
        this.getNoticeByPraise();
    }
}
</script>