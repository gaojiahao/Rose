import { isMyflow, getListById, getListId, getWorkFlow, currentUser, getFromStatus, getAppExampleDetails } from 'service/detailService'
import { isSubscribeByRelationKey } from 'service/commentService'
import { getAppDetail, getPCCommentList } from 'service/app-basic/appSettingService'
import { saveAndCommitTask, getFormConfig, getFormViews } from 'service/common/commonService'
import { numberComma } from 'vux'
// 组件引入
import BasicInfo from 'components/detail/commonPart/BasicInfo'
import FormCell from 'components/detail/commonPart/form-part/FormCell'
import UploadFile from 'components/upload/UploadFile'
import MatterList from 'components/detail/commonPart/MatterList'
import PopMatterDetail from 'components/Popup/matter/PopMatterDetail'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import OtherPart from 'components/detail/commonPart/OtherPart'
//公共方法引入
import { accAdd } from 'plugins/calc/decimalsAdd'
import { toFixed } from '@/plugins/calc'
import platfrom from '@/plugins/platform/index'
/* 引入微信相关 */
import { register } from 'plugins/wx'
import { shareContent } from 'plugins/wx/api'

export default {
  components: {
    FormCell, BasicInfo, UploadFile, MatterList, PopMatterDetail, PriceTotal, OtherPart,
  },
  data() {
    return {
      clientHeight: document.documentElement.clientHeight,
      orderTitle: '所属订单', // 物料交易号名称
      uploadStyle: { //附件容器样式
        width: '100%',
        padding: '0.06rem 0.08rem'
      },
      uploadTitleStyle: {
        fontSize: '0.16rem',
        fontWeight: 'bold',
        color: '#111'
      },
      taskId: '',
      listId: '',
      userId: '',
      comment: '',//审批意见
      userName: '',
      transCode: '',
      formViewUniqueId: '',
      isMine: false, // 是否为我创建
      isMyTask: false,
      noOperation: true, // 是否审批过
      cancelStatus: false,
      HasValRealted: false, //相关实例是否有值为0
      cancelStatus1: false,
      showMatterDetail: false, // 是否展示物料详情弹窗
      action: {}, // 表单允许的操作
      orderList: {},
      hasUpdate: {}, //
      orderInfo: {}, // 表单内容
      currentWL: {}, // 当前工作流
      matterDetail: {}, // 选中物料的详细信息
      matterDetailIndex: 0,
      matterDetailKey: '',
      workFlowInfo: {},
      fullWL: [], // 完整工作流
      actions: [],
      attachment: [],
      matterList: [],
      dealerConfig: [],
      matterConfig: [], // 用于存放非物料的重复项配置
      otherConfig: [], // 用于存放非往来，仓库的单一项配置
      baseinfoExtConfig: [],
      fundConfig: [],
      btnIsHide: false,
      submitMatterField: [], // 审批时要提交的物料字段
      hasReviseView: false, // 当前应用表单状态是否含有修改
      currenrForm: '', //当前表单类型
      formStatus: '', // 当前表单的状态
    }
  },
  computed: {
    // 合计金额
    noTaxAmount() {
      let total = 0;
      this.orderInfo.order.dataSet.forEach(item => {
        if (item.noTaxAmount != null) {
          total = accAdd(total, item.noTaxAmount);
        }
      });
      return total;
    },
    // 税金
    taxAmount() {
      let total = 0;
      this.orderInfo.order.dataSet.forEach(item => {
        if (item.taxAmount != null) {
          total = accAdd(total, item.taxAmount);
        }
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
    // 生成随机ID
    randomID() {
      function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      }
      return (S4() + S4() + S4());
    },
    // 获取当前用户
    getCurrentUser() {
      return currentUser().then(({userId, nickname, userCode}) => {
        this.userId = `${userId}`;
        this.userName = `${nickname}-${userCode}`;
      })
    },
    // 获取listid
    getListId() {
      return getListId(this.transCode).then(data => {
        this.formViewUniqueId = data[0].uniqueId;
        this.listId = data[0].listId;
      });
    },
    // 获取当前应用是否有修改按钮
    getAction(){
      return getListById({uniqueId: this.listId}).then(data => {
        let config = data[0];
        // 当前表单状态为已生效，表单类型包含修改，当前表单状态不为修改，操作按钮包含修改时
        if (this.formStatus === '已生效' && this.currenrForm !== 'revise' && this.hasReviseView && config.action.update){
          this.actions.push('update')
        }
      })
    },
    // 获取当前应用所有表单类型
    getFormViews(){
      return getFormViews(this.listId).then(data => {
        data.forEach(item => {
          if (item.viewType === 'revise') {
            this.hasReviseView = true;
            return false;
          }
        })

      })
    },
    // 获取当前表单的状态
    getFromStatus(){
      return getFromStatus({transCode: this.transCode}).then(({tableContent = []}) => {
        this.formStatus = tableContent[0].status;
      })
    },
    // 判断是否为我的任务
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
    // 处理简易版工作流数据
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
    },
    // 处理工作流，判断审批按钮
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
        this.currentWL = flow;

        // 已终止
        if (last.status === '终止') return;

        // 判断是否有审批操作
        workFlow.filter(item => item.isFirstNode === 1).every(item => {
          // 经过审批则不能撤回
          if (operationList.includes(item.status)) {
            this.noOperation = false;
            return false
          }
          return true
        });

        // actions字段没有返回，修改固定赋值
        this.actions = ['agreement', 'disagree', 'transfer']; 
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
    // 同意、拒绝、撤回成功时的回调
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
          let {folder, fileName} = this.$route.params;
          if (fileName) {
            this.HasValRealted = true;
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
    // 是否已经关注该订单
    isSubscribeByRelationKey() {
      isSubscribeByRelationKey(this.transCode).then(data => {
        this.$emit('is-subscribe', data)
      })
    },
    async loadPage() {
      let { transCode } = this.$route.query;
      if (!transCode) {
        this.$vux.alert.show({
          content: '抱歉，交易号有误，请尝试刷新之后再次进入'
        });
        return;
      }
      this.transCode = transCode;
      this.$loading.show();
      /**
       * getBaseInfoData 接口一般用于提交页面   
       * 由于“项目任务”在详情页面 可进行“任务日志”的提交 此处是为防止重复请求
       */
      if (!this.getBaseInfoData) {
        await this.getCurrentUser();  //查询 当前用户基本信息
      }
      await this.getListId();
      await this.getFlowAndActions();
      await this.getOrderList(transCode);   // 获取表单表单详情
      await this.getFromStatus();
      await this.getFormConfig();
      await this.getFormViews();
      await this.getAction();
      await this.getCommentList();
      await this.isSubscribeByRelationKey();

      this.$loading.hide();

      // 触发父组件的scroll刷新
      this.$emit('refresh-scroll');

    },
    // 获取应用详情
    getAppDetail() {
      let {listId = ''} = this.$route.params;
      return getAppDetail(listId).then(([data = {}]) => {
        let {action} = data;
        this.action = action;
      })
    },
    // 输入框获取焦点，内容选中
    getFocus(e) {
      event.currentTarget.select();
    },
    // 审批
    saveData(formData = {}, wfPara = {}) {
      this.$vux.confirm.prompt('', {
        title: '审批意见',
        onConfirm: (value) => {
          let orderInfo = this.orderInfo;
          let jsonData = {
            listId: this.listId,
            biComment: orderInfo.biComment,
            biReferenceId: orderInfo.biReferenceId,
            formData: JSON.stringify(formData),
            wfPara: JSON.stringify({
              businessKey: this.transCode,
              createdBy: orderInfo.creator,
              transCode: this.transCode,
              result: 1,
              taskId: this.taskId,
              comment: value,
              ...wfPara,
            })
          };
          this.$HandleLoad.show();
          saveAndCommitTask(jsonData).then(data => {
            this.$HandleLoad.hide();
            let {success = false, message = '提交失败'} = data;
            if (success) {
              message = '提交成功';
              this.$emit('change', true);
            }
            this.$vux.alert.show({
              content: message,
              onHide: () => {
                if (success) {
                  this.$router.go(0);
                }
              }
            });
          });
        }
      });
    },
    // 请求配置
    getFormConfig() {
      return getFormConfig(this.formViewUniqueId).then(data => {
        this.currenrForm = data.viewType;
        let {config = [], dataSource = '[]', reconfig = {}} = data;
        console.log('config:', config);
        let ckConfig = [], rkConfig = [], dealerConfig = [], matterConfig = [], otherConfig = [], baseinfoExtConfig = [], fundConfig = [];
        let dealerFilter = [
          'dealerName_dealerDebit',
          'drDealerLabel',
          'address_dealerDebit',
          'dealerDebitContactPersonName',
          'dealerDebitContactInformation',
          'project',
          'projectType_project',
          'dealerName_dealerCodeCredit',
          'dealerCodeCredit',
          'crDealerLabel',
          'address_dealerCodeCredit',
          'dealerCreditContactPersonName',
          'dealerCreditContactInformation',
        ];
        let matterFilter = [
          'inventoryName_transObjCode',
          'transObjCode',
          'tdProcessing',
          'specification_transObjCode',
          'inventoryName_outPutMatCode',
          'outPutMatCode',
          'specification_outPutMatCode',
        ];
        let orderInfo = this.orderInfo;
        let [matterData = {}] = JSON.parse(dataSource);
        let matterSource = matterData.dataSource && JSON.parse(matterData.dataSource.source) || {};
        let matterCols = matterSource.cols || []; // 数据源列
        let dataIndexMap = {}; // 映射表
        let hasDataIndexMap = false; // 是否存在映射表
        let hideOrderTitle = false; // 是否隐藏订单号
        let listData = []; // 一维物料数组
        let submitMatterField = []; // 提交的物料参数

        // 从请求回来的配置中拆分往来，物料，其他段落的配置
        config.forEach(item => {
          if (item.formViewPartId) {
            let reconfigData = reconfig[`_${item.formViewPartId}`] || {};
            item.items = item.items && item.items.map(cItem => {
              let matched = reconfigData[cItem.fieldCode] || {};
              return {...cItem, ...matched,}
            });
          }
          if (!item.hiddenInRun && !item.isMultiple) {
            if (item.name === 'kh' || item.name === 'inPut' || item.name === 'baseinfoExt' || item.name === 'gys') {
              dealerConfig = [...dealerConfig, ...item.items]
            }
            // 出库信息
            if (item.name === 'ck') {
              // 处理 出库的仓库配置信息
              ckConfig = item.items;
              this.setWarehouseConfg(ckConfig, '出库');
            }
            // 入库信息
            if (item.name === 'rk') {
              // 处理 入库的仓库配置信息
              rkConfig = item.items;
              this.setWarehouseConfg(rkConfig, '入库');
            }
            if (item.name === 'pb' || item.name === 'outPut' || item.name === 'projectApproval' || item.name === 'jobLog' || item.name === 'projectPlanTask'){
              otherConfig = item.items;
            }
            // baseInfoExt的配置 目前用于费用报销中的项目
            if (item.name === 'baseinfoExt') {
              baseinfoExtConfig = item.items;
            }
            // 员工借款与备用金 往来的配置
            if (item.name === 'order') {
              fundConfig = item.items
            }
          } 
          else if (!item.hiddenInRun && item.isMultiple) {
            if (item.name === 'order' || item.name === 'outPut' || item.name === 'inPut') {
              // 如果为<Grid>组件 为了方便<PopMatterDetail>组件的判断 此处做数据处理
              if (item.r2GridXtype) {
                item.items.forEach(each => {
                  each['r2GridXtype'] = item.r2GridXtype;
                })
              }
              matterConfig = item.items;
              dataIndexMap = item.dataIndexMap || {};
              hasDataIndexMap = !!Object.keys(dataIndexMap).length;
            }
          }
        });
        this.judgeDealerConfig && this.judgeDealerConfig(dealerConfig);
        // 处理<往来配置>里面的渲染字段
        dealerConfig = dealerConfig.reduce((arr, item) => {
          if (!item.hiddenInRun && !dealerFilter.includes(item.fieldCode)) {
            item.fieldValue = orderInfo[item.fieldCode];
            arr.push(item);
          }
          return arr;
        }, []);
        this.dealerConfig = dealerConfig;
        // 物料相关配置
        matterConfig = matterConfig.reduce((arr, item, index) => {
          // 匹配 *映射表字段*
          let key = dataIndexMap[item.fieldCode];
          // 根据 *数据源* 查询映射表中存在字段 
          let matchedCol = matterCols.find(col => col.k === key);
          // 判断是否存在映射关系，若有映射关系，则判断是否有该字段且判断字段是否隐藏，没有映射关系则直接展示
          let needShow = key ? (matchedCol ? !item.hidden : false) : true;
          // 组合要提交的物料字段
          if (item.submitValue) {
            submitMatterField.push(item)
          }
          // 是否存在 *交易号* 判断是否显示中文抬头
          if (item.fieldCode === 'transMatchedCode') {
            this.orderTitle = item.text;
            hideOrderTitle = hasDataIndexMap && !(key && matchedCol && !matchedCol.h);
          }
          if (matterCols.length){
            if (!item.hidden && !matterFilter.includes(item.fieldCode) && needShow) {
              arr.push(item);
            }
          }
          else {
            if (!item.hidden && !matterFilter.includes(item.fieldCode)) {
              arr.push(item);
            }
          }          
          return arr
        }, []);
        this.matterConfig = matterConfig;
        this.submitMatterField = submitMatterField;
        if (Object.values(this.orderList).length) {
          listData = Object.values(this.orderList).reduce((arr, item) => {
            return [...arr, ...item]
          }, []);
          // 当科目关系取消 *按单核销* 隐藏对应的交易号
          if (hideOrderTitle) {
            this.orderList = {
              undefined: listData,
            }
          }
        } 
        else if (this.matterList.length) {
          listData = this.matterList;
        }

        //设置物料的动态渲染部分
        this.setMatterConfig(listData);

        // 此处针对 <其他部分> 表单配置 进行分割处理
        otherConfig = otherConfig.reduce((arr, item, index) => {
          if (!item.hiddenInRun) {
            arr.push(item);
          }
          return arr
        }, []);
        this.otherConfig = otherConfig;

        baseinfoExtConfig = baseinfoExtConfig.reduce((arr, item, index) => {
          if (!item.hiddenInRun) {
            arr.push(item);
          }
          return arr
        }, []);
        this.baseinfoExtConfig = baseinfoExtConfig;

        fundConfig = fundConfig.reduce((arr, item, index) => {
          if (!item.hiddenInRun) {
            arr.push(item);
          }
          return arr
        }, []);
        this.fundConfig = fundConfig;
      })
    },
    // 设置 仓库信息 动态渲染部分
    setWarehouseConfg(config = [], type = '') {
      let info = { warehouseAction: type, config: []} ;
      for (let item of config) {
        if (!item.hiddenInRun) {
          item.fieldValue = this.warehouse[item.fieldCode]
          info.config.push(item);
        }
      }
      this.warehouseConfig.push(info);      
    },
    // 设置物料的动态渲染部分
    setMatterConfig(arr) {
      let numTypeList = ['r2Numberfield', 'r2Percentfield', 'r2Permilfield'];
      let matterConfig = this.matterConfig;
      arr.forEach(matter => {
        let others = [];
        let dates = [];
        let matterComment = {};
        matterConfig.forEach(item => {
          item = {...item};

          item.value = numTypeList.includes(item.editorType) 
            ? numberComma(matter[item.fieldCode]) || '0' 
            : matter[item.fieldCode] || '无';

          if (item.editorType === 'r2Datefield') {
            dates.push(item);
          } 
          else if (item.fieldCode === 'comment') {
            matterComment = item;
          } 
          else {
            others.push(item);
          }
        });
        matter.others = others;
        matter.dates = dates;
        matter.matterComment = matterComment;
      });
    },
    // 查看更多
    onShowMore(item, index, key) {
      if (key) {
        this.matterDetailKey = key;
      }
      this.matterDetail = JSON.parse(JSON.stringify(item));
      this.matterDetailIndex = index;
      this.showMatterDetail = true;
    }
  },
  created() {
    register()
    this.loadPage();
  },
  mounted() {
    //解决android键盘收起input没有失去焦点，底部按钮遮挡输入框
    if (platfrom.isAndroid) {
      window.onresize = () => {
        //底部按钮隐藏
        this.btnIsHide = this.clientHeight > document.documentElement.clientHeight;
      }
    }
  }
}
