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
    </r-scroll>
</template>

<script>
import { getMsgList} from "service/msgService";
import RScroll from "plugins/scroll/RScroll";
export default {
    name:"projectTask",
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
            this.$router.push(`/detail/ee4ff0a1-c612-419d-afd7-471913d57a2a/0?name=项目任务&folder=project&fileName=XMRW&transCode=${task.transCode}`);
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
@blue:#0099CC;
@blue2:#336699;
@green:#99CCCC;
@green2:#CCCC99;
@puplur:#666699;
@gray:#CCCCCC;
.flow-task{
    padding: .15rem;
    font-size: .14rem;

    &-item{
        box-shadow: 0 2px 10px 0 @gray;
        margin-bottom: .15rem;
        width: 100%;
        .top{
            height: .55rem;
        }
        .img{
            width: .45rem;
            height: .45rem;
            float: left;
            padding: .05rem;
            img{
                height: .45rem;
                border-radius: 0.3rem;
            }
        }
        &-header{
            padding: .05rem .05rem;
            float: right;
            &-wrapper{
                // display: flex;
                justify-content: space-between;
                height: .24rem;
                padding-top: 0.05rem;
                padding-right: 0.05rem;
                .title{
                    // background-color: @green;
                    color: #000;
                    float: left;
                    width: 100px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                .code{
                    float: right;
                }
                .value{
                    width: 100%;
                }
            }
        }

        &-center{
            padding: 0 .05rem .05rem;
            font-size: .12rem;
            padding-top: 0.02rem;
            &-wrapper{
                justify-content: space-between;
                .task{
                    background-color: @blue2;
                    padding: 0 .1rem;
                    color: #fff;
                    float: left;
                    margin-right: 0.05rem;
                }
                .task2{
                    background-color: @green2;
                    padding: 0 .1rem;
                    color: #fff;
                    float: left;
                    margin-right: 0.05rem;
                }
                .task3{
                    background-color: @puplur;
                    padding: 0 .1rem;
                    color: #fff;
                    float: left;
                    margin-right: 0.05rem;
                }
            }
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
                // border-radius: .2rem;
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