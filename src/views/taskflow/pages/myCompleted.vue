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
            
            <div class="flow-task-item" v-for="(task,index) in tasks" :key="index" >
                <div class="flow-task-item-header vux-1px-b">
                    <div class="flow-task-item-header-wrapper">
                        <div class="flow-task-item-header-wrapper-img">
                            <img  :src="getImgPic(task.icon)" >
                        </div>
                        <div class="flow-task-item-header-wrapper-title"> 
                            <span>{{task.listName}}</span>
                        </div>
                            <!-- <div>
                            <span>{{task.TRANS_CODE}}</span>
                            </div> -->
                    </div>
                </div>
                <div class="flow-task-item-center vux-1px-b"  @click="handlerViewTask(task)">
                    <div class="flow-task-item-center-wrapper">
                        <span>{{task.transCode}}</span>
                        <span style="float:right;color: black;">{{task.nodeName}}</span>
                    </div>
                    <div>
                        <div v-for="(item,key) in task.primaryInfo" :key="key">
                            <span>{{item.fieldName}}：{{item.value}}</span>
                        </div>     
                    </div>
                    <div class="">
                        <div>
                            <span>创建人：{{task.creatorName}}</span>
                        </div>
                        <div>
                            <span>创建时间：{{dateFormat(task.crtTime)}}</span>
                        </div>
                        <!-- <div>
                            <span>审批操作：
                                <template v-if="task.status==0">
                                不同意
                                </template>
                                <template v-else-if="task.status==1">
                                同意
                                </template>
                                <template v-else-if="task.status==-1">
                                终止
                                </template>
                            </span>
                        </div>
                        <div>
                            <span>审批意见：{{task.comment}}</span>
                        </div> -->
                    </div>
                </div>
                <div class="flow-task-item-foot" >
                    <div class="flow-task-item-foot-flow">
                        审批操作：
                        <span class="flow-task-item-foot-flow-span">
                            <template v-if="task.status==0">
                                <span class="disagree">不同意</span>
                            </template>
                            <template v-else-if="task.status==1">
                                <span class="agreement">同意</span>
                            </template>
                            <template v-else-if="task.status==-1">
                                <span class="stop">终止</span>
                            </template>
                        </span>
                    </div>
                    <div>
                        <span>审批意见：{{task.comment}}</span>
                    </div>    
                </div>
            </div>
        </div>
    </r-scroll>
</template>

<script>
import { getMsgList} from "service/msgService";
import {getListById} from "service/detailService"
import RScroll from "plugins/scroll/RScroll";
import { XButton,dateFormat } from 'vux'
export default {
    name:"myCompleted",
    components:{
        RScroll,
        XButton 
    },
    filters: {
        dateFormat
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
                limit: 10,
                flag:'Done'
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
             let list,path;
            getListById({uniqueId:task.listId}).then(res=>{
                list = res[0];
                if(list.navStatus===2){
                    path = `/detail/${task.listId}/0`;
                    this.$router.push({
                        path,
                        query: { 
                        transCode:task.transCode
                        }
                    })
                }else{
                    this.$vux.confirm.show({
                    content: '抱歉，当前任务实例暂不支持查看详情,您可直接在列表处理任务，或在PC端查看实例详细信息'
                 })
                }
            })
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
        //选择默认图片
        getImgPic(d) {
        let url;
            if(d){
                url =  d;
            }else{
                url = require('assets/default/service-sales-contract.png');
            }
            return url;
        },
        dateFormat(val){
            return dateFormat(val, 'YYYY-MM-DD HH:mm:ss');
        },
        
    },
    mounted(){
        this.getTasks();
        this.bus.$on('refresh',()=>{//登陆刷新
          this.getTasks();
       })
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
        background: white;
        &-header{
            padding: .05rem .1rem;
            &-wrapper{
                // display: flex;
                // justify-content: space-between;
                width: 100%;
                height: .3rem;
                // border-bottom: 1px solid #9E9E9E;
                color:#9E9E9E;
                &-img{
                    width: .3rem;
                    float: left;
                    img{                    
                        width: .25rem;
                        border-radius: .03rem;
                    }
                }
                &-title{
                    color: black;
                }
            }
        }
        &-center{
            padding: .05rem .1rem;
            color:#9E9E9E;
        }

        &-foot{
            //height: .3rem;
            padding: .05rem .1rem;
            width: 100%;
            &-flow{
                &-span{
                   font-weight:600;
                    .submit,.resubmit,.submitNew,.draft,.newFile,.copyNew,.update,.storage,.revoke,.edit {
                        //border-color: rgb(0, 150, 136);
                        //background-color: rgb(0, 150, 136);
                        color: rgb(0, 150, 136);
                    }
                    .revokeDraft {
                        border-color: rgb(255, 193, 7);
                        //background-color: rgb(255, 193, 7);
                        color: rgb(255, 193, 7);
                    }
                    .reduction,.agreement {
                        //border-color: green;
                        //background-color: green;
                        color: green;
                    }
                    .disagree,.stop {
                        //border-color: red;
                        //background-color: red;
                        color: red;
                    }
                }
            }
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
            &-btn{
                width: 100%;
                position: relative;
                .btn_item{
                    padding: .01rem .08rem;
                    border: 1px solid #9c9c9c;
                    background-color: #fff;
                    text-align: center;
                    white-space: nowrap;
                    border-radius: .10rem;
                    margin-right: .05rem;
                    font-size: .12rem;
                }
                .submit,.resubmit,.submitNew,.draft,.newFile,.copyNew,.update,.storage,.revoke,.edit {
                    border-color: rgb(0, 150, 136);
                    background-color: rgb(0, 150, 136);
                    color: #fff;
                }
                .revokeDraft {
                    border-color: rgb(255, 193, 7);
                    background-color: rgb(255, 193, 7);
                    color: #fff;
                }
                .reduction,.agreement {
                    border-color: green;
                    background-color: green;
                    color: #fff;
                }
                .disagree,.stop {
                    border-color: red;
                    background-color: red;
                    color: #fff;
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