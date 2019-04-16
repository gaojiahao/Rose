// 请求引入
import { getAppDetail } from 'service/app-basic/appSettingService'
import {
  isMyflow, 
  getListId, 
  getSaleQuotePrice
} from 'service/detailService'
import {
  commitTask, 
  getProcess, 
  requestData, 
  getFormViews,
  getFormConfig, 
  getBaseInfoData, 
  getProcessStatus, 
} from 'service/common/commonService'
// 组件引入
import UploadFile from 'components/upload/UploadFile'
import MatterItem from 'components/apply/commonPart/MatterItem'
// vux 引入
import { numberComma } from 'vux'
// 插件引入
import Bscroll from 'better-scroll'
import {toFixed} from '@/plugins/calc'
import platfrom from '@/plugins/platform/index'
import {accAdd, accMul, accSub, accDiv} from 'plugins/calc/decimalsAdd'
// 微信JS-SDK引入
import { register } from 'plugins/wx'

export default {
  data() {
    return {
      tdAmount: 0,                                // 价税小计
      taxAmount: 0,                               // 税金
      taxRate: 0.16,                              // 税率
      clientHeight : document.documentElement.clientHeight,
      viewId: '',
      listId: '',
      taskId: '',
      comment: '',                                // 审批意见
      uniqueId: '',
      biComment: '',                              // 备注
      transCode: '',
      businessKey: '',                            // 应用前缀,
      relationKey: '',
      processCode: '',                            // 流程编码，用于新建的工作流
      biReferenceId: '',
      orderListTitle: '',                         // 物料列表订单的title
      formViewUniqueId: '',
      matterPopOrderTitle: '',                    // 物料列表pop订单title,
      matter:{},                                  // 选中要编辑的物料
      entity: {},                                 // 公司主体 ID
      btnInfo: {},                                // 操作按钮信息
      dataIndexMap: {},                           // 物料字段的映射表
      dealerParams: {},                           // 请求往来数据的接口和参数
      matterParams: {},                           // 请求物料的接口，参数
      handlerDefault: {},                         // 经办人默认信息
      matterEditConfig: {},                       // 物料编辑的pop
      actions: [],
      selItems: [],                               // 选中的要删除的物料
      handleORG: [],                              // 经办组织
      filterList: [],                             // 筛选字段清单
      fundConfig: [],                             // 借款与备用金 配置
      attachment : [],                            // 附件
      otherConfig: [],                            // 表单 <其他部分> 配置 （非往来、物料等部分都放置于此）
      dealerConfig: [],                           // 表单 <往来> 配置
      userRoleList: [],                           // 经办职位
      currentStage: [],                           // 流程状态
      matterPopConfig: [],                        // 物料列表pop配置
      baseinfoExtConfig: [],                      // baseinfoExt配置
      submitMatterField: [],                      // 物料要提交的字段
      modifyIndex: null,                          // 选中编辑物料的pop
      fillBscroll: null,                          // 页面滑动 实例
      isModify: false,                            // 是否为修改页面
      btnIsHide : false,                          // 底部按钮是否显示
      isResubmit: false,                          // 是否为重新提交
      showMatterPop :false,                       // 编辑物料的pop
      showMaterielPop: false,                     // 是否显示物料列表的pop
      matterModifyClass : false,                  // 删除状态
    }
  },
  components: {
    MatterItem, UploadFile
  },
  computed: {
    // 将选中删除的物料 转换成 数组
    checkList() {
      let newArr = [].concat.apply([], Object.values(this.selItems));
      return newArr
    }
  },
  watch:{
    //修改的物料
    matter: {
      handler(val) {
        this.calcMatter(val);
      },
      deep:true
    },
    matterList: {
      handler(val) {
        let tdAmount = 0, taxAmount = 0;
        for (let item of val) {
          this.calcMatter(item);
          tdAmount = toFixed(accAdd(tdAmount, item.tdAmount));
          taxAmount = toFixed(accAdd(taxAmount, item.taxAmount));
        }
        this.tdAmount = tdAmount;
        this.taxAmount = taxAmount;
      },
      deep: true
    }
  },
  filters: {
    // 千分符处理
    numberComma,
    // 百分比处理
    percent(val) {
      if (!val && val !== 0) {
        return '无';
      }
      let budget = accMul(val, 100);
      return `${budget}%`;
    }
  },
  methods: {
    // 修改经办人信息
    selItem(val) {
      this.formData = {
        ...this.formData,
        ...val
      }
    },
    // 展开可删除状态
    showDelete() {
      this.matterModifyClass = ! this.matterModifyClass;
      this.selItems = {};
    },
    // 显示物料修改的pop
    getMatterModify(item, index) {
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
    },
    // 强制关闭 物料修改器
    shutDownModify(val) {
      this.showMatterPop = val;
    },
    // 更新修改后的物料信息
    selConfirm(val) {
      let modMatter = JSON.parse(val);
      this.$set(this.matterList, this.modifyIndex, modMatter);
    },
    // 获取listId
    getListId(transCode) {
      return new Promise(resolve => {
        getListId(transCode).then(data => {
          this.formViewUniqueId = data[0].uniqueId;
          resolve();
        })
      })
    },
    // 获取uniqueid
    getUniqueId(transCode) {
      return new Promise(resolve => {
        isMyflow({transCode}).then(({dataCount, tableContent = []}) => {
          if (dataCount > 0) {
            let [createNode = {}] = tableContent;
            this.taskId = createNode.taskId;
            if (createNode.isMyTask === 1) {
              this.uniqueId = createNode.viewId;
              this.formViewUniqueId = createNode.viewId;
              this.btnInfo = createNode;
              this.actions = createNode.actions && createNode.actions.split(',');
            }
          }

          let [ action = {} ] = tableContent;
          let { taskId } = action;
          this.taskId = taskId;

          resolve()
        })
      })
    },
    handleCfg:function(config,reconfig){
        let newCfg = { 
                dealerConfig:[], 
                otherConfig:[], 
                baseinfoExtConfig:[], 
                fundConfig:[],
                matterConfig:[]
            },
            cfgMap = {},
            containerCodeObj = {
              dealerConfig:['kh','inPut','gys','outPut'], // 往来段落 配置
              otherConfig:['pb','projectApproval','projectPlanTask','jobLog','ck'],// 既不是 “往来段落” 也不是 “物料段路”
              baseinfoExtConfig:['baseinfoExt'], // 请注意 此处也有可能会存放 往来相关 配置
              fundConfig:['order']// 用于借款与备用金
            },
            type,
            codes,
            code,
            i,l;

        for(type in containerCodeObj){
           codes = containerCodeObj[type];
           for(i=0,l = codes.length;i<l;i++){
              code = codes[i];
              cfgMap[code] = type;
           }
        }
        // 从请求回来的配置中拆分往来，物料，其他段落的配置
        config.forEach(item => {
           var ct;
          // 覆盖配置
          if (item.formViewPartId) {
            let reconfigData = reconfig[`_${item.formViewPartId}`] || {};
            item.items = item.items && item.items.map(cItem => {
              let matched = reconfigData[cItem.fieldCode] || {};
              return {...cItem, ...matched,}
            });
          }
          // 处理表单配置 <非重复项渲染> 部分
          if (!item.hiddenInRun && !item.isMultiple) {
            type = cfgMap[item.name];
            if(type != null){
               ct = newCfg[type];
               newCfg[type] = ct.length ? ct.concat(item.items) : item.items;
            }
          }
          // 处理表单配置 <重复项渲染> 部分
          else if (!item.hiddenInRun && item.isMultiple) {
            if (item.name === 'order' || item.name === 'outPut' || item.name === 'inPut') {
              newCfg.matterConfig = item.items;
              if (item.dataIndexMap) {
                this.dataIndexMap = item.dataIndexMap;
              }
            }
          }
        })
        return newCfg;
    },
    // 处理 baseInfoExt 相关配置
    handleBaseinfoExtCfg(baseinfoExtConfig,dealerFilter){    
        let baseinfoExt = [];
        baseinfoExtConfig.forEach(item => {
          // 处理提交字段
          if (item.submitValue) {
            this.submitMatterField.push(item)
          }
          // 非隐藏字段
          if (!item.hiddenInRun) {
            // 处理请求往来数据的接口
            if (item.xtype === 'r2Selector' && item.dataSource && item.dataSource.type === 'remoteData' && item.fieldCode !== 'project') {
              this.dealerParams = this.handlerParams(item);
            }
            // 处理 重复项 或者 其他单选类型 
            if ((item.xtype === 'r2MultiSelector' || item.xtype === 'r2Combo' || item.xtype === "r2Selector") && item.dataSource && item.dataSource.type === 'remoteData') {
              item.requestParams = this.handlerParams(item);
              // 因为联系人已单独作为组件存在 此处不需提前请求 
              if (item.fieldCode !== 'dealerDebitContactPersonName') {
                  requestData(this.handlerParams(item)).then(data => {
                  if (data.tableContent) {
                    data.tableContent.forEach(dItem => {
                      dItem.originValue = dItem.value;
                      dItem.name = dItem[item.displayField]
                      dItem.value = dItem[item.displayField];
                    })
                    this.$set(item, 'remoteData', data.tableContent)
                  }
                })
              }
            }
            // 存在静态数据
            else if (item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'staticData') {
              this.$set(item, 'remoteData', item.dataSource.data)
            }
            // 过滤 已定义的往来字段
            if (!dealerFilter.includes(item.fieldCode)) {
              baseinfoExt.push(item);
            }   
          }
          // 包含判断条件的字段
          if (item.hiddenInRun && item.r2Bind && item.r2Bind.hidden) {
            blankDealerConfig.push(item);
          }
        })
        this.baseinfoExtConfig = baseinfoExt;
    },
    handleDealerCfg(dealerConfig,dealerFilter){
        
        // 处理往来配置里面的接口请求
        let blankDealerConfig = [];
        // 组合 往来部分 配置
        dealerConfig.forEach(item => {
          // 非隐藏字段
          if (!item.hiddenInRun) {
            // 处理请求往来数据的接口
            if (item.xtype === 'r2Selector' && item.dataSource && item.dataSource.type === 'remoteData' && item.fieldCode !== 'project') {
              this.dealerParams = this.handlerParams(item);
            }
            // 处理请求物流，结算方式的接口
            if (item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'remoteData') {              
              // 因为联系人已单独作为组件存在 此处不需提前请求 
              if (item.fieldCode !== 'dealerDebitContactPersonName') {
                requestData(this.handlerParams(item)).then(data => {
                  this.$set(item, 'remoteData', data.tableContent)
                })
              }
            }
            // 处理 静态数据
            else if (item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'staticData') {
              let arr = [];
              for (let val of item.dataSource.data) {
                arr.push({ name: val })
              }
              this.$set(item, 'remoteData', arr)
            }
            // 过滤 已定义的往来字段
            if (!dealerFilter.includes(item.fieldCode)) {
              blankDealerConfig.push(item)
            }
          }
          // 包含判断条件的字段
          if (item.hiddenInRun && item.r2Bind && item.r2Bind.hidden) {
            blankDealerConfig.push(item);
          }
        })
        this.dealerConfig = blankDealerConfig;
    },
    // 处理物料配置
    handleMatterCfg:function(matterConfig,matterCols){
         var editMatterPopConfig = {
                property: [],
                editPart: []
             },
             editMatterPop = [],
             submitFields = [];

        matterConfig.forEach((item, index) => {
          // 组合要提交的物料字段
          if (item.submitValue) {
            submitFields.push(item)
          }
          if (matterCols.length) {
            let key = this.dataIndexMap[item.fieldCode];
            let matchedCol = matterCols.find(col => col.k === key);
            // 若存在映射表则根据映射表的字段确定显示或隐藏
            item.hidden = key ? (matchedCol ? item.hidden : true) : item.hidden;
          }
          // 数据源是动态请求数据
          if (item.dataSource && item.dataSource.type === 'remoteData') {
            // 物料或者订单请求
            if (item.editorType === 'r2Selector') {
              if (item.text === '物料名称' || item.text === '物料编码') {
                this.orderListTitle = '物料'
              }
              else if (item.text === '设施名称') {
                this.orderListTitle = '设施'
              }
              else {
                if (item.text.includes('编码')) {
                  this.orderListTitle = item.text.slice(0, item.text.indexOf('编码')); 
                }
                else {
                  this.orderListTitle = item.text;      
                }          
              }
              let url = item.dataSource.data.url;
              let params = item.dataSource.data.params;
              let keys = Object.keys(params);
              let requestParams = {
                url,
              }
              if (keys.length) {
                let matterParams = {};
                keys.forEach(item => {
                  // 当存在默认仓库的时候 对物料请求参数进行赋值
                  if (item === 'whCode' && this.warehouse.warehouseCode) {
                    matterParams[item] = this.warehouse.warehouseCode;
                    return
                  }
                  // 根据form配置返回dataSource参数 此处组装 <组件请求参数> 默认值
                  matterParams[item] = params[item].type === 'text' ? params[item].value : '';
                })
                requestParams.data = matterParams;
              }
              this.matterParams = requestParams
            }
            // 物料信息里有下拉选择的字段
            else if (item.editorType === 'r2Combo' && !item.readOnly) {
              let url = item.dataSource.data.url,
                  params = item.dataSource.data.params,
                  keys = Object.keys(params),
                  requestParams = {url};
              if (keys.length) {
                let data = {};
                keys.forEach(key => {
                  data[key] = params[key].value;
                })
                requestParams.data = data;
              }
              // 为避免重复请求 此处仅针对 *产品价格应用* 单独做初始化请求设置
              if (item.fieldCode.includes('drDealerLabel')) {
                requestData(requestParams).then(({tableContent = []}) => {
                  let arr = [];
                  tableContent.forEach(item => {
                    arr.push(item.name)
                  })
                  item.remoteData = [arr];
                })
              }
            }
            //r2SelectorPlus
            else if (item.editorType === 'r2SelectorPlus' && !item.readOnly) {
              let url = item.dataSource.data.url,
                  params = item.dataSource.data.params,
                  keys = Object.keys(params),
                  requestParams = {url};
              if (keys.length) {
                let data = {};
                keys.forEach(key => {
                  data[key] = params[key].value;
                })
                requestParams.data = data;
              }
              if (item.fieldCode.includes('warehouse')) {
                requestData(requestParams).then(({tableContent = []}) => {
                  let arr = [];
                  tableContent.forEach(item => {
                    item.name = item.warehouseName;
                    item.value = item.warehouseCode;
                    item.parent = index;
                    arr.push(item);
                  })
                  item.remoteData = [arr];
                })
              }
            }
          }
          else if (item.dataSource && item.dataSource.type === 'staticData') {
            let remoteData = []
            item.dataSource.data.forEach(dItem => {
              remoteData.push({
                name: dItem,
                value: dItem
              })
            })
            this.$set(item, 'remoteData', remoteData)
          }
          // 组合matterPop配置
          // matterPop需要隐藏的物料的字段
          if (item.editorType === 'r2Selector') {
            let hiddenField = JSON.parse(JSON.stringify(item.dataSource.data.hFields));
            hiddenField.unshift('transCode','inventoryName', 'inventoryCode', 'specification','invName','matCode','facilityName', 'facilityCode', 'facilitySpecification')
            let matterPopField = [],
                dsCols = JSON.parse(JSON.stringify(item.proertyContext.dataSourceCols));

            // 循环删除要隐藏的字段
            dsCols.forEach((item, index) => {
              if (item.k === 'transCode') {
                this.matterPopOrderTitle = item.v;
              }
              if (hiddenField.indexOf(item.k) == -1) {
                  matterPopField.push(item);
              }
            })
            this.matterPopConfig = matterPopField;
          }
          // 没有映射表时，根据物料poplist中数据来去对应的字段的值
          if (item.dataSource && item.dataSource.type === 'formData') {
            if (typeof(item.dataSource.data.valueField) === 'string') {
              let arr = item.dataSource.data.valueField.replace(/\[|]/g, '').split(/\"/);
              let valueField = [];
              arr.forEach(item => {
                if (item) {
                  valueField.push(item)
                }
              })
              item.dataSource.data.valueField = valueField;

            }
            item.showFieldCode = item.dataSource.data.valueField[1];
          }
          // 当存在映射表时，根据映射表来取对应的值
          if (Object.keys(this.dataIndexMap).length) {
            item.showFieldCode = this.dataIndexMap[item.fieldCode];
          }
          // 组合物料编辑的matterPop的配置
          if (!item.hidden) {
            if (item.valueField !== "transCode" && item.valueField !== 'inventoryName' && item.valueField !== 'facilityName' 
              && !item.fieldCode.includes('inventoryName') 
              && item.showFieldCode !== 'transCode' && item.showFieldCode !== 'facilityName' 
              && item.showFieldCode !== 'facilityCode' && item.showFieldCode !== 'facilitySpecification') {
              editMatterPop.push(item);
            }
          }
        })
        // 判断是否只读 如果不是只读就统一塞进编辑页面
        if (editMatterPop.length) {
          this.splitConfig(editMatterPop, editMatterPopConfig);
        }
        if(this.handlerMatterEditConfig)this.handlerMatterEditConfig(editMatterPopConfig);
        this.matterEditConfig = editMatterPopConfig;
        this.submitMatterField = this.submitMatterField.concat(submitFields);
    },
    handleOtherCfg(otherConfig){
        // 处理其他信息的配置
        let other = [];
        otherConfig.forEach(item => {
          if (item.submitValue) {
            this.submitMatterField.push(item)
          }
          if (!item.hiddenInRun) {
            if ((item.xtype === 'r2MultiSelector' || item.xtype === 'r2Combo') && item.dataSource && item.dataSource.type === 'remoteData') {
              item.requestParams = this.handlerParams(item);
              requestData(this.handlerParams(item)).then(data => {
                if (data.tableContent) {
                  data.tableContent.forEach(dItem => {
                    dItem.originValue = dItem.value;
                    dItem.name = dItem[item.displayField]
                    dItem.value = dItem[item.displayField];
                  })
                  this.$set(item, 'remoteData', data.tableContent)
                }
              })
            }
            else if (item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'staticData') {
              this.$set(item, 'remoteData', item.dataSource.data)
            }
            other.push(item)
          }
        })
        this.otherConfig = other;
    },
    // 用于借款与备用金中往来的配置
    handleFundCfg(fundConfig){
        let fund = [];
        fundConfig.forEach(item => {
          // 没有映射表时，根据物料poplist中数据来去对应的字段的值
          if (item.dataSource && item.dataSource.type === 'formData') {
            if (typeof(item.dataSource.data.valueField) === 'string') {
              let arr = item.dataSource.data.valueField.replace(/\[|]/g, '').split(/\"/);
              let valueField = [];
              arr.forEach(item => {
                if (item) {
                  valueField.push(item)
                }
              })
              item.dataSource.data.valueField = valueField;

            }
            item.showFieldCode = item.dataSource.data.valueField.length === 1 ? item.dataSource.data.valueField[0] : item.dataSource.data.valueField[1];
          }
          if (item.submitValue) {
            this.submitMatterField.push(item)
          } 
          if (!item.hiddenInRun) {
            if ((item.xtype === 'r2MultiSelector' || item.xtype === 'r2Combo') && item.dataSource && item.dataSource.type === 'remoteData') {
              item.requestParams = this.handlerParams(item)
              requestData(this.handlerParams(item)).then(data => {
                if (data.tableContent) {
                  data.tableContent.forEach(dItem => {
                    dItem.originValue = dItem.value;
                    dItem.name = dItem[item.displayField]
                    dItem.value = dItem[item.displayField];
                  })
                  this.$set(item, 'remoteData', data.tableContent)
                }
              })
            }
            else if (item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'staticData') {
              this.$set(item, 'remoteData', item.dataSource.data)
            }
            fund.push(item)
          }
        })
        this.fundConfig = fund;
    },
    handleAccountDS:function(ds,matterCols){
      let dataSource = JSON.parse(JSON.parse(ds)[0].dataSource.source);
      if (dataSource) {
         dataSource.cols.map(function(item){
            matterCols.push(item);
        });
        // 请求数据 组合要渲染的matterList配置
        let url = dataSource.url,
            params = dataSource.params,
            keys = Object.keys(params),
            requestParams = { url };

        // 处理 数据源当中的参数
        if (keys.length) {
          let matterParams = {};
          keys.forEach(item => {
            // 处理销售出库默认选中成品仓
            if (item === 'whCode' && this.warehouse.warehouseCode) {
              matterParams[item] = this.warehouse.warehouseCode;
              return
            }
            if (item === 'dealerCode' && this.dealerInfo.dealerCode) {
              matterParams[item] = this.dealerInfo.dealerCode;
              return
            }
            matterParams[item] = params[item].type === 'text' ? params[item].value : '';
          })
          requestParams.data = matterParams;
        }
        this.matterParams = requestParams;

        // 处理物料的配置
        let arr = [];
        for (let cItem of dataSource.cols) {
          if (!cItem.h) {
            // 配置中的字段要去除掉物料名称，交易号
            if (cItem.k !== 'inventoryName' && cItem.k !== 'transCode' && cItem.k !== 'invName') {
              arr.push(cItem)
            }
            // 确定要物料段落显示的title
            if (cItem.k === 'inventoryCode' && !this.orderListTitle) {
              this.orderListTitle = '物料';
            }
            else if (cItem.k === 'transCode') {
              if (cItem.v.includes('编码')) {
                this.orderListTitle = cItem.v.slice(0, cItem.v.indexOf('编码'));
                continue;
              }
              this.orderListTitle = cItem.v;
            }
          }
        }
        this.matterPopConfig = arr;
      }
    },
    // 提交订单
    saveData(request, submitData) {
      request(submitData).then(data => {
        this.$HandleLoad.hide()
        let {success = false, message = '提交失败'} = data;
        if (success) {
          message = '提交成功';
          this.$emit('change', true);
        }
        this.$vux.alert.show({
          content: message,
          onHide: () => {
            if (success) {
              this.judgePage();
            }
          }
        });
      }).catch(e => {
        this.$HandleLoad.hide();
      })
    },
    // 终止订单
    stopOrder() {
      this.$vux.confirm.show({
        title: '温馨提示',
        content: '终止提交意味着此单将会失效，确认吗？',
        onConfirm: () => {
          this.$vux.confirm.prompt('', {
            title: '审批意见',
            onConfirm: (value) => {
              this.$HandleLoad.show();

              if (value) {
                this.comment = value;
              }

              let submitData = {
                taskId: this.taskId,
                taskData: JSON.stringify({
                  result: -1,
                  transCode: this.transCode,
                  comment: this.comment
                })
              }
              commitTask(submitData).then(data => {
                this.$HandleLoad.hide();
                let {success = false, message = '提交失败'} = data;
                if (success) {
                  message = '终止成功';
                  this.$emit('change', true);
                }
                this.$vux.alert.show({
                  content: message,
                  onHide: () => {
                    if (success) {
                      this.judgePage();
                    }
                  }
                });
              })
              .catch(e => {
                this.$HandleLoad.hide();
              })
            }
          })
        }
      })
    },
    // 获取用户基本信息
    getBaseInfoData() {
      getBaseInfoData().then(({handleORG, userRoleList, ...basicUserInfo}) => {
        this.handleORG = handleORG;
        this.userRoleList = userRoleList;

        // 默认取第一个值
        let [firstORG = {}] = handleORG,
            [firstRole = {}] = userRoleList;

        // 用户相关经办信息初始化,如果是保存草稿之后重新进入，则使用已经保存的值
        let defaultUserInfo = {};
        if (this.formData.handler) {
          defaultUserInfo = {
            handler: this.formData.handler,  // 用户id
            handlerName: this.formData.handlerName,  //用户名称
            handlerUnit: this.formData.handlerUnit,  // 用户组织id
            handlerUnitName: this.formData.handlerUnitName,  // 用户组织名称
            handlerRole: this.formData.handlerRole,  // 用户职位id
            handlerRoleName: this.formData.handlerRoleName ,  // 用户职位名称
            userCode: this.formData.userCode, // 用户工号
          }
        }
        else {
          defaultUserInfo = {
            handler: basicUserInfo.userId,  // 用户id
            handlerName: basicUserInfo.nickname,  //用户名称
            handlerUnit: firstORG.groupId,  // 用户组织id
            handlerUnitName: firstORG.groupName,  // 用户组织名称
            handlerRole: firstRole.roleId || '',  // 用户职位id
            handlerRoleName: firstRole.roleName || '',  // 用户职位名称
            userCode: basicUserInfo.userCode, // 用户工号
          }
        }

        // 当请求数据的参数matterParams中有groupId
        if (this.matterParams.data && this.matterParams.data.groupId !== undefined) {
          this.matterParams.data.groupId = firstORG.groupId
        }
        this.formData = {
          ...this.formData,
          ...defaultUserInfo,
          creator: defaultUserInfo.handler,
          modifer: defaultUserInfo.handler,
        };
        this.handlerDefault = defaultUserInfo;
        this.$loading.hide();
      })
    },
    // 获取物料价格
    getMatPrice() {
      this.matterList.forEach((item, index) => {
        // 如果已有价格，则不发起请求
        if (item.price) {
          return
        }
        getSaleQuotePrice({
          drDealerCode: this.dealerInfo.dealerCode,
          matCode: item.inventoryCode,
          noCount: 1,
        }).then(({tableContent = []}) => {
          let [lastest = {}] = tableContent; // 取第一个价格
          item.price = lastest.price;
        })
      });
    },
    // 获取工作流的processCode
    getProcess() {
      return getProcess(this.listId).then(([data = {}]) => {
        this.processCode = data.processCode || '';
      })
    },
    // 获取流程状态
    getProcessStatus() {
      return getProcessStatus(this.listId).then( ({ tableContent }) => {
        for (let val of tableContent) {
          val['value'] = val.fieldVlaue;
          val['name'] = val.fieldVlaue;
        }
        this.currentStage = tableContent;
      })
    },
    // 检查金额，取正数、保留两位小数
    checkAmt(item, key, val) {
      let { tdQty, taxRate, qtyBal, qtyStock, qtyBalance, 
        assistQty, qtyStockBal, qtyOnline, qtyDownline} = item;

      item[key] = Math.abs(toFixed(val));

      // 数量
      if (key === 'tdQty' && tdQty) {
        // qtyStockBal为销售出库的库存，数量不允许大于余额
        if (!qtyStockBal && !qtyStock && qtyBal && tdQty > qtyBal) {
          item.tdQty = qtyBal;
        }
        else if (qtyStockBal && tdQty > qtyStockBal) { // 数量不允许大于库存
          item.tdQty = qtyStockBal;
        }
        //qtyStock为物料领料，数量不允许大于库存
        else if (qtyStock && tdQty > qtyStock) {
          item.tdQty = qtyStock;
        }
        else if (qtyBalance && tdQty > qtyBalance) {
          item.tdQty = qtyBalance;
        }
        else if (qtyOnline && qtyDownline) {
          /** 
           *  @assistQty  辅助计量 数量
           *  @qtyDownline  数量下限
           *  @qtyOnline  数量上限
           *  只有当符合下列条件时 数据才会相应的动态赋值
           */ 
          if (assistQty >= qtyDownline && assistQty <= qtyOnline) {
            this.defineObjVal(item, item.otherField, item.otherField)
          }
          else {
            this.defineObjVal(item, item.otherField, '')
          }
        }
      }
      //税率
      if (taxRate) {
        item.taxRate = Math.abs(toFixed(taxRate));
      }
    },
    defineObjVal(currentData, newObj, newVal) {
      for (let key in newObj) {
        this.$set(currentData, key, newVal[key]);
      }
    },
    // 输入框获取焦点，内容选中
    getFocus(e) {
      event.currentTarget.select();
    },
    // 选择日期
    getDate(sItem, dItem) {
      this.$vux.datetime.show({
        confirmText: '确认',
        cancelText: '取消',
        onConfirm: (val) => {
          if (sItem[dItem.fieldCode] == null) {
            this.$set(sItem, dItem.fieldCode, val)
            return
          }
          sItem[dItem.fieldCode] = val;
        },
      })
    },   
    // 上传文件成功
    onUploadFile({biReferenceId}) {
      this.biReferenceId = biReferenceId;
    },
    // 监听返回事件
    listenBack() {
      wx.ready(() => {
        wx.onHistoryBack && wx.onHistoryBack(() => {
          return this.onHistoryBack ? this.onHistoryBack() : true;
        });
      })
    },
    // 判断是返回上一页还是跳转详情页
    judgePage() {
      // 在企业微信的提醒中打开重新提交页面history为1，此时终止成功则跳转详情页
      if (window.history.length !== 1) {
        this.$router.go(-1);
      }
      else {
        let {name} = this.$route.query;
        let {folder, fileName} = this.$route.params;
        this.$router.replace({
          path: `/detail/${folder}/${fileName}`,
          query: {
            name,
            transCode: this.transCode
          }
        });
      }
    },
    // 获取应用详情
    getAppDetail() {
      return getAppDetail(this.listId).then(([data = {}]) => {
        let { prefix } = data;
        this.businessKey = prefix;
      })
    },
    // 计算物料相关值
    calcMatter(item) {
      let tdQty = item.tdQty || 0,
          taxRate = item.taxRate || 0,
          price = Number(item.price) || 0;  // 此处单独针对price进行number处理 因为销售订单的业务需求      
          
      item.assistQty = toFixed(accDiv(tdQty, item.assMeasureScale));
      item.noTaxPrice = toFixed(accDiv(price, accAdd(1, taxRate)), 6);
      item.tdAmount = toFixed(accMul(price, item.assistQty));
      item.taxAmount = toFixed(accMul(item.assistQty, taxRate, item.noTaxPrice));
      item.noTaxAmount = toFixed(accSub(item.tdAmount, item.taxAmount));
    },
    // 校验 提交参数
    verifyData(config = [], info = {}) {
      let warn = '';
      for (let item of config) {
        if (!item.allowBlank && !info[item.fieldCode]) {
          console.error('缺失字段: ',item.fieldCode);
          warn = `${item.fieldLabel}不能为空`;
          break;
        }
      }
      return warn;
    },
    // 简单计算物料相关值
    simpleCalcMatter(item) {
      let tdQty = item.tdQty || 0,
          taxRate = item.taxRate || 0,
          price = Number(item.price) || 0;
      item.noTaxAmount = toFixed(accMul(price, tdQty));
      item.taxAmount = toFixed(accMul(item.noTaxAmount, taxRate));
      item.tdAmount = toFixed(accAdd(item.noTaxAmount, item.taxAmount));
    },
    // 将物料配置拆分成属性和可编辑部分
    splitConfig(editMatterPop, editMatterPopConfig) {
      for (let [index, item] of Object.entries(editMatterPop)) {
        if (item.fieldCode === 'assMeasureUnit' && !item.readOnly) {
          editMatterPopConfig.editPart.push(item);
        }
        else if (item.fieldCode === 'drDealerLabel' || item.fieldCode === 'tdQty' || item.fieldCode === 'qualityQty' || item.fieldCode === "qtyDownline" 
        || item.fieldCode === "warehouseName_containerCodeOut" || item.fieldCode === "warehouseName_storehouseOutCode" || item.fieldCode === "storehouseOutCode") {
          editMatterPopConfig.property = editMatterPop.slice(0, index);
          editMatterPopConfig.editPart = [...editMatterPopConfig.editPart, ...editMatterPop.slice(index)]
          break;
        }
      }
    },
    // 获取表单配置基本信息
    async getFormViewInfo() {
      // 请求 表单uniqueId
      await getFormViews(this.listId).then(data => {
        for (let item of data) {
          if (this.transCode && item.viewType === 'revise') {
            this.viewId = item.uniqueId;
          }
          else if (!this.transCode && item.viewType === 'submit') {
            this.viewId = item.uniqueId;
          }
        }
      })
      // 根据uniqueId 请求表单配置
      await getFormConfig(this.viewId).then((data) => {
        let matterCols = [], { config, reconfig = {},dataSource} = data;
        // 由于往来组件已经单独定义 此处需要过滤部分字段
        let dealerFilter = [
          'dealerDebit', 
          'drDealerLabel', 
          'crDealerLabel', 
          'dealerCodeCredit', 
          'address_dealerDebit', 
          'dealerName_dealerDebit',
          'address_dealerCodeCredit', 
          'dealerDebitContactPersonName',
          'dealerDebitContactInformation',
          'dealerCreditContactPersonName', 
          'dealerCreditContactInformation'
        ];
        // 处理将数据源配置在data中的情况
        if (dataSource) {
          this.handleAccountDS(dataSource,matterCols);
        }
        console.log('config:', config);
        let {dealerConfig,matterConfig,otherConfig,baseinfoExtConfig,fundConfig} = this.handleCfg(config,reconfig);
        
        this.handleDealerCfg(dealerConfig,dealerFilter);
        this.handleMatterCfg(matterConfig,matterCols);
        this.handleOtherCfg(otherConfig);
        this.handleBaseinfoExtCfg(baseinfoExtConfig,dealerFilter);
        this.handleFundCfg(fundConfig);
      })
    },
    // 处理配置中数据请求
    handlerParams(item) {
      let url = item.dataSource.data.url;
      let params = item.dataSource.data.params;
      let keys = Object.keys(params);
      let requestParams = {
        url,
      }
      if (keys.length) {
        let data = {};
        keys.forEach(key => {
          data[key] = params[key].value;
        })
        requestParams.data = data;
      }
      return requestParams
    }
  },
  created() {
    let { name, listId, transCode, isModify = false, relationKey } = this.$route.query;
    
    register(); // 注册wx-js-sdk
    
    if (transCode) this.transCode = transCode;
    this.listId = listId;
    this.isModify = isModify;

    // 获取本地保存的当前的主体
    let data = sessionStorage.getItem('ROSE_LOGIN_TOKEN');
    if (data) this.entity.dealerName = JSON.parse(data).entityId;
    // 请求页面的数据
    (async () => {
      await this.getFormViewInfo();
      this.getProcess();
      if (!transCode) {
        this.getBaseInfoData();
      }
      this.getProcessStatus();  // 获取流程状态
      this.getAppDetail();
      this.initRequest && this.initRequest();   // 提交页面 不共用的数据 请求
      if (transCode) {
        this.isResubmit = true;
        await this.getListId(transCode);
        await this.getUniqueId(transCode);
        this.getFormData && await this.getFormData();
      }
      if (relationKey) {
        this.relationKey = relationKey;
        this.getRelationData();
      }
    })()
  },
  mounted() {
    this.$nextTick(() => {
      this.fillBscroll = new Bscroll(this.$refs.fill, {
        click: true
      })
    })
    //解决android键盘收起input没有失去焦点，底部按钮遮挡输入框
    if (platfrom.isAndroid) {
      window.onresize= () => {
        if (this.clientHeight > document.documentElement.clientHeight) {
          //底部按钮隐藏
            this.btnIsHide  = true;
        }else {
            this.btnIsHide = false;
            if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
              document.activeElement.blur();
            }
        }
      }
    }

  }
}
