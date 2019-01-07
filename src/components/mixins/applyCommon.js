import {commitTask, getBaseInfoData, getProcess, getProcessStatus, getFormConfig, requestData, getFormViews} from 'service/commonService'
import {getListId, isMyflow, getSaleQuotePrice,} from 'service/detailService'
import {getAppDetail} from 'service/appSettingService'
import {numberComma,} from 'vux'
import Bscroll from 'better-scroll'
import {accAdd, accMul, accSub, accDiv} from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'
import platfrom from '@/plugins/platform/index'
import MatterItem from 'components/apply/commonPart/MatterItem'
import UploadFile from 'components/upload/UploadFile'
/* 引入微信相关 */
import {register} from 'plugins/wx'
import { shareContent } from 'plugins/wx/api'

export default {
  data() {
    return {
      taskId: '',
      comment: '',                                // 审批意见
      uniqueId: '',
      biComment: '',                              // 备注
      transCode: '',
      processCode: '',                            // 流程编码，用于新建的工作流
      biReferenceId: '',
      formViewUniqueId: '',
      matter:{},                                  // 选中要编辑的物料
      entity: {},                                 // 公司主体 ID
      btnInfo: {},                                // 操作按钮信息
      actions: [],
      selItems: [],                               // 选中的要删除的物料
      handleORG: [],                              // 经办组织
      userRoleList: [],                           // 经办职位
      currentStage: [],                           // 流程状态
      modifyIndex:null,                           // 选中编辑物料的pop
      fillBscroll: null,
      btnIsHide : false,
      isResubmit: false,
      showMatterPop :false,                       // 编辑物料的pop
      matterModifyClass : false,
      clientHeight : document.documentElement.clientHeight,
      attachment : [],
      relationKey: '',
      handlerDefault: {}, // 经办人默认信息
      listId: '',
      taxRate: 0.16, // 税率
      businessKey: '', // 应用前缀,
      viewId: '',
      dealerConfig: [],
      matterPopConfig: [], // 物料列表pop配置
      orderListTitle: '', // 物料列表订单的title
      matterEditConfig: {}, // 物料编辑的pop
      matterParams: {}, // 请求物料的接口，参数
      matterPopOrderTitle: '', // 物料列表pop订单title,
      dealerParams: {}, // 请求往来数据的接口和参数
      otherConfig: []
    }
  },
  components: {
    MatterItem,UploadFile
  },
  computed: {
    // 税金
    taxAmount() {
      let total = 0;
      this.matterList.forEach(item => {
        this.calcMatter(item);
        total = accAdd(total, item.taxAmount);
      });
      return toFixed(total);
    },
    // 税金小计
    tdAmount() {
      let total = 0;
      this.matterList.forEach(item => {
        this.calcMatter(item);
        total = accAdd(total, item.tdAmount);
      });
      return toFixed(total);
    },
  },
  watch:{
    //修改的物料
    matter:{
      handler(val){
        this.calcMatter(val);
      },
      deep:true
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
    //展开可删除状态
    showDelete(){
      this.matterModifyClass = ! this.matterModifyClass;
      this.selItems = [];
    },
    //显示物料修改的pop
    modifyMatter(item,index){
      this.matter = JSON.parse(JSON.stringify(item));
      this.showMatterPop = true;
      this.modifyIndex = index;
    },
    //更新修改后的物料信息
    selConfirm(val){
      let modMatter = JSON.parse(val);
      this.$set(this.matterList,this.modifyIndex,modMatter);
    },
    //获取listId
    getListId(transCode) {
      return new Promise(resolve => {
        getListId(transCode).then(data => {
          this.uniqueId = data[0].uniqueId;
          resolve();
        })
      })
    },
    //获取uniqueid
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
          let [action = {}] = tableContent;
          let {actions = '', isMyTask = 0, taskId} = action;

          this.taskId = taskId;
          resolve()
        })
      })
    },
    //提交订单
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
    //终止订单
    stopOrder() {
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
          }).catch(e => {
            this.$HandleLoad.hide();
          })
        }
      })
    },
    // TODO 获取用户基本信息
    getBaseInfoData() {
      getBaseInfoData().then(({handleORG, userRoleList, ...basicUserInfo}) => {
        this.handleORG = handleORG;
        this.userRoleList = userRoleList;
        // 默认取第一个值
        let [firstORG = {}] = handleORG,
            [firstRole = {}] = userRoleList;
        // 用户相关经办信息初始化
        let defaultUserInfo = {
          handler: basicUserInfo.userId,  // 用户id
          handlerName: basicUserInfo.nickname,  //用户名称
          handlerUnit: firstORG.groupId,  // 用户组织id
          handlerUnitName: firstORG.groupName,  // 用户组织名称
          handlerRole: firstRole.roleId || '',  // 用户职位id
          handlerRoleName: firstRole.roleName || '',  // 用户职位名称
          userCode: basicUserInfo.userCode, // 用户工号
        }
        this.formData = {
          ...this.formData,
          ...defaultUserInfo,
          creator: defaultUserInfo.handler,
          modifer: defaultUserInfo.handler,
        };
        this.handlerDefault = defaultUserInfo;
        // // 产品需求的经办人信息为使用组件，需单独请求组织和部门
        // this.getGroupByUserId && this.getGroupByUserId();
        // this.getRoleByUserId && this.getRoleByUserId();
        this.$loading.hide();
      })
    },
    // TODO 获取物料价格
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
    // TODO 获取工作流的processCode
    getProcess() {
      return getProcess(this.listId).then(([data = {}]) => {
        this.processCode = data.processCode || '';
      })
    },
    // 获取流程状态
    getProcessStatus() {
      return getProcessStatus(this.listId).then( ({ tableContent }) => {
        for(let val of tableContent){
          val['value'] = val.fieldVlaue;
          val['name'] = val.fieldVlaue;
        }
        this.currentStage = tableContent;
      })
    },
    // TODO 检查金额，取正数、保留两位小数
    checkAmt(item){
      let { price, tdQty, qtyBal, qtyStockBal, thenQtyBal, qtyStock, taxRate} = item;
      // 金额
      if (price) {
        item.price = Math.abs(toFixed(price));
      }
      // 数量
      if (tdQty) {
        item.tdQty = Math.abs(toFixed(tdQty));
        // qtyStockBal为销售出库的库存，数量不允许大于余额qtyBalqtyStock
        if (!qtyStockBal && !qtyStock && qtyBal && tdQty > qtyBal) {
          item.tdQty = qtyBal;
        }
        else if (qtyStockBal && tdQty > qtyStockBal) { // 数量不允许大于库存
          item.tdQty = qtyStockBal;
        }
        //qtyStock为物料领料，数量不允许大于库存
        else if(qtyStock && tdQty > qtyStock) {
          item.tdQty = qtyStock;
        }
        else if(qtyBal && tdQty > qtyBal) {
          item.tdQty = qtyBal;
        }
        else if(thenQtyBal && tdQty > thenQtyBal) {
          item.tdQty = thenQtyBal;
        }
      }
      //税率
      if (taxRate) {
        item.taxRate = Math.abs(toFixed(taxRate));
      }
    },
    //输入框获取焦点，内容选中
    getFocus(e){
      event.currentTarget.select();
    },
    // TODO 上传文件成功
    onUploadFile({biReferenceId}) {
      this.biReferenceId = biReferenceId;
    },
    // TODO 监听返回事件
    listenBack() {
      wx.ready(() => {
        wx.onHistoryBack && wx.onHistoryBack(() => {
          return this.onHistoryBack ? this.onHistoryBack() : true;
        });
      })
    },
    // 监听触发转发
    listenShare (){
      // shareContent();
    },
    // TODO 判断是返回上一页还是跳转详情页
    judgePage() {
      // 在企业微信的提醒中打开重新提交页面history为1，此时终止成功则跳转详情页
      if (window.history.length !== 1) {
        this.$router.go(-1);
      } else {
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
    // TODO 获取应用详情
    getAppDetail() {
      return getAppDetail(this.listId).then(([data = {}]) => {
        let {action, prefix} = data;
        this.businessKey = prefix;
      })
    },
    // TODO 计算物料相关值
    calcMatter(item) {
      let price = item.price || 0,
          tdQty = item.tdQty || 0,
          taxRate = item.taxRate || 0;
      item.assistQty = toFixed(accDiv(tdQty, item.assMeasureScale));
      item.noTaxPrice = toFixed(accDiv(price, accAdd(1, taxRate)), 6);
      item.tdAmount = toFixed(accMul(price, item.assistQty));
      item.taxAmount = toFixed(accMul(item.assistQty, taxRate, item.noTaxPrice));
      item.noTaxAmount = toFixed(accSub(item.tdAmount, item.taxAmount));
    },
    // ToDo 简单计算物料相关值
    simpleCalcMatter(item) {
      let price = item.price || 0,
          tdQty = item.tdQty || 0,
          taxRate = item.taxRate || 0;
      item.noTaxAmount = toFixed(accMul(price, tdQty));
      item.taxAmount = toFixed(accMul(item.noTaxAmount, taxRate));
      item.tdAmount = toFixed(accAdd(item.noTaxAmount, item.taxAmount));
    },
    // 请求应用的viewId
    getFormViews() {
      getFormViews(this.listId).then(data => {
        for(let item of data){
          if(item.viewType === 'submit'){
            this.viewId = item.uniqueId;
            this.getFormConfig();
            break;
          }
        }
      })
    },
    // 处理配置中数据请求
    handlerParams(item){
      let url = item.dataSource.data.url;
      let params = item.dataSource.data.params;
      let keys = Object.keys(params);
      let requestParams = {
        url,
      }
      if(keys.length){
        let data = {};
        keys.forEach(key => {
          data[key] = params[key].value;
        })
        requestParams.data = data;
      }
      return requestParams
    },
    // 请求配置
    getFormConfig(){
      getFormConfig(this.viewId).then(({config = []}) => {
        console.log(config)
        let dealerConfig = [], matterConfig = [], otherConfig = [];
        // 从请求回来的配置中拆分往来，物料，其他段落的配置
        config.forEach(item => {
          if(!item.isMultiple) {
            if(item.name === 'kh' || item.name === 'inPut' || item.name === 'baseinfoExt' || item.name === 'gys') {
              dealerConfig = dealerConfig.concat(item.items)
            }
            if(item.name === 'ck'){
              otherConfig = item.items;
            }
          }
          else{
            if(item.name === 'order' || item.name === 'outPut' || item.name === 'inPut') {
              matterConfig = item.items;
            }
          }  
        })
        // 处理往来配置里面的接口请求
        dealerConfig.forEach(item => {
          // function handlerParams(item) {
          //   let url = item.dataSource.data.url;
          //   let params = item.dataSource.data.params;
          //   let keys = Object.keys(params);
          //   let requestParams = {
          //     url,
          //   }
          //   if(keys.length){
          //     let data = {};
          //     keys.forEach(key => {
          //       data[key] = params[key].value;
          //     })
          //     requestParams.data = data;
          //   }
          //   return requestParams
          // }
          if(!item.hiddenInRun){
            //处理请求往来数据的接口
            if(item.xtype === 'r2Selector' && item.dataSource && item.dataSource.type === 'remoteData' && item.fieldCode !== 'project') {
              this.dealerParams = this.handlerParams(item);

            }
            // 处理请求物流，结算方式的接口
            if(item.xtype === 'r2Combo' && item.dataSource && item.dataSource.type === 'remoteData') {
              requestData(this.handlerParams(item)).then(data => {
                this.$set(item, 'remoteData', data.tableContent)
              })
            }
          }
          
        })
        this.dealerConfig = dealerConfig;
        // 处理物料配置
        let eidtMatterPopConfig = {
          property: [],
          editPart: []
        };
        let eidtMatterPop = [];
        matterConfig.forEach((item,index) => {
          if(item.dataSource && item.dataSource.type === 'remoteData') {
            // 物料或者订单请求
            if(item.editorType === 'r2Selector') {
              if(item.text === '物料名称' || item.text === '物料编码'){
                this.orderListTitle = '物料'
              }
              else if(item.text === '设施名称') {
                this.orderListTitle = '设施'
              }
              else{
                this.orderListTitle = item.text;
              }
              let url = item.dataSource.data.url;
              let params = item.dataSource.data.params;
              let keys = Object.keys(params);
              let requestParams = {
                url,
              }
              if(keys.length){
                let matterParams = {};
                keys.forEach(item => {
                  // 处理销售出库默认选中成品仓
                  if(item === 'whCode' && this.warehouse.warehouseCode) {
                    matterParams[item] = this.warehouse.warehouseCode;
                    return 
                  }
                  if(item === 'dealerCode' && this.dealerInfo.dealerCode){
                    matterParams[item] = this.dealerInfo.dealerCode;
                    return 
                  }
                  matterParams[item] = params[item].type === 'text' ? params[item].value : '';
                })
                requestParams.data = matterParams;
              }
              this.matterParams = requestParams
            }
            // 物料信息里有下拉选择的字段
            else if(item.editorType === 'r2Combo') {
              let url = item.dataSource.data.url,
                  params = item.dataSource.data.params,
                  keys = Object.keys(params),
                  requestParams = {url}
              if(keys.length){
                let data = {};
                keys.forEach(key => {
                  data[key] = params[key].value;
                })
                requestParams.data = data;
              }
              requestData(requestParams).then(({tableContent = []}) => {
                let arr = [];
                tableContent.forEach(item => {
                  arr.push(item.name)
                })
                item.remoteData = [arr];
              })
            }
          }
          // 组合matterPop配置
          // matterPop需要隐藏的物料的字段
          if(item.editorType === 'r2Selector'){
            let hiddenField = JSON.parse(JSON.stringify(item.dataSource.data.hFields));
            hiddenField.unshift('transCode','inventoryName', 'inventoryCode', 'specification','invName','matCode','facilityName', 'facilityCode', 'facilitySpecification')
            let matterPopField = JSON.parse(JSON.stringify(item.proertyContext.dataSourceCols));
            // 循环删除要隐藏的字段
            hiddenField.forEach(hItem => {
              matterPopField.forEach((item,index) => {
                if(item.k === 'transCode'){
                  this.matterPopOrderTitle = item.v;
                }
                if(item.k === hItem) {
                  matterPopField.splice(index, 1)
                  index --;
                  return false
                }
              })
            })
            this.matterPopConfig = matterPopField;
          }
          // 组合物料编辑的matterPop的配置
          if(!item.hidden){
            if(item.dataSource && item.dataSource.type === 'formData'){
              if(typeof(item.dataSource.data.valueField) === 'string') {
                let arr = item.dataSource.data.valueField.replace(/\[|]/g, '').split(/\"/);
                let valueField = [];
                arr.forEach(item => {
                  if(item) {
                    valueField.push(item)
                  }
                })
                item.dataSource.data.valueField = valueField;
                
              }
              item.showFieldCode = item.dataSource.data.valueField[1];
            }
            if(item.valueField !== "transCode" && item.valueField !== 'inventoryName' && item.valueField !== 'facilityName' 
                && item.text !== '物料名称' && item.text !== '物料编码' && item.text !== '规格' && item.text !== '产品规格'
                && item.showFieldCode !== 'facilityName' && item.showFieldCode !== 'facilityCode' 
                && item.showFieldCode !== 'facilitySpecification'){
              eidtMatterPop.push(item);
            }
            
          }
        })
        console.log(eidtMatterPop);
        // 将配置拆分为属性和可编辑的部分
        eidtMatterPop.length && eidtMatterPop.forEach((item,index) => {
          //物料信息里面有数量
          if(item.fieldCode === 'tdQty' || item.fieldCode === 'qualityQty' || item.editorType === 'r2Combo'){
            eidtMatterPopConfig.property = eidtMatterPop.slice(0, index);
            eidtMatterPopConfig.editPart = eidtMatterPop.slice(index)
          }
          
        })
        this.matterEditConfig = eidtMatterPopConfig;
        // 处理其他信息的配置
        let other = [];
        otherConfig.forEach(item => {
          if(!item.hiddenInRun){
            if(item.xtype === 'r2MultiSelector' && item.dataSource && item.dataSource.type === 'remoteData'){
              requestData(this.handlerParams(item)).then(data => {
                this.$set(item, 'remoteData', data.tableContent)
              })
            }
            other.push(item)
          }
        })
        this.otherConfig = other;
      })
    }
    
  },
  created() {
    register(); // 注册wx-js-sdk
    let { name, transCode, relationKey } = this.$route.query,
        { listId } = this.$route.params;
    this.listId = listId;
    // 获取本地保存的当前的主体
    let data = sessionStorage.getItem('ROSE_LOGIN_TOKEN');
    if(data) this.entity.dealerName = JSON.parse(data).entityId;
    // 请求页面的数据
    (async () => {
      this.getFormViews(); 
      this.getProcess();
      if(!transCode){
        this.getBaseInfoData();
      }
      this.getProcessStatus();  // 获取流程状态
      this.getAppDetail();
      this.initRequest && this.initRequest();   // 提交页面 不共用的数据 请求
      this.getPaymentTerm && this.getPaymentTerm();   // 提交页面 结算方式 请求
      this.getLogisticsTerms && this.getLogisticsTerms(); //提交页面 物流条款 请求
      if (transCode) {
        this.isResubmit = true;
        this.transCode = transCode;
        await this.getListId(transCode);
        await this.getUniqueId(transCode);
        this.getFormData && await this.getFormData();
      }
      if (relationKey) {
        this.relationKey = relationKey;
        this.getRelationData();
      }
      // 调用 wx-js-sdk
      wx.ready(() => {
        // 分享
        let shareInfo = {
          title: `创建新的${name}`,
          desc: `点击创建新的${name}订单`,
          imgUrl: 'https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=2952407151,1992384149&fm=26&gp=0.jpg'
          // imgUrl: `http://${document.domain}/dist/resources/images/icon/goods-sales-contract.png`
        }
        shareContent(shareInfo);
      })
    })()
  },
  mounted() {
    this.$nextTick(() => {
      this.fillBscroll = new Bscroll(this.$refs.fill, {
        click: true
      })
    })
    //解决android键盘收起input没有失去焦点，底部按钮遮挡输入框
    if(platfrom.isAndroid){
      window.onresize= ()=>{
        if(this.clientHeight>document.documentElement.clientHeight) {
          //底部按钮隐藏
            this.btnIsHide  = true;
        }else{
            this.btnIsHide = false;
            if(document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
              document.activeElement.blur();
            }
        }
      }
    }

  }
}
