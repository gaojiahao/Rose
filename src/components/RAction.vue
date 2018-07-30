<template>
  <!-- 审批操作 -->
  <div class="handle_btn" v-if="show || hasRevoke">
    <span class="reject" @click="reject" v-if="show && actions.includes('disagree')">拒绝</span>
    <span class="agree" @click="agree" v-if="show && actions.includes('agreement')">同意</span>
    <span class="reject" @click="revoke" v-if="hasRevoke">撤回</span>
  </div>
</template>

<script>
  import {isMyflow} from 'service/detailService'
  import {saveAndCommitTask, commitTask} from 'service/commonService'

  export default {
    name: "RAction",
    props: {
      code: {
        type: String,
        default: ''
      },
      hasRevoke: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        show: true,
        actions: [],
        taskId: ''
      }
    },
    methods: {
      // 流程节点是否与<我>有关
      isMyflow() {
        return isMyflow({
          _dc: Date.now(),
          transCode: this.code,
        }).then(({tableContent = []}) => {
          let [action = {}] = tableContent;
          let {actions = '', isMyTask = 0, taskId} = action;
          this.show = isMyTask === 1;
          this.actions = actions.split(',');
          this.taskId = taskId;
        })
      },
      // TODO 拒绝
      reject() {
        this.$vux.confirm.prompt('', {
          title: '审批意见',
          closeOnConfirm: false,
          onConfirm: (value) => {
            if (!value) {
              return false;
            }
            this.commitTask({
              result: 0,
              successMsg: '拒绝成功',
              value
            });
            // this.$emit('on-reject', JSON.stringify({
            //   taskId: this.taskId,
            //   comment: value,
            // }));
            this.$vux.confirm.hide();
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
            // this.$emit('on-agree', JSON.stringify({
            //   taskId: this.taskId,
            //   comment: value,
            // }));
          }
        });
      },
      // TODO 终止
      stop() {
        this.$vux.confirm.prompt('', {
          title: '终止原因',
          closeOnConfirm: false,
          onConfirm: (value) => {
            if (!value) {
              return false;
            }
            this.$emit('on-stop', JSON.stringify({
              taskId: this.taskId,
              comment: value,
            }));
            this.$vux.confirm.hide();
          }
        });
      },
      // TODO 重新提交
      resubmit() {
        this.$emit('on-resubmit', this.taskId);
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
                let {code} = this.$route.params;
                this.$router.replace({
                  path: `/list/${code}/fillform`,
                  query: {
                    transCode: this.code
                  }
                });
              }
            });
          }
        });
      },
      // TODO 审批
      commitTask({result, value, successMsg, callback}) {
        let submitData = {
          taskId: this.taskId,
          taskData: JSON.stringify({
            result,
            transCode: this.code,
            comment: value
          })
        };
        return commitTask(submitData).then(data => {
          let {success = false, message = '提交失败'} = data;
          if (success) {
            message = successMsg;
            this.$emit('on-submit-success', JSON.stringify({
              type: result === 0 ? 'reject' : 'agree'
            }));
          }
          this.$vux.alert.show({
            content: message,
            onHide: () => {
              if (success) {
                if (callback) {
                  callback();
                } else {
                  this.$router.go(-1);
                }
              }
            }
          });
        });
      },
    },
    created() {
      this.isMyflow();
    }
  }
</script>

<style scoped lang="scss">
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
  }
</style>
