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
            <div class="flow-task-item" v-for="(task,index) in tasks" :key="index">
                <div class="top" @click="handlerViewTask(task)">
                    <div class='img'>
                        <img :src="task.photo || require('assets/ava01.png')" class="avatar">
                    </div>
                    <div class="">
                        <div class="flow-task-item-header-wrapper">
                            <div class='title'>
                                <span>{{task.logTitle}}</span>
                            </div>
                            <div class='code'>
                                <span>{{task.transCode}}</span>
                            </div>
                        </div>
                        <div class="flow-task-item-center">
                            <div class="flow-task-item-center-wrapper">
                                <span class="task">{{task.taskName_projectPlanTask}}</span>
                                <span class="task2">{{task.logType}}</span>
                                <!-- <span class="task3">{{task.biProcessStatus}}</span> -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="status">
                    <div class="status-item" @click='changStatus(task,index)'>
                        {{task.biProcessStatus}}
                        <span style="float:right"><i class="icon-btn icon-taskDown"></i></span>
                    </div>
                </div>
                <div class="" >
                    <div class="flow-task-item-foot-wrapper">
                        <div>
                            <i class="icon icon-handler"></i>
                            <span>创建人：{{task.creatorName}}</span>
                        </div>
                        <div>
                            <i class="icon icon-mod-time"></i>
                        <span>创建时间：{{dateFormat(task.crtTime)}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- 拟态框 -->
        <div v-transfer-dom>
            <popup v-model="showPop" height="33.33%" class="trade_pop_part" @on-show="onShow" @on-hide="onHide">
                <div class="trade_pop">
                    <group title="流程状态">
                        <radio title="title" :options="statusList" v-model="tempStatus"></radio>
                    </group>
                </div>
            </popup>
        </div>
    </r-scroll>
</template>

<script>
import { dateFormat, Popup, TransferDom , Radio, Group } from 'vux'
import { getList} from "service/msgService";
import RScroll from "plugins/scroll/RScroll";
import { getProcessStatusByListId,updateProcessStatus} from "service/detailService";
import { getListMobileView } from 'service/app-basic/appSettingService'
export default {
    name:"flowTodo",
    components:{
        RScroll,
        Popup,
        TransferDom,
        Radio,
        Group
    },
    props: {
        filterList: {
            type: String,
            default: ''
        },
        isFealter: {
            type: Boolean,
            default: false
        },
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
            },
            showPop: false,
            listId: '2750a13d-295d-4776-9673-290c51bfc568',
            statusList: [],
            tempStatus:'',
            tempTransCode:'',
            tempIndex: '',
            tempObj:{},
            viewId: '',
        }
    },
    watch:{
        isFealter:{
            handler(val){
                if(this.isFealter){
                    this.getTasks();
                }
            }
        },
        tempStatus:{
            handler(newValeu,oldValue){
                if(oldValue&&this.tempStatus&&this.tempTransCode){
                    this.updateProcessStatus();
                    this.tasks[this.tempIndex].biProcessStatus = newValeu;
                }
            }
        }    
    },
    methods:{
        async getTasks(){
            let { page, limit } = this.params,
                viewId = this.viewId || await this.getListMobileView();
            if(this.filterList){
                let filter = [
                    {
                        property: "taskDate",
                        operator: "btw",
                        value: this.filterList
                    },
                    {
                        property:"handlerName",
                        operator:"in",
                        value:"$currUserName$"
                    },
                ];
                this.params.filter = JSON.stringify(filter);
            }
            getList(viewId,this.params).then(({ dataCount = 0, tableContent = [] }) => {
                this.$emit("loadData", 'dailyTask', dataCount);
                this.hasNext = dataCount > (this.params.page - 1) * this.params.limit + tableContent.length;
                this.tasks = this.params.page===1?tableContent:[...this.tasks,...tableContent];
                this.$nextTick(() => {
                    this.$refs.bScroll.finishPullUp();
                    this.$refs.bScroll.finishPullDown();
                });
                this.$emit("colseFilter",false);
            })
        },
        handlerViewTask(task){
            var listId = this.listId;
            window.location.href = `/Hermes/detail/${listId}/0?name=日志任务&folder=project&fileName=RWRZ&transCode=${task.transCode}`;
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
        dateFormat(time){
            return dateFormat(time, 'YYYY-MM-DD HH:mm:ss');
        },
        changStatus(task,index){
            this.tempIndex = index;
            this.tempStatus = task.biProcessStatus;
            this.tempTransCode = task.transCode;
            this.showPop = true;
        },
        onShow(){

        },
        onHide(){
            this.removeStatusTemp();
        },
        getProcessStatusByListId() {
            let data = {
                listId : this.listId
            };
            return getProcessStatusByListId(data).then(({tableContent = []}) => {
                for(let item of tableContent) {
                    this.statusList.push(item.fieldValue); 
                }
            });
        },
        updateProcessStatus() {
            let data = {
                transCode : this.tempTransCode,
                processStatus: this.tempStatus,
            };
            return updateProcessStatus(data).then(data => {
                this.$vux.toast.text(data.message, 'top')  
            });    
        },
        removeStatusTemp(){
            this.tempTransCode = '';
            this.tempStatus = '';
            this.tempIndex = '';
        },
        getListMobileView() {
            return new Promise((resolve, reject) => {
                getListMobileView(this.listId).then(data => {
                    let viewRecord = data[0];
                    this.viewId = data[0].id;
                    resolve(this.viewId );
                });
            }).catch(function (error) {
                reject(error);
            });
        },
    },
    created(){
        this.getListMobileView();
        this.getProcessStatusByListId();
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
        .status{
            width: 100%;
            height: .2rem;
            margin-bottom: 0.05rem;
            .status-item{
                float: right;
                font-size: .12rem;
                margin-right: 0.05rem;
                background-color: @puplur;
                color: white;
                padding: 0 0.05rem;
                span {
                    margin-top: 0.03rem;
                    display: flex;
                    align-items: center;
                    .icon-btn {
                        display: inline-block;
                        width: .12rem;
                        height: .12rem;
                    }
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
                    float: right;
                    span {
                        margin-top: 0.03rem;
                        display: flex;
                        align-items: center;
                        .icon-btn {
                            display: inline-block;
                            width: .12rem;
                            height: .12rem;
                        }
                    }
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
.vux-popup-dialog {
    position: fixed;
    left: 0;
    /* bottom: 0; */
    width: 60%;
    background: #eee;
    z-index: 501;
    transition-property: transform, -webkit-transform;
    transition-duration: 300ms;
    max-height: 100%;
    overflow-y: scroll;
    top: 33.33%;
    margin-left: 20%;
    border-radius: 0.05rem;
}
</style>