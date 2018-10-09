<template>
  <!-- 审批操作 -->
  <div class='handle_wrapper vux-1px-t'>
    <div class="handle_btn" v-if="!!actions.length">
      <span class="reject" @click="revoke" v-if="actions.includes('revoke')">撤回</span>
      <span class="reject" @click="reject" v-if="actions.includes('disagree')">拒绝</span>
      <span class="agree" @click="agree" v-if="actions.includes('agreement')">同意</span>
    </div>
  </div>
</template>

<script>
  import {commitTask} from 'service/commonService'
  // import Apps from '@/home/pages/apps/bizApp/maps/Apps'
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
      name:{
        type : String,
        default :''
      }
    },
    data() {
      return {
        show: true,
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
                let { fileId, listId } = this.$route.params;
                this.$router.replace({
                  path: `/fillform/${fileId}/${listId}`,
                  query: { transCode: this.code ,name : this.name},
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
                  this.$router.go(-1);
                }
              }
            }
          });
        }).catch(e => {
          this.$HandleLoad.hide();
        });
      }
    }
  }
</script>

<style scoped lang="scss">
  .handle_wrapper {
    background: #FFF;
    overflow: hidden;
  }
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
