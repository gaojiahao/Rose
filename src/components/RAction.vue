<template>
  <!-- 审批操作 -->
  <div class='handle_wrapper vux-1px-t'>
    <div class="handle_btn" v-if="!!actions.length">
      <span class="reject" @click="revoke" v-if="actions.includes('revoke')">撤回</span>
      <span class="reject" @click="reject" v-if="actions.includes('disagree')">拒绝</span>
      <span class="agree" @click="agree" v-if="actions.includes('agreement')">同意</span>
      <span class="transfer" @click="transfer" v-if="actions.includes('transfer')">转办</span>
    </div>
    <pop-user-list :show="showUserList" :default-value="selectedUser" @sel-item="selUser"
                   v-model="showUserList" v-if="actions.includes('transfer')"></pop-user-list>
    <div v-transfer-dom>
      <confirm class="action-confirm" title="转办" @on-confirm="onConfirm" v-model="showConfirm">
        <div class="confirm-item">
          <span class="title">转办给: </span>
          <span>{{selectedUser.nickname}}</span>
        </div>
        <div class="confirm-item">
          <span class="title">工时: </span>
          <input type="number" class="value" v-model.number="transferInfo.taskTime">
        </div>
        <div class="confirm-item">
          <span class="title">备注: </span>
          <input type="text" class="value" v-model="transferInfo.comment">
        </div>
      </confirm>
    </div>
  </div>
</template>

<script>
  import {commitTask, transferTask} from 'service/commonService'
  import {Confirm} from 'vux'
  import PopUserList from 'components/Popup/PopUserList'

  export default {
    name: "RAction",
    props: {
      code: {
        type: String,
        default: ''
      },
      taskId: {
        type: String,
        default: ''
      },
      actions: {
        type: Array,
        default() {
          return []
        }
      },
      name: {
        type: String,
        default: ''
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
      }
    },
    methods: {
      // TODO 拒绝
      reject() {
        this.$vux.confirm.prompt('', {
          title: '审批意见',
          onConfirm: (value) => {
            this.commitTask({
              result: 0,
              successMsg: '拒绝成功',
              value
            });
          }
        });
      },
      // TODO 同意
      agree() {
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
      // TODO 撤回
      revoke() {
        this.$vux.confirm.prompt('', {
          title: '撤回原因',
          onConfirm: (value) => {
            this.commitTask({
              result: 2,
              successMsg: '撤回成功',
              value,
              callback: () => {
                let {fileId, listId} = this.$route.params;
                this.$router.replace({
                  path: `/fillform/${fileId}/${listId}`,
                  query: {transCode: this.code, name: this.name},
                });
              }
            });
          }
        });
      },
      // TODO 审批
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
      // TODO 转办
      transfer() {
        this.selectedUser = {};
        this.showUserList = true;
      },
      // TODO 选中转办账号
      selUser(val) {
        this.selectedUser = {...val};
        this.showConfirm = true;
      },
      // TODO 点击confirm确定
      onConfirm() {
        let submitData = {
          userId: this.selectedUser.userId,
          taskId: this.taskId,
          ...this.transferInfo,
        };
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
  }
</script>

<style scoped lang="scss">
  .handle_wrapper {
    background: #FFF;
    overflow: hidden;
    // 审批操作
    .handle_btn {
      display: flex;
      width: 100%;
      height: .4rem;
      margin: .2rem 0;
      padding: 0 .2rem;
      line-height: .4rem;
      text-align: center;

      justify-content: center;
      box-sizing: border-box;
      span {
        margin-right: .2rem;
        display: inline-block;
        width: 1.4rem;
        color: #fff;
        text-align: center;
        border-radius: .24rem;
        &:last-child {
          margin-right: 0;
        }
      }
      // 拒绝
      .reject {
        /*margin-right: .2rem;*/
        background: #ea5455;
        box-shadow: 0 2px 5px #ea5455;
      }
      // 同意
      .agree {
        background: #5077aa;
        box-shadow: 0 2px 5px #5077aa;
      }
      /* 转办 */
      .transfer {
        background-color: #ccc;
        box-shadow: 0 2px 5px #ccc;
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
    .title {
      display: inline-block;
      width: .6rem;
    }
    .value {
      flex: 1;
      border: 1px solid #dedede;
      border-radius: .05rem;
      padding: .04rem .05rem;
      -webkit-appearance: none;
      appearance: none;
      outline: none;
      font-size: 16px;
    }
  }
</style>
