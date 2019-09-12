<template>
  <!-- 审批操作 -->
  <div class='handle_wrapper' v-if="!!actions.length">
    <div class="handle_btn">
      <span class="btn_item resubmit" @click="resubmit" v-if="actions.includes('resubmit')">提交</span>
      <span class="btn_item submitNew" @click="submitNew" v-if="actions.includes('submitNew')">提交并新建</span>
      <span class="btn_item draft" @click="draft" v-if="actions.includes('draft')">保存草稿</span>
      <span class="btn_item newFile" @click="showViewModel('new')" v-if="actions.includes('newFile')">新建</span>
      <!-- <span class="btn_item copyNew" @click="copyNew" v-if="actions.includes('copyNew')">复制并新建</span> -->
      <span class="btn_item edit" @click="showViewModel('edit')" v-if="actions.includes('edit')">编辑</span>
      <span class="btn_item update" @click="showViewModel('revise')" v-if="actions.includes('revise')">修改</span>
      <span class="btn_item revokeDraft" @click="revokeDraft" v-if="actions.includes('revokeDraft')">撤销为草稿</span>
      <span class="btn_item file" @click="file" v-if="actions.includes('file')">归档</span>
      <span class="btn_item reduction" @click="reduction" v-if="actions.includes('reduction')">还原</span>
      <!-- <span class="btn_item storage" @click="storage" v-if="actions.includes('storage')">暂存</span> -->
      <span class="btn_item agreement" @click="agreement" v-if="actions.includes('agreement')">同意</span>
      <span class="btn_item disagree" @click="disagree" v-if="actions.includes('disagree')">拒绝</span>
      <span class="btn_item transfer" @click="transfer" v-if="actions.includes('transfer')">转办</span>
      <span class="btn_item revoke" @click="revoke" v-if="actions.includes('revoke')">撤回</span>
      <span class="btn_item stop" @click="stop" v-if="actions.includes('stop')">终止</span>
    </div>
    <pop-user-list :show="showUserList" :default-value="selectedUser" @sel-item="selUser"
                   v-model="showUserList" v-if="actions.includes('transfer')"></pop-user-list>
    <div v-transfer-dom>
      <confirm class="action-confirm" title="转办" @on-confirm="onConfirm"
               :close-on-confirm="false" v-model="showConfirm">
        <div class="confirm-item">
          <span class="title required">转办给: </span>
          <span>{{selectedUser.nickname}}</span>
        </div>
        <div class="confirm-item">
          <span class="title required">工时: </span>
          <input type="number" class="value" v-model.number="transferInfo.taskTime">
        </div>
        <div class="warn" v-show="showTaskWarn">请输入工时</div>
        <div class="confirm-item">
          <span class="title required">备注: </span>
          <input type="text" class="value" v-model="transferInfo.comment">
        </div>
        <div class="warn" v-show="showCommentWarn">请输入备注</div>
      </confirm>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { 
  commitTask, 
  transferTask, 
  WebContext, 
  undoDataByTransCodes, 
  archiveDataByTransCodes, 
  switchToEffectiveByTransCodes,
  getFormViews,
} from 'service/commonService'
import { isMyflow, getListById } from 'service/detailService'
import { Confirm } from 'vux'
import PopUserList from 'components/Popup/PopUserList'

var component = {
  props: {
    workFlowLogs: {
      type: Array,
      default() {
        return []
      }
    },
    basicInfo: {
      type: Object,
      default() {
        return {}
      }
    },
    formStatus: {
      type: Array,
      default() {
        return []
      }
    },
  },
  components: {
    Confirm,
    PopUserList,
  },
  data() {
    return {
      showUserList: false, // 是否展示用户列表
      selectedUser: {}, // 选中的转办用户
      showConfirm: false,
      transferInfo: {
        taskTime: 0.1, // 工时
        comment: '', // 备注
      },
      showTaskWarn: false,
      showCommentWarn: false,
      actions: [],
      listInfo: {},
      appAction: {},//应用权限
    }
  },
  methods: {
    //加载应用权限
    getListInfo() {
      return getListById({ uniqueId: this.$parent.listId }).then(data => {
        this.listInfo = data[0];
        this.appAction = this.listInfo.action;
      })
    },
    pushActions(action) {
      this.actions.push(action);
    },
    //处理按钮的判断
    async dealActionInfo() {
      await this.getListInfo();
      let me = this,
          taskInfo = me.taskInfo || {},
          {isMyTask = 0, actions = '', taskId, viewId} = taskInfo,
          logs = me.workFlowLogs || [],
          lastLog = logs[logs.length - 1] || {},
          statusText = (me.formStatus[0] && me.formStatus[0].status) || '',
          model = me.model,
          listInfo = me.listInfo,
          action = me.appAction;  //新增模式按钮

      actions = actions.split(',');

      me.taskId = taskId;
      me.isMyTask = isMyTask === 1;

      if(me.code == '') {
        me.actions =  ['submitNew'];
        if(model ==='revise')return;
        me.pushActions('draft');
      }

      if ((action.add && model != 'marking' && statusText =='已生效') || (model == 'view'&&  statusText =='已生效') || !this.isMyTask) {
        me.pushActions('newFile');
        me.pushActions('copyNew');
      }
      if (statusText === '草稿' && model != 'edit') {
        me.pushActions('edit')  
      }
      if (statusText === '已生效' && model != 'revise' && action.update) {
        me.pushActions('revise')
      }
      if (statusText === '已生效') {
        me.pushActions('revokeDraft');
        if(action.archive && listInfo.whetherArchive == 1) {
          me.pushActions('file');  
        }
      }
      if (statusText === '已归档') {
        me.pushActions('reduction');        
      }
      if (actions.includes('updateDataCommitTask')) {
        me.form.taskType = 1;
        me.pushActions('resubmit');  
      }
      if (actions.includes('resubmit')) {
        me.pushActions('resubmit');
        me.form.taskType = 3;
        me.pushActions('storage');
      }
      if(actions.includes('temporary') && !((me.actions).includes('storage'))) {
        me.pushActions('storage');
      }
      if (actions.includes('agreement')) {
        me.pushActions('agreement');
      }
      if (actions.includes('disagree')) {
        me.pushActions('disagree');
      }
      if (actions.includes('stop')) {
        me.pushActions('stop');
      }
      if(isMyTask) {
        me.pushActions('transfer');
      }
      if(lastLog.isFirstNode === 1 && lastLog.startUserId == this.userId &&  lastLog.endTime == null) {
        me.taskId = lastLog.taskId;
        me.pushActions('revoke'); 
      } 
      if(taskInfo.actions && taskInfo.actions.indexOf('recall') > -1 && taskInfo.allowRecall){
        me.pushActions('revoke'); 
      }
    }, 
    resubmit() {
      this.$HandleLoad.show();
      this.form.saveAndCommitTask();
    },
    submitNew() {},
    draft() {},
    copyNew() {},
    //撤销为草稿
    revokeDraft() {
      let data = {
          transCodes: this.code,
      };
      this.$vux.confirm.prompt('',{
        title:'撤销原因',
        onConfirm: (value) => {
          this.undoDataByTransCodes({
            data:data,
            successMsg: '撤销成功',
            value,
          });
        }
      });
    },
    undoDataByTransCodes({data,successMsg,value}) {
      this.$HandleLoad.show();
      return undoDataByTransCodes(data).then(data => {
        this.$HandleLoad.hide();
        let {success = false, message = ''} = data;
        this.$vux.alert.show({
          content: message,
          onHide: () => {
            if (success) {
              this.$router.go(0);
            }
          }
        });
      }).catch(e => {
        this.$HandleLoad.hide();
      });
    },
    //归档
    file() {
      let data = {
          transCodes: this.code,
      };
      this.$vux.confirm.show({
        title:'确认归档?',
        onConfirm: (value) => {
          this.$HandleLoad.show();
          archiveDataByTransCodes(data).then(data => {
            this.$HandleLoad.hide();
            let {success = false, message = ''} = data;
            this.$vux.alert.show({
              content: message,
              onHide: () => {
                if (success) {
                  this.$router.go(0);
                }
              }
            });
          }).catch(e => {
            this.$HandleLoad.hide();
          });    
        }
      });
    },
    //还原
    reduction() {
      let data = {
          transCodes: this.code,
      };
      this.$vux.confirm.show({
        title:'确认还原?',
        onConfirm: (value) => {
          this.switchToEffectiveByTransCodes({
            data:data,
            successMsg: '还原成功',
            value,
          });
        }
      });  
    },
    switchToEffectiveByTransCodes({data,successMsg,value}) {
      this.$HandleLoad.show();
      return switchToEffectiveByTransCodes(data).then(data => {
        this.$HandleLoad.hide();
        let {success = false, message = ''} = data;
        this.$vux.alert.show({
          content: message,
          onHide: () => {
            if (success) {
              this.$router.go(0);
            }
          }
        });
      }).catch(e => {
        this.$HandleLoad.hide();
      });   
    },
    storage() {},
    //终止
    stop() {
      this.$vux.confirm.prompt('', {
        title: '审批意见',
        onConfirm: (value) => {
          this.commitTask({
            result: -1,
            successMsg: '终止成功',
            value: value,
            callback: () => {
              this.showViewModel('view');
            }
          });
        }
      });  
    },
    // 拒绝
    disagree() {
      this.$vux.confirm.prompt('', {
        title: '审批意见',
        onConfirm: (value) => {
          this.commitTask({
            result: 0,
            successMsg: '拒绝成功',
            value: value,
            callback: () => {
              // 当某个节点审批为自己 如果用户点击了拒绝 则需要判断情况 决定是否回到重新提交页面
              let {  listId} = this.$route.params,
                  { name,folder, fileName, transCode } = this.$route.query;
              isMyflow({transCode: this.code}).then(({tableContent}) => {
                let path = '';
                if (tableContent.length > 0) {
                  let {isMyTask, nodeName} = tableContent[0];
                  if (isMyTask === 1 && nodeName === '重新提交') {
                    path = `/fillform/${listId}/0`;
                  } else {
                    this.$router.go(0);
                  }
                } else {
                  this.$router.go(0);
                }
                this.$router.replace({
                  path, query: {name, folder,fileName,transCode}
                })
              })
            }
          });
        }
      });
    },
    // 同意
    agreement() {
      if(this.model == 'marking') {
        this.form.taskType = 1;
        this.$vux.confirm.prompt('', {
          title: '审批意见',
          onConfirm: (value) => {
            this.form.saveAndCommitTask(value);
          }
        });
      } else {
        this.$vux.confirm.prompt('', {
          title: '审批意见',
          onConfirm: (value) => {
            this.commitTask({
              result: 1,
              successMsg: '同意成功',
              value
            });
          }
        });
      }
      // this.$vux.confirm.prompt('', {
      //   title: '审批意见',
      //   onConfirm: (value) => {
      //     this.commitTask({
      //       result: 1,
      //       successMsg: '同意成功',
      //       value
      //     });
      //   }
      // });
    },
    // 撤回
    revoke() {
      this.$vux.confirm.prompt('', {
        title: '撤回原因',
        onConfirm: (value) => {
          this.commitTask({
            result: 2,
            successMsg: '撤回成功',
            value,
            callback: () => {
              let { listId} = this.$route.params,
                  { folder, fileName, transCode } = this.$route.query;
              this.$router.replace({
                path: `/fillform/${listId}/0`,
                query: {
                  fileName,folder,
                  name: this.name,
                  transCode: this.code,
                },
              });
            }
          });
        }
      });
    },
    // 审批
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
    showViewModel(model) {//new||view||edit||revise
      let me = this,
          { folder, fileName} = this.$route.query,
          { listId } = this.$route.params;
     
      getFormViews(listId).then(data=>{
          var viewIdMap = {},
              wrapper = model == 'view' ? 'detail':'fillform',
              viewType,
              query,
              viewId;

          data.map(function(v){
              viewIdMap[v.viewType] = v.uniqueId;
          });
          if(model == 'edit'){
            viewId = viewIdMap['revise'] || viewIdMap['submit'];
          } else {
            viewType  = model == 'new' ? 'submit' : model;
            viewId = viewIdMap[viewType];
          }
          if(viewId){
              me.$router.replace({
                path: '/' + wrapper +'/' + listId + '/' + viewId ,
                query: {
                  model,
                  folder: folder, fileName:fileName,
                  transCode: model == 'new' ? undefined : me.code
                },
              });
          } else {

          }
      });
    },
    // 转办
    transfer() {
      this.selectedUser = {};
      this.showUserList = true;
    },
    // 选中转办账号
    selUser(val) {
      this.selectedUser = {...val};
      this.showConfirm = true;
    },
    // 点击confirm确定
    onConfirm() {
      let warn = '';
      let submitData = {
        userId: this.selectedUser.userId,
        taskId: this.taskId,
        ...this.transferInfo,
      };
      this.showTaskWarn = !this.transferInfo.taskTime;
      this.showCommentWarn = !this.transferInfo.comment;
      if (this.showTaskWarn || this.showCommentWarn) {
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
  created () {
    var form = this.$parent;
    
    this.form = form;
    this.code = form.transCode || '';
    this.taskInfo = form.taskInfo;
    this.userId = WebContext.currentUser.userId || '';
    this.model = form.viewInfo.viewType || '';
    //我的流程，工作流为空（表单失效），执行一次
    this.dealActionInfo();  
  }
}
export default Vue.component('R2Action',component)
</script>

<style scoped lang="scss">
  @import '~@/scss/color.scss';

  .handle_wrapper {
    margin: .1rem 0 .24rem;
    overflow: hidden;
    // 审批操作
    .handle_btn {
      display: flex;
      flex-wrap: wrap;
      // justify-content: flex-end;
      width: 100%;
      padding: 0 .1rem;
      line-height: .12rem;
      color: #333;
      text-align: center;
      font-size: .12rem;
      box-sizing: border-box;
      .btn_item {
        display: inline-block;
        padding: .08rem .26rem;
        border: 1px solid #9c9c9c;
        background-color: #fff;
        text-align: center;
        white-space: nowrap;
        border-radius: .04rem;
        margin-right: .1rem;
        margin-bottom: .1rem;
        // & + .btn_item {
        //   margin-left: .1rem;
        // }
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
      .file {
        border-color: rgb(31, 94, 197);
        background-color: rgb(31, 94, 197);
        color: #fff;
      }
      .transfer {
        border-color: #e4e4e4;
        background-color: #f6f6f6;
        color: #000;  
      }
      // 同意
      .agree {
        border-color: $main_color;
        background: $main_color;
        color: #fff;
      }
    }
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
