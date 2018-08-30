import {getWorkFlow, currentUser, getListId, isMyflow,getAppExampleDetails} from 'service/detailService.js'
import {numberComma} from 'vux'
import {toFixed} from '@/plugins/calc'
// 映射表 引入
import businessMap from '@/msg/pages/maps/businessApp'
export default {
  data() {
    return {
      transCode: '',
      comment: '',//审批意见
      taskId : '',
      listId : '',
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
      RelatedAppList : [] ,//相关实例所有数据
      HasValRealted : false,//相关实例是否有值为0
      detailSwiper : null,
      filtersData : [],
      showPop : false,
    }
  },
  filters: {
    numberComma,
    toFixed,
  },
  methods: {
    //显示相关实例的pop
    getRelatedData(item){
      console.log(item);
      if(item.itemCount>0){
        this.listId = item.listId;
        this.showPop = true;
        item.content.forEach(val=>{
          this.filtersData.push(val.transCode);
        })
      }
    },
    //选中相关实例的Swiper
    getSwiper(){
      this.detailSwiper.slideTo(1)
    },
    //重新加载页面
    reloadPage(){
      this.$loading.show();
      // this.$emit('input',true)
    },
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
        this.listId = data[0].listId;
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
      this.$loading.hide();
    },
    // TODO 处理工作流，判断审批按钮
    getFlowAndActions() {
      return Promise.all([this.isMyflow(), this.getWorkFlow()]).then(([data = {}, data2 = {}]) => {
        let myFlow = data.tableContent || [];
        let workFlow = data2.tableContent || [];
        let [flow = {}] = myFlow;
        let {isMyTask = 0, actions = '', taskId, viewId} = flow;

        let [createFlow = {}] = workFlow;
        let last = workFlow[workFlow.length - 1] || {};
        let operationList = ['同意', '不同意']; // 操作列表的status

        // 赋值 完整版工作流
        this.fullWL = workFlow;

        // 已终止
        if (last.status === '终止') {
          return
        }

        // this.actions = actions.split(',');
        this.actions = ['agreement', 'disagree']; // actions字段没有返回，修改固定赋值
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
    },
    // TODO 同意、拒绝、撤回成功时的回调
    submitSuccessCallback(val) {
      console.log(val);
      let type = JSON.parse(val).type;
      if(type !== 'revoke'){
        this.$emit('change', true);
      }
    },
    //TODO 获取相关实例
    getAppExampleDetails(){
       return getAppExampleDetails({
        transCode :this.transCode,
        listId :this.listId
      }).then(data=>{
        let relatedApply = data.relevantItems;
        relatedApply.forEach(item=>{
          if(businessMap[item.listName]){
           this.RelatedAppList.push(item);
           if(item.itemCount > 0){
             this.HasValRealted = true;

           }
          }
        })
      })
    },
    async loadPage() {
      let {transCode} = this.$route.query;
      if (!transCode) {
        this.$vux.alert.show({
          content: '抱歉，交易号有误，请尝试刷新之后再次进入'
        });
        return;
      }
      this.transCode = transCode;
      this.$loading.show();
      //查询当前用户的userId
      await this.getCurrentUser();
      await this.getListId();
      await this.getFlowAndActions();
      await this.getAppExampleDetails();
      // 获取表单表单详情
      await this.getOrderList(transCode);
      let Swiper = this.Swiper;
      this.$nextTick(()=>{
        this.detailSwiper = new Swiper ('.swiper-container', {
          click:true,
          // 如果需要分页器
          pagination: {
            el: '.swiper-pagination',
          },

        })

      })
      this.$loading.hide();
      // 触发父组件的scroll刷新
      this.$emit('refresh-scroll');
    },
  },
  created() {
    this.loadPage();
  },
  mounted() {



  },
}
