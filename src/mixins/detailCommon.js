// 请求 引入
import { 
  isMyflow, 
  getListId, 
  getListById, 
  listTaskLogByTransCode, 
  getFromStatus, 
  getAppExampleDetails 
} from 'service/detailService'
import { isSubscribeByRelationKey } from 'service/commentService'
import { getAppDetail, getPCCommentList } from 'service/app-basic/appSettingService'
import { getFormViews, getFormConfig, saveAndCommitTask, getBasicInfo, findConfigInfo,getFormViewByUniqueId} from 'service/commonService'
// vux 引入
import { numberComma } from 'vux'
// 组件 引入
import UploadFile from 'components/upload/UploadFile'
import BasicInfo from 'components/detail/commonPart/BasicInfo'
import OtherPart from 'components/detail/commonPart/OtherPart'
import MatterList from 'components/detail/commonPart/MatterList'
import PriceTotal from 'components/detail/commonPart/PriceTotal'
import PopMatterDetail from 'components/Popup/matter/PopMatterDetail'
import FormCell from 'components/detail/commonPart/form-part/FormCell'
// 插件 引入
import { toFixed } from '@/plugins/calc'
import platfrom from '@/plugins/platform/index'
import { accAdd } from 'plugins/calc/decimalsAdd'
// 企业微信 JS-SDK 引入
import { register } from 'plugins/wx'
import { corpid, secret, agentid, redirect_uri,redirect_uri_share } from '@/plugins/ajax/conf'
import {shareContent } from 'plugins/wx/api'

export default {
  components: {
    FormCell, OtherPart, BasicInfo, UploadFile,
    MatterList, PriceTotal, PopMatterDetail, 
  },
  data() {
    return {
      orderTitle: '所属订单', // 物料交易号名称
      clientHeight: document.documentElement.clientHeight,
      uploadStyle: { //附件容器样式
        width: '100%',
        padding: '.06rem .08rem'
      },
      uploadTitleStyle: {
        color: '#111',
        fontSize: '.16rem',
        fontWeight: 'bold',
      },
      taskId: '',
      listId: null,
      userId: '',
      comment: '',                        // 审批意见
      userName: '',
      transCode: '',
      formStatus: '',                     // 当前表单的状态
      currenrForm: '',                    // 当前表单类型
      formViewUniqueId: '',
      action: {},                         // 表单允许的操作
      orderList: {},                      // 按订单划分的物料列表
      orderInfo: {},                      // 表单内容
      currentWL: {},                      // 当前工作流
      matterDetail: {},                   // 选中物料的详细信息
      workFlowInfo: {},                   // 工作流 相关信息
      fullWL: [],                         // 完整工作流
      actions: [],                        // 审批动作（修改、提交、拒绝等）
      attachment: [],                     // 附件
      matterList: [],                     // 物料列表
      fundConfig: [],                     // 借款与备用金 相关配置
      otherConfig: [],                    // 用于存放非往来，仓库的单一项配置
      dealerConfig: [],                   // 往来 相关配置
      matterConfig: [],                   // 物料相关配置
      warehouseConfig: [],                //仓库配置
      baseinfoExtConfig: [],              // baseinfoExt相关配置（此处可能会存放*往来相关配置*）
      submitMatterField: [],              // 审批时要提交的物料字段
      isMine: false,                      // 是否 为我创建
      isMyTask: false,                    // 是否 为我的审批节点
      btnIsHide: false,                   // 针对Android端优化 是否显示底部按钮
      noOperation: true,                  // 是否审批过
      hasReviseView: false,               // 当前表单是否可以修改
      HasValRealted: false,               // 相关实例是否有值为0
      showMatterDetail: false,            // 是否展示物料详情弹窗
      config: [],
      baseinfoConfig: {},                 //baseinfo配置
      viewInfo:[],
      formStatusArr:[],
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
  filters: { toFixed, numberComma },
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
    // 获取listid
    getListId() {
      // return getListId(this.transCode).then(data => {
      //   this.formViewUniqueId = data[0].uniqueId;
      //   this.listId = data[0].listId;
      // });
      return new Promise((resolve, reject) => {
        getListId(this.transCode).then(data => {
          if (data.length) {
            this.formViewUniqueId = data[0].uniqueId;
            this.viewId = data[0].uniqueId;
            this.listId = data[0].listId;
            //this.model = "view"; //查看视图
            resolve();
          } else {
            this.$vux.alert.show({
              content: "抱歉，交易号有误，没有数据可以查看"
            });
          }
        });
      });
    },
    // 获取当前应用是否有修改按钮
    getAction() {
      return getListById({ uniqueId: this.listId }).then(data => {
        let [ config = {} ] = data;
        // 判断 审批动作是否应该包含 *修改*
        if (this.formStatus === '已生效' && this.currenrForm !== 'revise' && this.hasReviseView && config.action.update) {
          this.actions.push('update')
        }
      })
    },
    // 获取 当前应用所有表单视图
    getFormViews() {
      return getFormViews(this.listId).then(data => {
        for (let item of data) {
          if (item.viewType === 'revise') {
            this.hasReviseView = true;
            break;
          }
        }
      })
    },
    // 获取 当前表单的状态
    getFromStatus() {
      return getFromStatus({transCode: this.transCode}).then(({tableContent = []}) => {
        this.formStatus = tableContent[0].status;
        this.formStatusArr = tableContent;
        this.showAction = true;
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
    getTaskLogs() {
      return listTaskLogByTransCode({
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
      return Promise.all([this.isMyflow(), this.getTaskLogs()]).then(([data = {}, data2 = {}]) => {
        let myFlow = data.tableContent || [];
        let workFlow = data2.tableContent || [];
        let [flow = {}] = myFlow;
        let {isMyTask = 0, actions = '', taskId, viewId} = flow;
        let [createFlow = {}] = workFlow;
        let last = workFlow[workFlow.length - 1] || {};
        let operationList = ['同意', '不同意']; // 操作列表的status
        if(data.tableContent.length) {
          this.actions = data.tableContent[0].actions || [];
          if(this.actions.length) {
            this.actions = this.actions.split(',')
          }
        }
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
        if(this.actions.length){
          this.actions.push('transfer')
        } else {
          this.actions = ['agreement', 'disagree', 'transfer']; 
        }
        //this.actions = ['agreement', 'disagree', 'transfer']; 
        // 判断是否为我创建的任务
        if (createFlow.isFirstNode === 0 && createFlow.startUserId === this.userId) { 
          this.isMine = true;
          // 如果没有审批操作，则删除拒绝，加入撤回
          if (this.noOperation) {
            this.actions.push('revoke')
            //this.actions.splice(this.actions.findIndex(item => item === 'disagree'), 1, 'revoke');
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
          let { fileName } = this.$route.params;
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
        this.$emit('subscribeChange', data)
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
      await this.getBasicInfo(); // 用户信息，ds服务器地址，是否客户端
      await this.getListId();// listid,viewId信息
     
      await this.getFlowAndActions();// 流程信息,有可能替换viewId
      await this.getOrderList(transCode);// 获取表单表单详情
      await this.getFromStatus();// 表单状态
      await this.getFormConfig();// 表单配置
      await this.loadFormCfg();
      await this.getFormViews();// 所有的视图列表
      await this.getAction();// 获取列表权限
      await this.getCommentList();// 请求评论列表
      //await this.getAppExampleDetails();// 获取相关实例
      await this.isSubscribeByRelationKey(); //是否订阅

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
    //请求baseinfo配置
    getBasicInfo() {
      return getBasicInfo().then(data => {
        let {currentUser} = data;
        this.baseinfoConfig = data;
        this.userId = `${currentUser.userId}`;
        this.userName = `${currentUser.nickname}-${currentUser.userCode}`;
      });  
    },
    //请求二次配置
    findConfigInfo() {
      return findConfigInfo(this.formViewUniqueId).then(data => {
        if(this.baseinfoConfig.clientFlag) {
          this.getNewFormConfig(this.config,data.data);
        }
      });
    },
    //二次配置覆盖
    getNewFormConfig(old,New) {
      let firstCongif = old;
      New = JSON.parse(New)
      let containerCfg =  New && New.container,
          fieldsCfg = New && New.fields;
      if(New){
        if(JSON.stringify(New.form) != '{}') {
          old = New.form;
        }; 
        for(let i = 0; i < old.length; i++) {
          let name = old[i].name,
          isList = old[i].isMultiple,
          fields = old[i].items,
          grid;

          if ((JSON.stringify(fieldsCfg)!='{}') && old[i].items) {
            for(let k = 0; k < old[i].items.length; k++) {
              var key = isList ? [name, old[i].items[k].fieldCode].join('.') : old[i].items[k].fieldCode;
              for(var prop in fieldsCfg) {
                if(old[i].items[k].fieldCode == prop) {
                  for(var prop2 in fieldsCfg[key]) {
                    old[i].items[k][prop2] = fieldsCfg[key][prop2]
                  }
                }
              }
            }
          }
        }
      }

    },
    loadFormCfg() {
      return getFormViewByUniqueId(this.viewId).then(data => {
        let { appName, config, dataSource, listInfo, formKey } = data;

        try {
          config = JSON.parse(config);
        } catch (e) {
          config = null;
        }
        this.viewInfo = config;
      });
    },
    // 请求配置
    getFormConfig() {
      return getFormConfig(this.formViewUniqueId).then(data => {
        // 获取当前表单状态
        this.currenrForm = data.viewType;
        
        let {config = [], dataSource = '[]', reconfig = {},id=''} = data;
        this.config = config;
        console.log('config:', config);
        console.log('二次配置-reconfig:', reconfig);
        if(this.baseinfoConfig.clientFlag)this.findConfigInfo();//加载二次配置信息
        // 声明相关变量
        let [ 
          ckConfig,             // 出库 相关配置
          rkConfig,             // 入库 相关配置
          fundConfig,           // 借款与备用金 相关配置
          otherConfig,          // 既不是<往来> 也不是<物料> 统一放置在这里 
          dealerConfig,         // 往来 相关配置
          matterConfig,         // 物料 相关配置
          baseinfoExtConfig     // baseinfoExt相关配置 此处在某些应用也有可能是<往来>的配置
        ] = [ [], [], [], [], [], [], [] ];

        // 由于往来组件已经单独定义 此处需要过滤部分字段
        let dealerFilter = [
          'project',
          'drDealerLabel',
          'crDealerLabel',
          'dealerCodeCredit',
          'projectType_project',
          'address_dealerDebit',
          'dealerName_dealerDebit',
          'address_dealerCodeCredit',
          'dealerName_dealerCodeCredit',
          'dealerDebitContactPersonName',
          'dealerDebitContactInformation',
          'dealerCreditContactPersonName',
          'dealerCreditContactInformation',
        ];
        // 由于物料组件已经单独定义 此处需要过滤部分字段
        let matterFilter = [
          'transObjCode',
          'tdProcessing',
          'outPutMatCode',
          'inventoryName_transObjCode',
          'specification_transObjCode',
          'inventoryName_outPutMatCode',
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
            // 往来 相关配置
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
            // 既不是<往来> 也不是<物料> 相关配置
            if (item.name === 'pb' || item.name === 'outPut' || item.name === 'projectApproval' || item.name === 'jobLog' || item.name === 'projectPlanTask') {
              otherConfig = item.items;
            }
            /**
             * baseInfoExt的配置 目前用于费用报销中的项目
             * 注意 此处针对baseinfoExtConfig的处理与<applyCommon.js>相比 因为业务原因所以略有不同 
             */
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
              /** 
               * 针对 <工单应用> 加上判断标识
               * 根据 isBomGrid判断标识 matterConfig不用过滤 matterFilter 包含的字段
               * 至此 <only-word> 组件可以正常渲染所有字段
               */ 
              if (item.xtype === 'r2BomGridWTSK') {
                item.items.forEach(each => {
                  each['isBomGrid'] = true;
                })
              }
              matterConfig = item.items;
              dataIndexMap = item.dataIndexMap || {};
              hasDataIndexMap = !!Object.keys(dataIndexMap).length;
            }
          }
        });
        // 判断往来是否展示 预收款 和 预收到期日
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
          if (matterCols.length) {
            if (!item.hidden && !matterFilter.includes(item.fieldCode) && needShow) {
              arr.push(item);
            }
          }
          else {
            if (!item.hidden) {
              // 根据 isBomGrid判断标识 matterConfig不用过滤 matterFilter 包含的字段
              item.isBomGrid 
                ? arr.push(item) 
                : !matterFilter.includes(item.fieldCode) 
                    ? arr.push(item) 
                    : '';
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
        
        // 此处针对 baseinfoExtConfig 做简单处理
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
          //item.fieldValue = this.warehouse[item.fieldCode] || '';
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
    delParam(fullPath) {
      var url = fullPath;    //页面url
      var urlParam = fullPath.substr(1);   //页面参数
      var beforeUrl = url.substr(0, url.indexOf("?"));   //页面主地址（参数之前地址）
      var nextUrl = "";

      var arr = new Array();
      if (urlParam != "") {
        var urlParamArr = urlParam.split("&"); //将参数按照&符分成数组
        for (var i = 0; i < urlParamArr.length; i++) {
          var paramArr = urlParamArr[i].split("="); //将参数键，值拆开
          //如果键雨要删除的不一致，则加入到参数中
          if (('code,state,tag').indexOf(paramArr[0]) == -1) {
              arr.push(urlParamArr[i]);
          }
        }
      }
      if (arr.length > 0) {
        nextUrl = "?" + arr.join("&");
      }
      url = beforeUrl + nextUrl;
      return url;
    },
    onUploadFile({biReferenceId}) {
      this.biReferenceId = biReferenceId;
    },
  },
  created() {
    register()
    this.loadPage();
    let { query,meta,path,fullPath} = this.$route;
    wx.ready(() => {
        let { query,meta,path,fullPath} = this.$route;
        var fullPath2 = this.delParam(fullPath);
        // 分享
        let shareInfo = {
          title: query.name,
          desc: meta.title,
          imgUrl: '',
          link: redirect_uri_share+'/Hermes'+fullPath2+'&tag=share',
        }
        shareContent(shareInfo);
      })
    if(query.tag&&query.tag=='share'){
      window.sessionStorage.removeItem('shareUrl');
    }
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
