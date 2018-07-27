<template>
  <!-- 审批操作 -->
  <div class="handle_btn" v-if="show">
    <span class="reject" @click="reject" v-if="actions.includes('agreement')">拒绝</span>
    <span class="agree" @click="agree" v-if="actions.includes('agreement')">同意</span>
    <span class="reject" @click="stop" v-if="actions.includes('stop')">终止</span>
    <span class="agree" @click="resubmit" v-if="actions.includes('resubmit')">重新提交</span>
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
            this.$emit('on-reject', JSON.stringify({
              taskId: this.taskId,
              comment: value,
            }));
            this.$vux.confirm.hide();
          }
        });
      },
      // TODO 同意
      agree() {
        this.$vux.confirm.prompt('', {
          title: '审批意见',
          onConfirm: (value) => {
            this.$emit('on-agree', JSON.stringify({
              taskId: this.taskId,
              comment: value,
            }));
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
    },
    created() {
      this.isMyflow();
    }
  }
</script>

<style scoped lang="scss">
  // 审批操作
  .handle_btn {
    width: 100%;
    height: .4rem;
    margin: .2rem 0;
    line-height: .4rem;
    text-align: center;
    span {
      width: 1.4rem;
      color: #fff;
      text-align: center;
      display: inline-block;
      border-radius: .24rem;
    }
    // 拒绝
    .reject {
      margin-right: .2rem;
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
