<template>
  <!-- 审批操作 -->
  <div class='handle_wrapper' v-if="!!actions.length">
    <div class="handle_btn">
      <span class="btn_item reject" @click="revoke" v-if="actions.includes('revoke')">撤回</span>
      <span class="btn_item reject" @click="reject" v-if="actions.includes('disagree')">拒绝</span>
      <span class="btn_item agree" @click="agree" v-if="actions.includes('agreement')">同意</span>
      <span class="btn_item transfer" @click="transfer" v-if="actions.includes('transfer')">转办</span>
      <span class="btn_item update" @click="update" v-if="actions.includes('update')">修改</span>
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
import { commitTask, transferTask } from 'service/commonService'
import { isMyflow } from 'service/detailService'
import { Confirm } from 'vux'
import PopUserList from 'components/Popup/PopUserList'

var component = {
  props: {
    code: {
      type: String,
      default: ''
    },
    myFlow: {
      type: Array,
      default() {
        return []
      }
    },
    workFlow: {
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
    name: {
      type: String,
      default: ''
    },
    // 同意的处理
    agreeHandler: {
      type: Function,
      default: null
    }
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
      taskId: '',
      actions: [],
      noOperation: true, 
      userId: '',
      isMine: false,
    }
  },
  watch: {
    myFlow: {
      handler(val) {
        if(val.length) {
          this.actions = val[0].actions;
          this.actions = this.actions.split(',')
          this.taskId = val[0].taskId;
        }
      }
    },
    basicInfo: {
      handler() {
        this.userId = this.$parent.basicInfo.currentUser.userId;
        this.dealActionInof();
      }
    }
  },
  methods: {
    //处理撤回按钮的判断
    dealActionInof() {
      let myFlow = this.myFlow;
      let workFlow = this.workFlow;
      let [flow = {}] = myFlow;
      let {isMyTask = 0, actions = '', taskId, viewId} = flow;
      let [createFlow = {}] = workFlow;
      let last = workFlow[workFlow.length - 1] || {};
      let operationList = ['同意', '不同意'];

      // 已终止
      if (last.status === '终止') return;
      // 经过审批则不能撤回
      workFlow.filter(item => item.isFirstNode === 1).every(item => {
        if (operationList.includes(item.status)) {
          this.noOperation = false;
          return false
        }
      });
      // actions字段没有返回，修改固定赋值
      if(this.actions.length){
        this.actions.push('transfer')
      } else {
        this.actions = ['agreement', 'disagree', 'transfer']; 
      }
      // 判断是否为我创建的任务
      if (createFlow.isFirstNode == 0 && createFlow.startUserId == this.userId) { 
        this.isMine = true;
        this.actions.push('revoke')
        // 如果没有审批操作，则删除拒绝，加入撤回
        // if (this.noOperation) {
        //   this.actions.push('revoke')
        //   this.actions.splice(this.actions.findIndex(item => item === 'disagree'), 1, 'revoke');
        // }
      }
      this.taskId = taskId;
      this.isMyTask = isMyTask === 1;
      // 不为我审批
      if (!this.isMyTask) {
        this.actions = this.isMine && this.noOperation ? ['revoke'] : [];
        return
      }
    },  
    // 拒绝
    reject() {
      this.$vux.confirm.prompt('', {
        title: '审批意见',
        onConfirm: (value) => {
          this.commitTask({
            result: 0,
            successMsg: '拒绝成功',
            value: value,
            callback: () => {
              // 当某个节点审批为自己 如果用户点击了拒绝 则需要判断情况 决定是否回到重新提交页面
              let { folder, fileName } = this.$route.params,
                  { name, listId, transCode } = this.$route.query;
              isMyflow({transCode: this.code}).then(({tableContent}) => {
                let path = '';
                if (tableContent.length > 0) {
                  let {isMyTask, nodeName} = tableContent[0];
                  if (isMyTask === 1 && nodeName === '重新提交') {
                    path = `/fillform/${folder}/${fileName}`;
                  } else {
                    this.$router.go(0);
                  }
                } else {
                  this.$router.go(0);
                }
                this.$router.replace({
                  path, query: {name, listId, transCode}
                })
              })
            }
          });
        }
      });
    },
    // 同意
    agree() {
      if (this.agreeHandler && this.agreeHandler()) {
        return
      }
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
              let { listId } = this.$route.query,
                  { folder, fileName } = this.$route.params;
              this.$router.replace({
                path: `/fillform/${folder}/${fileName}`,
                query: {
                  listId,
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
    // 修改
    update() {
      let { listId } = this.$route.query,
          { folder, fileName } = this.$route.params;
      this.$vux.confirm.show({
        title: '温馨提示',
        content: '即将进入修改页面，确认吗？',
        onConfirm: () => {
          this.$router.replace({
            path: `/fillform/${folder}/${fileName}`,
            query: {
              listId,
              name: this.name,
              transCode: this.code,
              isModify: true
            },
          });
        }
      }) 
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
            this.$router.go(0);
          }
        });
      }).catch(e => {
        this.$HandleLoad.hide();
      });
    },
  },
  created () {
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
        padding: .08rem .28rem;
        border: 1px solid #9c9c9c;
        background-color: #fff;
        text-align: center;
        white-space: nowrap;
        border-radius: .04rem;
        & + .btn_item {
          margin-left: .1rem;
        }
      }
      // 拒绝
      .reject {
      }
      // 同意
      .agree {
        border-color: $main_color;
        background: $main_color;
        color: #fff;
      }
      /* 转办 */
      .transfer {
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
