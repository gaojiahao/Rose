<style lang="less" scoped>
@import './flowTodo.less';
</style>
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
            <div 
                class="flow-task-item" 
                v-for="(task,index) in tasks" 
                :key="index"  >

                <div class="flow-task-item-header">
                    {{task.listName}}
                </div>

                <div class="flow-task-item-top">
                    <img 
                    :src="task.cretaorPhoto || require('assets/ava01.png')" 
                     onerror="src='https://lab.roletask.com/resource/common-icon/male.png'" 
                     alt='loading'>
                    <div class="flow-task-item-top-wrapper" style="">
                        <span class="nodename">{{task.nodeName}}</span>
                        <span class="transCode">{{task.transCode}}</span>
                    </div>
                </div>

                <div class="primaryInfo " @click="handlerViewTask(task)">
                    <div class="primaryInfo-wrapper vux-1px-b">
                        <div 
                            class="primaryInfo-item" 
                            v-for="(item,index) in task.primaryInfo" 
                            :key='index'>
                            <span class="title">{{item.fieldName}}</span>
                            <span class="text">{{item.value}}</span>
                        </div>

                        <div class="primaryInfo-item" >
                            <span class="title">创建者</span>
                            <span class="text">{{task.creatorName}}</span>
                        </div>
                        <div class="primaryInfo-item" >
                            <span class="title">创建时间</span>
                            <span class="text">{{dateFormat(task.crtTime)}}</span>
                        </div>
                    </div>
                    <div class="primaryInfo-tip" v-if="!task.primaryInfo.length">
                        更多信息可在PC端，配置...
                    </div>
                </div>

                <div class="flow-task-item-foot-actions">
                    <button 
                        @click="agreement(task)"
                        class="flow-task-item-foot-actions-agreement" 
                        v-if="task.actions.includes('agreement')">同意
                    </button>
                    <button 
                        @click="disagree(task)"
                        class="flow-task-item-foot-actions-disagree" 
                        v-if="task.actions.includes('disagree')">不同意
                    </button>
                    <button
                        @click="stop(task)"
                        v-if="task.actions.includes('stop')"
                        class="flow-task-item-foot-actions-stop" >终止
                    </button>
                    <button
                         @click="transfer(task)"
                        class="flow-task-item-foot-actions-transfer" >转办
                    </button>
                </div>
            </div>
        </div>
    <pop-user-list 
        :show="showUserList" 
        :default-value="selectedUser" 
        @sel-item="selUser"
        v-model="showUserList" >
    </pop-user-list>

    <div v-transfer-dom>

        <confirm 
            class="action-confirm" 
            title="转办" 
            @on-confirm="onTransfer"
            :close-on-confirm="false" 
            v-model="showConfirm">
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
import { dateFormat } from 'vux'
import { getMsgList2} from "service/msgService";
import { 
  commitTask, 
  transferTask
} from 'service/commonService'
import RScroll from "plugins/scroll/RScroll";
import PopUserList from 'components/Popup/PopUserList'
import { Confirm } from 'vux'
export default {
    name:"flowTodo",
    components:{
        RScroll,
        Confirm,
        PopUserList,
    },
    data(){
        return {
            showUserList: false, // 是否展示用户列表
            selectedUser: {}, // 选中的转办用户
            showConfirm: false,
            transferInfo: {
                comment: '', // 备注
            },
            showCommentWarn: false,

            tasks:[],
            show13:true,
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
            getMsgList2(this.params).then(({ dataCount = 0, tableContent = [] }) => {
                this.$emit("loadData", 'flowTodo',dataCount);
                this.hasNext = dataCount > (this.params.page - 1) * this.params.limit + tableContent.length;
                this.tasks = this.params.page===1?tableContent:[...this.tasks,...tableContent];

                this.tasks.map(t=>{
                    t.actions = 'agreement,disagree';
                });
                this.$nextTick(() => {
                    this.$refs.bScroll.finishPullUp();
                    this.$refs.bScroll.finishPullDown();
                });

            })
        },
        handlerViewTask(task){
            window.location.href = `/Hermes/detail/${task.listId}/0?name=${task.title}&transCode=${task.transCode}`;
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
        agreement(t){
            this.$vux.confirm.prompt('', {
            title: '审批意见',
            onConfirm: (value) => {
                this.commitTask({
                result: 1,
                successMsg: '提交成功',
                value
                });
            }
            });
        },
        disagree(t){
            this.$vux.confirm.prompt('', {
                title: '审批意见',
                onConfirm: (value) => {
                    this.commitTask({
                    result: 0,
                    successMsg: '提交成功',
                    value
                    });
                }
            });
        },
        stop(t){
            this.$vux.confirm.prompt('', {
                title: '终止原因',
                onConfirm: (value) => {
                    this.commitTask({
                    result: 0,
                    successMsg: '提交成功',
                    value
                    });
                }
            });
        },
        commitTask({result, value, successMsg, callback}) {
            this.$HandleLoad.show();
            let submitData = {
                taskId: this.taskId,
                taskData: JSON.stringify({
                result,
                transCode: this.code,
                comment: value
                })
            };
            return commitTask(submitData).then(data => {
                this.$HandleLoad.hide();
                let {success = false, message = '提交失败'} = data;
                if (success) {
                    message = successMsg;
                }
                this.$vux.alert.show({
                    content: message,
                    onHide: () => {
                    
                    }
                });
            }).catch(e => {
                this.$HandleLoad.hide();
            });
        },
        // 转办
        transfer(t) {
            this.selectedUser = {};
            this.showUserList = true;
        },
        // 选中转办账号
        selUser(val) {
            this.selectedUser = {...val};
            this.showConfirm = true;
        },
        // 点击confirm确定
        onTransfer() {
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
                location.reload();
                }
                this.$vux.alert.show({
                content: message,
                onHide: () => {
                    this.showViewModel('view');
                }
                });
            }).catch(e => {
                this.$HandleLoad.hide();
            });
        },
    },
    mounted(){
        this.getTasks();
    }
}
</script>