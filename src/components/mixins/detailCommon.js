import {getWorkFlow, currentUser, getListId, isMyflow} from 'service/detailService.js'
import {commitTask} from 'service/commonService.js'

export default {
  data() {
    return {
      transCode: '',
      comment: '',//审批意见
      taskId: '',
      userId: '',
      userName: '',
      cancelStatus: false,
      cancelStatus1: false,
      isMyTask: false,
      nodeName: '',
      formViewUniqueId: '',
      fullWL: [], // 完整工作流
      workFlowInfo: {},
    }
  },
  methods: {
    // TODO 生成随机ID
    randomID() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }

      return (S4() + S4() + S4());
    },
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
          };
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

        for (let item of tableContent) {
          if (item.isFirstNode === 0 && item.startUserId === this.userId) {
            this.cancelStatus = true;
          }
          if (item.isFirstNode === 1 && !item.status) {
            this.cancelStatus1 = true
          }
        }
      })
    },
    // TODO 获取当前用户
    getCurrentUser() {
      return currentUser().then(({userId, nickname, userCode}) => {
        this.userId = `${userId}`;
        this.userName = `${nickname}-${userCode}`;
      })
    },
    // TODO 获取listid
    getListId() {
      return getListId(this.transCode).then(data => {
        this.formViewUniqueId = data[0].uniqueId;
      });
    },
    // TODO 判断是否为我的任务
    isMyflow() {
      return isMyflow({
        _dc: this.randomID(),
        transCode: this.transCode
      }).then(({tableContent = []}) => {
        let [data = {}] = tableContent;
        let {isMyTask = 0, actions, taskId, viewId} = data;
        this.taskId = taskId;
        this.isMyTask = isMyTask === 1;
        if (!this.isMyTask) {
          return
        }
        this.nodeName = actions;
        this.formViewUniqueId = viewId;
      });
    },
    workFlowInfoHandler() {
      let orderInfo = {...this.orderInfo};
      this.workFlowInfo = {
        biStatus: orderInfo.biStatus,
        transCode: orderInfo.transCode,
      };
      switch (orderInfo.biStatus) {
        case '进行中':
          let newkey = 'dyClass',
            cokey = 'coClass';
          this.workFlowInfo[newkey] = 'doing_work';
          this.workFlowInfo[cokey] = 'doing_code';
          break;
        case '已失效':
          newkey = 'dyClass';
          this.workFlowInfo[newkey] = 'invalid_work';
          break;
      }
    },
  },
  created() {
    (async () => {
      let {transCode} = this.$route.query;
      if (!transCode) {
        this.$vux.alert.show({
          content: '抱歉，交易号有误，请尝试刷新之后再次进入'
        });
        return;
      }
      this.transCode = transCode;
      //查询当前用户的userId
      await this.getCurrentUser();
      await this.getListId();
      // 流程节点是否与<我>有关
      await this.isMyflow();
      // 获取表单表单详情
      this.getOrderList(transCode);
      this.getWorkFlow(transCode);
    })()
  }
}
