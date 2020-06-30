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
                    </div>
                </div>
                <div class="flow-task-item-foot" >
                    <div class="flow-task-item-foot-btn" v-if="task.actionArr">
                        <div style="position: absolute;right: .1rem;top: .05rem;">
                            <template v-for="(aItem,akey) in task.actionArr">
                                <span class="btn_item agreement" :key="akey" v-if="aItem=='agreement'" @click="agreement(task)">同意</span>
                                <span class="btn_item disagree"  :key="akey" v-else-if="aItem=='disagree'" @click="disagree(task)">不同意</span>
                                <span class="btn_item resubmit"  :key="akey" v-else-if="aItem=='resubmit'" @click="handlerViewTask(task)">重新提交</span>
                                <span class="btn_item stop"  :key="akey" v-else-if="aItem=='stop'" @click="stop(task)">终止</span>
                            </template>
                            <span class="btn_item transfer" @click="transfer(task)">转办</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <pop-user-list :show="showUserList" :default-value="selectedUser" @sel-item="selUser"
                   v-model="showUserList"></pop-user-list>
        <!-- 转办 -->
        <div v-transfer-dom>
            <confirm class="action-confirm" title="转办" @on-confirm="onConfirm"
                    :close-on-confirm="false" v-model="showConfirm">
                <div class="confirm-item">
                <span class="title required">转办给: </span>
                <span>{{selectedUser.nickname}}</span>
                </div>
            
                <div class="confirm-item">
                <span class="title required">备注: </span>
                <input type="text" class="value" v-model="transferInfo.comment">
                </div>
                <div class="warn" v-show="showCommentWarn">请输入备注</div>
            </confirm>
        </div>
    </r-scroll>
</template>

<script>
import { getMsgList} from "service/msgService";
import {getListById, isMyflow} from "service/detailService"
import RScroll from "plugins/scroll/RScroll";
import { XButton,Confirm, dateFormat } from 'vux'
import { commitTask, transferTask, getFormViewByUniqueId} from 'service/commonService'
import PopUserList from 'components/Popup/PopUserList'
export default {
    name:"myToDoTask",
    components:{
        RScroll,
        XButton,
        Confirm,
        PopUserList,
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
                limit: 10
            },
            selectedUser: {}, // 选中的转办用户
            showConfirm: false,
            transferInfo: {
                comment: '', // 备注
            },
            showCommentWarn: false,
            showUserList: false, // 是否展示用户列表
        }
    },
    methods:{
        getTasks:function(){
            getMsgList(this.params).then(({ dataCount = 0, tableContent = [] }) => {
                this.$emit("loadData", dataCount);
                this.hasNext = dataCount > (this.params.page - 1) * this.params.limit + tableContent.length;
                this.tasks = this.params.page===1?tableContent:[...this.tasks,...tableContent];
                // for(var i=0;i<this.tasks.length;i++){
                //     if(this.tasks[i].actions){
                //         var arr= this.tasks[i].actions.split(',');
                //         this.tasks[i].actions = arr;
                //     }
                // }
                this.tasks.map(t=>{
                    if(t.actions){
                        t.actionArr = t.actions.split(',');
                    }else{
                        t.actionArr = [];
                    }
                });
                this.$nextTick(() => {
                    this.$refs.bScroll.finishPullUp();
                    this.$refs.bScroll.finishPullDown();
                });

            })
        },
        handlerViewTask(task){
            
            //todo:通过nav的status信息判断，移动端是否支持动态渲染，不支持则提示并不跳转
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
        isMyflow(task){
            return isMyflow({ transCode: task.transCode }).then(rs => {
                var l = rs.dataCount,
                    task = l && rs.tableContent[0];
                this.taskInfo = task;
                this.viewId = this.taskInfo.viewId;
            });
        },
        getFormViewByUniqueId(){
            return getFormViewByUniqueId(this.viewId).then(data => {
                this.viewType = data.viewType;
            });
        },
        async loadFlow(task){
            await this.isMyflow(task);
            await this.getFormViewByUniqueId();
        },
        // 同意
        async agreement(task) {
            //判断是否提交数据
            await this.loadFlow(task);
            if(this.viewType == 'view'){
                this.$vux.confirm.prompt('', {
                    title: '审批意见',
                    onConfirm: (value) => {
                        this.commitTask({
                        result: 1,
                        successMsg: '同意成功',
                        value,
                        transCode: task.transCode,
                        taskId: task.taskId
                        });
                    }
                });
            } else if(this.viewType == 'marking'){
                // this.$vux.alert.show({
                //     content: '抱歉，当前任务暂不支持快捷审批操作，请进入详情页后，再执行相关操作，谢谢！'
                // });
                this.handlerViewTask(task);          
            }
        },
        // 拒绝
        disagree(task) {
            this.$vux.confirm.prompt('', {
                title: '审批意见',
                onConfirm: (value) => {
                this.commitTask({
                    result: 0,
                    successMsg: '不同意成功',
                    value: value,
                    transCode: task.transCode,
                    taskId: task.taskId,
                    callback: () => {

                    }
                });
                }
            });
        },
        //终止
        stop(task) {
            this.$vux.confirm.prompt('', {
                title: '审批意见',
                onConfirm: (value) => {
                    this.commitTask({
                        result: -1,
                        successMsg: '终止成功',
                        value: value,
                        transCode: task.transCode,
                        taskId: task.taskId,
                        callback: () => {
                        
                        }
                    });
                }
            });  
        },
        // 审批
        commitTask({result, value, successMsg, callback,taskId,transCode}) {
            this.$HandleLoad.show();
                let submitData = {
                    taskId: taskId,
                    taskData: JSON.stringify({
                    result,
                    transCode: transCode,
                    comment: value
                })
            };
            return commitTask(submitData).then(data => {
                this.$HandleLoad.hide();
                let {success = false, message = '提交失败'} = data;
                let actionMap = {0: 'reject', 1: 'agree', 2: 'revoke'};
                if (success) {
                    message = successMsg;
                    this.$emit('on-submit-success', JSON.stringify({
                        type: actionMap[result]
                    }));
                }
                this.$vux.alert.show({
                    content: message,
                    onHide: () => {
                        if (success) {
                            if (callback) {
                                callback();
                            } else {
                                this.$router.go(0);
                            }
                        }
                    }
                });
            }).catch(e => {
                this.$HandleLoad.hide();
            });
        },
        // 转办
        transfer(task) {
            this.selectedUser = {};
            this.showUserList = true;
            this.taskId = task.taskId;
        },
        // 选中转办账号
        selUser(val) {
            this.selectedUser = {...val};
            this.showConfirm = true;
        },
        // 点击confirm确定
        onConfirm(task,callback='') {
            let warn = '';
            let submitData = {
                userId: this.selectedUser.userId,
                taskId: this.taskId,
                ...this.transferInfo,
            };
            this.showCommentWarn = !this.transferInfo.comment;
            if (this.showCommentWarn) {
                return
            }

            this.showConfirm = false;
            this.$HandleLoad.show();
            transferTask(submitData).then(data => {
                this.$HandleLoad.hide();
                let {success = false, message = '提交失败'} = data;
                if (success) {
                message = '转办成功';
                this.$emit('on-submit-success', JSON.stringify({
                    type: 'transfer'
                }));
                //location.reload();
                }
                this.$vux.alert.show({
                content: message,
                onHide: () => {
                    if (success) {
                        if (callback) {
                            callback();
                        } else {
                            this.$router.go(0);
                        }
                    }
                }
                });
            }).catch(e => {
                this.$HandleLoad.hide();
            });
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
    padding: .10rem;
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
            height: .3rem;
            padding: .05rem .1rem;
            width: 100%;
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
                        padding: .02rem .15rem;
                        border: 1px solid #9c9c9c;
                        background-color: #fff;
                        text-align: center;
                        white-space: nowrap;
                        border-radius: .2rem;
                        margin-right: .05rem;
                        font-size: .14rem;
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
.action-confirm {
    .confirm-item {
      display: flex;
      align-items: center;
      padding: .05rem 0;
      line-height: .2rem;
      text-align: left;
    }
    .warn {
      color: #ea5455;
      text-align: right;
      font-size: .12rem;
      font-weight: bold;
    }
    .title {
      display: inline-block;
      width: .6rem;
      &.required {
        color: $required;
        font-weight: bold;
      }
    }
    .value {
      padding: .04rem .05rem;
      width: calc(100% - .6rem);
      border: 1px solid #dedede;
      border-radius: .05rem;
      outline: none;
      font-size: 16px;
      -webkit-appearance: none;
      appearance: none;
    }
  }
</style>