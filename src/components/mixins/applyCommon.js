import {commitTask, getBaseInfoData, getProcess, getProcessStatus} from 'service/commonService'
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
      businessKey: '', // 应用前缀
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
        let noTaxPrice = item.noTaxPrice || 0,
            assistQty = item.assistQty || 0,
            taxRate = item.taxRate || 0;
        total = accAdd(total, accMul(assistQty, taxRate, noTaxPrice));
      });
      return toFixed(total);
    },
    // 税金小计
    tdAmount() {
      let total = 0;
      this.matterList.forEach(item => {
        let price = item.price || 0,
            assistQty = item.assistQty || 0;
        total = accAdd(total, accMul(price, assistQty));
      });
      return toFixed(total);
      // return parseFloat(accAdd(this.totalAmount, Number(this.taxAmount)).toFixed(2))
    },
  },
  watch:{
    //修改的物料
    matter:{
      handler(val){
        let price = val.price || 0,
            tdQty = val.tdQty || 0,
            taxRate = val.taxRate || 0;
        val.assistQty = toFixed(accDiv(tdQty, val.assMeasureScale));
        val.noTaxPrice = toFixed(accDiv(price, accAdd(1, taxRate)));
        val.tdAmount = toFixed(accMul(price, val.assistQty));
        val.taxAmount = toFixed(accMul(val.assistQty, taxRate, val.noTaxPrice));
        val.noTaxAmount = accSub(val.tdAmount, val.taxAmount);
        // val.noTaxAmount = accMul(price,tdQty).toFixed(2);
        // val.taxAmount = accMul(val.noTaxAmount,taxRate).toFixed(2);
        // val.tdAmount = accAdd(val.noTaxAmount,val.taxAmount).toFixed(2);
      },
      deep:true
    }
  },
  filters: {
    numberComma,
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
      // this.biReferenceId = biReferenceId;
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
        let {fileId, listId} = this.$route.params;
        this.$router.replace({
          path: `/detail/${fileId}/${listId}`,
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
