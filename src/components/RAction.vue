<template>
  <!-- 审批操作 -->
  <div class='handle_wrapper'>
    <div class="handle_btn" v-if="!!actions.length">
      <span class="reject" @click="revoke" v-if="actions.includes('revoke')">撤回</span>
      <span class="reject" @click="reject" v-if="actions.includes('disagree')">拒绝</span>
      <span class="agree" @click="agree" v-if="actions.includes('agreement')">同意</span>
    </div>
     <!-- 操作时加载动画-->
    <submit-load :submit='submitLoadding'></submit-load>
  </div>
  
</template>

<script>
  import {commitTask} from 'service/commonService'
  import SubmitLoad from 'components/submitLoading'
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
    },
    data() {
      return {
        show: true,
        submitLoadding :false
      }
    },
    components:{
       SubmitLoad
    },
    methods: {
      // TODO 拒绝
      reject() {
        this.$vux.confirm.prompt('', {
          title: '审批意见',
          // closeOnConfirm: false,
          onConfirm: (value) => {
            // if (!value) {
            //   return false;
            // }
            this.commitTask({
              result: 0,
              successMsg: '拒绝成功',
              value
            });
            // this.$vux.confirm.hide();
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
        this.submitLoadding = true;
        let submitData = {
          taskId: this.taskId,
          taskData: JSON.stringify({
            result,
            transCode: this.code,
            comment: value
          })
        };
        return commitTask(submitData).then(data => {
          this.submitLoadding = false;
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
        }).catch( e=>{
          this.submitLoadding = false;
        });
      },
    },
    created() {
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
