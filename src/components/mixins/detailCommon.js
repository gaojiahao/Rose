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
      formViewUniqueId: '',
      fullWL: [], // 完整工作流
      workFlowInfo: {},
      actions: [],
      isMine: false, // 是否为我创建
      noOperation: true, // 是否审批过
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
      });
    },
    // 获取工作流
    getWorkFlow() {
      return getWorkFlow({
        _dc: this.randomID(),
        transCode: this.transCode,
      })
    },
    // TODO 处理简易版工作流数据
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
    // TODO 处理工作流，判断审批按钮
    getFlowAndActions() {
      return Promise.all([this.isMyflow(), this.getWorkFlow()]).then(([data = {}, data2 = {}]) => {
        let myFlow = data.tableContent || [];
        let workFlow = data2.tableContent || [];
        let [flow = {}] = myFlow;
        let {isMyTask = 0, actions = '', taskId, viewId} = flow;

        let [createFlow = {}] = workFlow;
        let operationList = ['同意', '不同意']; // 操作列表的status

        // 赋值 完整版工作流
        this.fullWL = workFlow;

        this.actions = actions.split(',');
        // 判断是否为我创建的任务
        if (createFlow.isFirstNode === 0 && createFlow.startUserId === this.userId) {
          this.isMine = true;
          // 删除拒绝，加入撤回
          this.actions.splice(this.actions.findIndex(item => item === 'disagree'), 1, 'revoke');
        }

        // 判断是否有审批操作
        workFlow.filter(item => item.isFirstNode === 1).every(item => {
          // 经过审批则不能撤回
          if (operationList.includes(item.status)) {
            this.noOperation = false;
            return false
          }
          return true
        });

        this.taskId = taskId;
        this.isMyTask = isMyTask === 1;
        // 不为我审批
        if (!this.isMyTask) {
          this.actions = this.isMine && this.noOperation ? ['revoke'] : [];
          return
        }
        this.formViewUniqueId = viewId;
      })
    }
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
      await this.getFlowAndActions();
      // 获取表单表单详情
      this.getOrderList(transCode);
    })()
  }
}
