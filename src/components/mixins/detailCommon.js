import {getWorkFlow, currentUser, getListId, isMyflow, getAppExampleDetails} from 'service/detailService'
import { getPCCommentList } from 'service/commentService'
import {numberComma} from 'vux'
// 组件引入
import BasicInfo from 'components/detail/commonPart/BasicInfo'
import FormCell from 'components/detail/commonPart/FormCell'
import UploadFile from 'components/upload/UploadFile'

// 映射表 引入
import Apps from '@/home/pages/maps/businessApp'
//公共方法引入
import {accAdd} from '@/home/pages/maps/decimalsAdd.js'
import {toFixed} from '@/plugins/calc'
/* 引入微信相关 */
import {register} from 'plugins/wx'
import { shareContent } from 'plugins/wx/api'

export default {
  components: {
    FormCell, BasicInfo,UploadFile
  },
  data() {
    return {
      transCode: '',
      comment: '',//审批意见
      taskId: '',
      listId: '',
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
      HasValRealted: false,//相关实例是否有值为0
      orderInfo: {}, // 表单内容
      uploadStyle: { //附件容器样式
        width :'100%',
        padding : '0.06rem 0.08rem'
      },
      uploadTitleStyle: {
        fontSize : '0.16rem',
        fontWeight : 'bold',
        color : '#111'
      },
      attachment: [],
    }
  },
  computed: {
    // 合计金额
    noTaxAmount() {
      let total = 0;
      this.orderInfo.order.dataSet.forEach(item => {
        total = accAdd(total, item.noTaxAmount);
      });
      return total;
    },
    // 税金
    taxAmount() {
      let total = 0;
      this.orderInfo.order.dataSet.forEach(item => {
        total = accAdd(total, item.taxAmount);
      });
      return total;
    },
  },
  filters: {
    numberComma,
    toFixed,
  },
  methods: {
    //跳转到相关实例
    getSwiper() {
      this.$router.push({
        path: `/related/${this.listId}`,
        query: {
          transCode: this.transCode,
          uniqueId: this.formViewUniqueId,
        }
      })
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
        case '草稿':
          newkey = 'dyClass';
          this.workFlowInfo[newkey] = 'invalid_work';
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

        // 判断是否有审批操作
        workFlow.filter(item => item.isFirstNode === 1).every(item => {
          // 经过审批则不能撤回
          if (operationList.includes(item.status)) {
            this.noOperation = false;
            return false
          }
          return true
        });

        // this.actions = actions.split(',');
        this.actions = ['agreement', 'disagree']; // actions字段没有返回，修改固定赋值
        // 判断是否为我创建的任务
        if (createFlow.isFirstNode === 0 && createFlow.startUserId === this.userId) {
          this.isMine = true;
          // 如果没有审批操作，则删除拒绝，加入撤回
          if (this.noOperation) {
            this.actions.splice(this.actions.findIndex(item => item === 'disagree'), 1, 'revoke');
          }
        }

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
      let type = JSON.parse(val).type;
      if (type !== 'revoke') {
        this.$emit('change', true);
      }
    },
    // 获取相关实例
    getAppExampleDetails() {
      return getAppExampleDetails({
        transCode: this.transCode,
        listId: this.listId
      }).then(data => {
        let relatedApply = data.relevantItems;
        relatedApply.forEach(item => {
          let { fileId, listId } = this.$route.params;
          if (Apps[fileId][listId]) {
            this.HasValRealted = true;
            // if (item.itemCount > 0) {
            //   this.HasValRealted = true;
            // }
          }
        })
      })
    },
    // 请求评论列表
    getCommentList() {
      return getPCCommentList({
        relationKey: this.transCode
      }).then(({dataCount = 0}) => {
        // 跨组件传值
        this.$event.$emit('commentCount', dataCount);
      })
    },
    async loadPage() {
      let { transCode, name } = this.$route.query;
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
      //获取与当前订单相关的实例
      await this.getAppExampleDetails();
      // 获取表单表单详情
      await this.getOrderList(transCode);
      await this.getCommentList();
      this.$loading.hide();
      // 触发父组件的scroll刷新
      this.$emit('refresh-scroll');
      wx.ready(() => {
        // 分享
        let shareInfo = {
          title: `点击查看${name}详情`, 
          desc: `点击查看${name}详情，哈哈哈哈`,
          imgUrl : 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=888178039,2627708353&fm=26&gp=0.jpg'
          // imgUrl: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1542258659397&di=ce722db1d3d4d79259a2b6cd4de9879b&imgtype=0&src=http%3A%2F%2Fimg.zcool.cn%2Fcommunity%2F01851855f282cf6ac7251df8d15ea0.png%401280w_1l_2o_100sh.png'
          // imgUrl: `http://${document.domain}/dist/resources/images/icon/goods-sales-contract.jpg`
        }
        shareContent(shareInfo);
      })
    },
  },
  created() {
    register()
    this.loadPage();
  }
}
