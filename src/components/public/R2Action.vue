<template>
  <!-- 审批操作 -->
  <div class='handle_wrapper' v-if="!!actions.length">
    <div class="more" @click="goFlow"> 
      <span class="icon icon-d-flow-more"></span>
    </div>
    <div class="detail-comment-container vux-1px-t">
      <template v-for="(item, index) in actions">
        <div class="flow" :key="index" v-if="hasComment&&index<2">
          <div class="action" v-if="item=='resubmit'" @click="resubmit">
            <div class="left">
              <span class="icon icon-d-flow-submit"></span>
            </div>
            <div class="desc-4 right">重新提交</div>   
          </div>
          <div class="action" v-if="item=='agreement'" @click="agreement">
            <div class="left">
              <span class="icon icon-d-flow-agree"></span>
            </div>
            <div class="desc right">同意</div>   
          </div>
          <div class="action" v-if="item=='disagree'" @click="disagree">
            <div class="left">
              <span class="icon icon-d-flow-disagree"></span>
            </div>
            <div class="desc-3 right">不同意</div> 
          </div>
          <div class="action" v-if="item=='revoke'" @click="revoke">
            <div class="left">
              <span class="icon icon-d-flow-chehui"></span>
            </div>
            <div class="desc right">撤回</div>
          </div>
          <div class="action" v-if="item=='revokeDraft'" @click="revokeDraft">
            <div class="left">
              <span class="icon icon-d-flow-chehuicaogao"></span>
            </div>
            <div class="desc-5 right">撤销为草稿</div>
          </div>
          <div class="action" v-if="item=='edit'" @click="showViewModel('edit')">
            <div class="left">
              <span class="icon icon-d-flow-edit"></span>
            </div>
            <div class="desc right">编辑</div>
          </div>
          <div class="action" v-if="item=='revise'" @click="showViewModel('revise')">
            <div class="left">
              <span class="icon icon-d-flow-xiugai"></span>
            </div>
            <div class="desc right">修改</div>
          </div>
          <div class="action" v-if="item=='newFile'" @click="showViewModel('new')">
            <div class="left">
              <span class="icon icon-d-flow-new"></span>
            </div>
            <span class="desc right">新建</span>
          </div>
          <div class="action" v-if="item=='stop'" @click="stop">
            <div class="left">
              <span class="icon icon-d-flow-stop"></span>
            </div>
            <div class="desc right">终止</div>
          </div>
          <div class="action" v-if="item=='transfer'" @click="transfer">
            <div class="left">
              <span class="icon icon-d-flow-zhuanban"></span>
            </div>
            <div class="desc right">转办</div>
          </div>
          <div class="action" v-if="item=='goConcern'" @click="goConcern">
            <div class="left">
              <span class="icon icon-heart" v-if="isConcern != '1'"></span>
              <span class="icon icon-heart-fill" v-else></span>
            </div>
            <div class="desc right" v-if="isConcern != '1'">关注</div>
            <div class="desc-4 right" v-else>取消关注</div>
          </div>
          <div class="action" v-if="item=='goDiscuss'" @click="goDiscuss">
            <div class="left">
              <span class="icon icon-dialog"></span>
            </div>
            <div class="desc right">评论</div>
          </div>
          <div class="action" v-if="item=='goTaskLogList'" @click="goTaskLogList">
            <div class="left">
              <span class="icon icon-log"></span>
            </div>
            <div class="desc right">日志</div>
          </div>
        </div>
      </template>
    </div>
    <div v-transfer-dom>
      <popup v-model="showFlow" height="24%">
        <div class="popup">
          <div class="flow-box">
            <flexbox :gutter="0" wrap="wrap">
              <flexbox-item :span="1/5" v-if="actions.includes('resubmit')">
                <div class="flex-demo" @click="resubmit" >
                  <span class="icon icon-d-flow-submit"></span>
                  <div class="desc">重新提交</div>
                </div>
              </flexbox-item>
              <flexbox-item :span="1/5" v-if="actions.includes('agreement')">
                <div class="flex-demo" @click="agreement">
                  <span class="icon icon-d-flow-agree"></span>
                  <div class="desc">同意</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5" v-if="actions.includes('disagree')">
                <div class="flex-demo" @click="disagree" >
                  <span class="icon icon-d-flow-disagree"></span>
                  <div class="desc">不同意</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5" v-if="actions.includes('revoke')">
                <div class="flex-demo" @click="revoke">
                  <span class="icon icon-d-flow-chehui"></span>
                  <div class="desc">撤回</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5" v-if="actions.includes('revokeDraft')">
                <div class="flex-demo"  @click="revokeDraft">
                  <span class="icon icon-d-flow-chehuicaogao"></span>
                  <div class="desc">撤销为草稿</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5" v-if="actions.includes('edit')">
                <div class="flex-demo"  @click="showViewModel('edit')">
                  <span class="icon icon-d-flow-edit"></span>
                  <div class="desc">编辑</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5" v-if="actions.includes('revise')">
                <div class="flex-demo" @click="showViewModel('revise')">
                  <span class="icon icon-d-flow-xiugai"></span>
                  <div class="desc">修改</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5" v-if="actions.includes('new')">
                <div class="flex-demo" @click="showViewModel('new')">
                  <span class="icon icon-d-flow-new"></span>
                  <div class="desc">新建</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5" v-if="actions.includes('stop')">
                <div class="flex-demo" @click="stop">
                  <span class="icon icon-d-flow-stop"></span>
                  <div class="desc">终止</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5" v-if="actions.includes('transfer')">
                <div class="flex-demo" @click="transfer">
                  <span class="icon icon-d-flow-zhuanban"></span>
                  <div class="desc">转办</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5">
                <div class="flex-demo" @click="goConcern">
                  <span class="icon icon-heart" v-if="isConcern != '1'"></span>
                  <span class="icon icon-heart-fill" v-else></span>
                  <div class="desc">{{ isConcern != '1' ? '关注' : '取消关注' }}</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5"  v-if="isDiscuss">
                <div class="flex-demo" @click="goDiscuss">
                  <span class="icon icon-dialog"></span>
                  <div class="desc">评论</div>
                </div>
              </flexbox-item><flexbox-item :span="1/5" v-if="isTaskLog">
                <div class="flex-demo" @click="goTaskLogList">
                  <span class="icon icon-log"></span>
                  <div class="desc">日志</div>
                </div>
              </flexbox-item>
            </flexbox>
          </div>
        </div>
      </popup>
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
import actinoMinx from "mixins/action";

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
  mixins: [actinoMinx],
  data() {
    return {
      showUserList: false, // 是否展示用户列表
      selectedUser: {}, // 选中的转办用户
      showConfirm: false,
      transferInfo: {
        comment: '', // 备注
      },
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
    deleteActions(action) {
      if(this.actions.length === 0) return;
      if(this.actions.indexOf(action) > -1){
        this.actions.splice(this.actions.indexOf(action),1);
      }
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
        //me.pushActions('copyNew');
      }
      if(model === 'revise') {
        me.deleteActions('newFile');
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
        //me.pushActions('storage');
      }
      if(actions.includes('temporary') && !((me.actions).includes('storage'))) {
        //me.pushActions('storage');
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
      me.pushActions('goConcern');
      me.pushActions('goDiscuss');
      me.pushActions('goTaskLogList');
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
            this.$HandleLoad.show();
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
                  { folder, fileName, transCode ,name} = this.$route.query;
              this.$router.replace({
                path: `/fillform/${listId}/0`,
                query: {
                  fileName,folder,
                  name: name,
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
          { folder, fileName,name} = this.$route.query,
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
                  name,
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
    // margin: .1rem 0 .24rem;
    // overflow: hidden;
    // position: fixed;
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 999;
    // 审批操作
    .handle_btn {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      width: 100%;
      padding: 0 .1rem;
      line-height: .12rem;
      color: #333;
      text-align: center;
      font-size: .12rem;
      box-sizing: border-box;
      .btn_item {
        display: inline-block;
        padding: .05rem .10rem;
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
    .more{
      width: .4rem;
      height: .4rem;
      display: inline-block;
      position: absolute;
      z-index: 999;
      top: -46px;
      right: 14px;
      .icon {
        width: .4rem;
        height: .4rem;
        float: right;
      }  
    }
    .detail-comment-container {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: .5rem;
      background-color: #fafafa;
      color: #999;
      &:before {
        border-color: #d9d9d9
      }
      .icon {
        display: inline-block;
        width: .2rem;
        height: .2rem;
        float: right;
      }
      .icon-heart {
        width: .22rem;
        height: .2rem;
      }
      .icon-heart-fill {
        width: .2rem;
        height: .18rem;
      }
      /** 关注 */
      .concern{
        text-align: center;
        .icon-xihuan{
          color: #c93d1b;
        }
        .heart-desc{
          font-size: .1rem;
          margin-top: -.05rem;
        }
      }
      .operation {
        .dialog-desc{
          font-size: .1rem;
          margin-top: -.06rem;
        }
      }
      .count{
        font-size: .12rem;
      }
      .task{
        .task-desc{
          font-size: .1rem;
          margin-top: -.06rem;
          margin-left: -.03rem;
        }
      }
      .flow{
        flex: 1;
        font-size: .14rem;
        .action{
          display: flex;
          .left{
            flex: auto;
          }
          .right {
            flex: auto;
          }
          .desc{
            /* margin-top: -.06rem; */
            margin-left: 0.05rem;
            display: inline-block;
          }
          .desc-3{
            font-size: .1rem;
            margin-top: -.06rem;
            margin-left: -.08rem;      
          }
          .desc-4{
            font-size: .1rem;
            margin-top: -.06rem;
            margin-left: -.14rem;      
          }
          .desc-5{
            margin-left: 0.05rem;
            display: inline-block;
          }
        }
      }
      .operate{
        .desc{
          font-size: .1rem;
          margin-top: -.06rem;
          margin-left: -.02rem;   
        }
      }
    }
  }
  .popup{
    .flow-box{
      .flex-demo{
        width: 100%;
        padding-top: .1rem;
        .icon{
          display: inline-block;
          width: 50%;
          height: .4rem;
          margin-left: 25%;
          
        } 
        .desc{
          font-size: .1rem;
          text-align: center;
        } 
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
