<template>
    <r-scroll
            class="wrapper"
            :options="scrollOptions"
            :has-next="hasNext"
            :no-data="false"
            @on-pulling-down="onPullingDown"
            @on-pulling-up="onPullingUp"
            ref="bScroll"
            >
        <div class="flow-task">
            
            <div class="flow-task-item" v-for="(task,index) in tasks" :key="index" @click="handlerViewTask(task)" >
                <div class="flow-task-item-header">
                    <div class="flow-task-item-header-wrapper">
                            <div>
                            <span>{{task.title}}</span>
                            </div>
                            <div>
                            <span>{{task.TRANS_CODE}}</span>
                            </div>
                    </div>
                </div>
                <div class="flow-task-item-center">
                    <div class="flow-task-item-center-wrapper">
                        <span>{{task.nodeName}}</span>
                    </div>
                    </div>

                <div class="flow-task-item-foot vux-1px-t" >
                        <div class="flow-task-item-foot-wrapper">
                            <div>
                                <i class="icon icon-handler"></i>
                                <span>创建人：{{task.creator_name}}</span>
                            </div>
                            <div>
                                <i class="icon icon-mod-time"></i>
                            <span>创建时间：{{task.crtTime}}</span>
                            </div>
                        </div>
                </div>
            </div>
        </div>
    </r-scroll>
</template>

<script>
import { getMsgList} from "service/msgService";
import RScroll from "plugins/scroll/RScroll";
export default {
    name:"flowTodo",
    components:{
        RScroll
    },
    data(){
        return {
            tasks:[],
            scrollOptions: {
                click: true,
                pullUpLoad: true,
                pullDownRefresh: true,
            },
            hasNext:true,
            params:{
                page: 1,
                start: 0,
                limit: 10
            }
        }
    },
    methods:{
        getTasks:function(){

            getMsgList(this.params).then(({ dataCount = 0, tableContent = [] }) => {
                this.$emit("loadData", dataCount);
                this.hasNext = dataCount > (this.params.page - 1) * this.params.limit + tableContent.length;
                this.tasks = this.params.page===1?tableContent:[...this.tasks,...tableContent];
                this.$nextTick(() => {
                    this.$refs.bScroll.finishPullUp();
                    this.$refs.bScroll.finishPullDown();
                });

            })
        },
        handlerViewTask(task){
            this.$router.push(`/detail/${task.listId}/0?name=${task.title}&transCode=${task.TRANS_CODE}`);
        },
        // 上拉加载
        onPullingUp() {
            this.params.page++;
            this.getTasks();
        },
        onPullingDown(){
            this.params.page=1;
            this.getTasks();
        },
        
    },
    mounted(){
        this.getTasks();
    }
}
</script>

<style lang="less" scoped>
.flow-task{
    padding: .15rem;
    font-size: .14rem;

    &-item{
        box-shadow: 0 2px 10px 0 rgba(232, 232, 232, 0.7);
        margin-bottom: .15rem;
        &-header{
            padding: .05rem .1rem;
            &-wrapper{
                display: flex;
                justify-content: space-between;
            }
        }

        &-center{
            padding: .05rem .1rem;
        }

        &-foot{
            padding: .05rem .1rem;
            &-wrapper{
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-pack: justify;
                -ms-flex-pack: justify;
                justify-content: space-between;
                font-size: .12rem;
                color: #9E9E9E;
                display: -ms-flexbox;
                display: flex;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                padding: .05rem .1rem;
                background-color: #f7f7f7;
                border-radius: .2rem;
                white-space: nowrap;
                div{
                    display: -webkit-box;
                    display: -ms-flexbox;
                    display: flex;
                    -webkit-box-align: center;
                    -ms-flex-align: center;
                    align-items: center;
                    color: #999;
                    margin-right: .05rem;
                }
            }

        }
        
    }
}
.icon {
    display: inline-block;
    margin-right: .05rem;
    width: .16rem;
    height: .16rem;
}
</style>