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
            v-for="(item, index) in comments"
            :key="index"
            ref="commentItem"
        ></comment-item>
    </r-scroll>
</template>

<script>
import CommentItem from "msgPage/components/CommentItem";
import { getNotice} from "service/msgService";
import RScroll from "plugins/scroll/RScroll";
export default {
    name:"noticeComment",
    components:{
        RScroll,
        CommentItem
    },
     data(){
        return {
            comments:[],
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
        getNotice(noticeType = "comment") {
            let { page, limit } = this.params;
            let filter = [
                {
                property: "type",
                operator: "eq",
                value: noticeType
                }
            ];
            getNotice({
                page,
                limit,
                filter: JSON.stringify(filter)
            }).then(data => {
                let { dataCount = 0, tableContent = [] } = data;
                let { page, limit } = this.params;

                this.isNull = !tableContent.length;
                this.hasNext =
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
                this.comments =
                this.page === 1
                    ? tableContent
                    : [...this.comments, ...tableContent];
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
            this.getNotice();
        },
        onPullingDown(){
            this.params.page=1;
            this.getNotice();
        },
    },
    mounted(){
        this.getNotice();
    }
}
</script>