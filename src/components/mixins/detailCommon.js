import {getWorkFlow, currentUser} from 'service/detailService.js'
import {commitTask} from 'service/commonService.js'

export default {
  data() {
    return {
      comment: '',//审批意见
      taskId: '',
      userId: '',
      cancelStatus: false,
      cancelStatus1: false
    }
  },
  methods: {
    //同意
    taskAgree() {
      this.$vux.confirm.prompt('', {
        title: '审批意见',
        onConfirm: (value) => {
          if (value) {
            console.log(value);
            this.comment = value;
          }
          let submitData = {
            taskId: this.taskId,
            taskData: JSON.stringify({result: 1, transCode: this.transCode, comment: this.comment})
          }
          commitTask(submitData).then(data => {
            let {success = false, message = '提交失败'} = data;
            if (success) {
              message = '提交成功';
              this.$emit('change', true)
            }
            this.$vux.alert.show({
              content: message,
              onHide: () => {
                if (success) {
                  this.$router.go(-1);
                }
              }
            });
          })
        }
      })
    },
    //拒绝
    taskReject() {
      this.$vux.confirm.prompt('', {
        title: '审批意见',
        onConfirm: (value) => {
          if (value) {
            this.comment = value;
          }
          let submitData = {
            taskId: this.taskId,
            taskData: JSON.stringify({result: 0, transCode: this.transCode, comment: this.comment})
          };
          commitTask(submitData).then(data => {
            let {success = false, message = '提交失败'} = data;
            if (success) {
              message = '拒绝成功';
              this.$emit('change', true);
            }
            this.$vux.alert.show({
              content: message,
              onHide: () => {
                if (success) {
                  this.$router.go(-1);
                }
              }
            });
          })
        }
      })
    },
    //撤回
    taskCancel() {
      let {code} = this.$route.params;
      this.$vux.confirm.prompt('', {
        title: '撤回原因',
        onConfirm: (value) => {
          if (value) {
            this.comment = value;
          }
          let submitData = {
            taskId: this.taskId,
            taskData: JSON.stringify({
              result: 2,
              transCode: this.transCode,
              comment: this.comment
            })
          }
          commitTask(submitData).then(data => {
            let {success = false, message = '提交失败'} = data;
            if (success) {
              message = '撤回成功';
              this.$emit('change', true);
            }
            this.$vux.alert.show({
              content: message,
              onHide: () => {
                if (success) {
                  this.$router.replace({
                    path: `/list/${code}/fillform`,
                    query: {
                      transCode: this.transCode
                    }
                  })
                }
              }
            });
          })
        }
      })
    },
    // 获取工作流
    getWorkFlow(transCode = '') {
      getWorkFlow({
        _dc: this.randomID(),
        transCode
      }).then(({tableContent}) => {
        // 赋值 完整版工作流
        this.fullWL = tableContent;
        // console.log(this.orderInfo.biStatus);
        // if(tableContent[0].isFirstNode === 0 && tableContent[0].startUserId === this.userId && !tableContent[1].status){
        //   this.cancelStatus = true;
        // }
        // 赋值 简化版工作流 只取数据的最后两条

        for (let item of tableContent) {
          if (item.isFirstNode === 0 && item.startUserId === this.userId) {
            this.cancelStatus = true;
          }
          if (item.isFirstNode === 1 && !item.status) {
            this.cancelStatus1 = true
          }
          switch (item.status) {
            case '同意':
              item.dyClass = 'agree_c';
              break;
            case '终止':
              item.dyClass = 'reject_c'
              break;
          }
        }
        this.simpleWL = tableContent.slice(-2);
      })
    },
    getCurrentUser() {
      return currentUser().then(data => {
        this.userId = JSON.stringify(data.userId);
      })
    }
  },
  created() {
    (async () => {
      let {transCode} = this.$route.query;
      if (!transCode) {
        this.$vux.alert.show({
          content: '抱歉，交易号有误，请尝试刷新之后再次进入'
        })
        return;
      }
      this.transCode = transCode;
      //查询当前用户的userId
      await this.getCurrentUser();
      // 获取表单表单详情
      this.getOrderList(transCode);
      this.getWorkFlow(transCode);
    })()
  }
}
