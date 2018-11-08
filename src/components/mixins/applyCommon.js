import {commitTask, getBaseInfoData, getProcess, getProcessStatus} from 'service/commonService'
import {getListId, isMyflow, getSaleQuotePrice,} from 'service/detailService'
import {numberComma,} from 'vux'
import Bscroll from 'better-scroll'
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'
import platfrom from '@/plugins/platform/index'
import MatterItem from 'components/apply/commonPart/MatterItem'
import UploadFile from 'components/upload/UploadFile'
/* 引入微信相关 */
import {register} from 'plugins/wx'

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
    }
  },
  components: {
    MatterItem,UploadFile
  },
  computed: {
    // 合计金额
    totalAmount() {
      let total = 0;
      this.matterList.forEach(item => {
        let price = item.price || 0,
            tdQty = item.tdQty || 0;
        item.noTax = accMul(tdQty,price);
        total = accAdd(total, item.noTax);
      });
      return Number(total);
    },
    // 税金
    taxAmount() {
      let total = 0;
      this.matterList.forEach(item => {
        let price = item.price || 0,
            tdQty = item.tdQty || 0,
            taxRate = item.taxRate || 0;
        item.noTax = accMul(tdQty,price);
        total = accAdd(total, accMul(item.noTax,taxRate)).toFixed(2);

      });
      return total;
    },
    tdAmount() {
      return parseFloat(accAdd(this.totalAmount, Number(this.taxAmount)).toFixed(2))
    },
  },
  watch:{
    //修改的物料
    matter:{
      handler(val){
        let price = val.price || 0,
            tdQty = val.tdQty || 0,
            taxRate = val.taxRate || 0;
        val.noTaxAmount = accMul(price,tdQty).toFixed(2);
        val.taxAmount = accMul(val.noTaxAmount,taxRate).toFixed(2);
        val.tdAmount = accAdd(val.noTaxAmount,val.taxAmount).toFixed(2);
      },
      deep:true
    }
  },
  filters: {
    numberComma,
  },
  methods: {
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
              this.$router.go(-1);
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
                  this.$router.go(-1);
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
      getBaseInfoData().then(data => {
        this.formData = {
          ...this.formData,
          ...data,
          creator: data.handler,
          modifer: data.handler,
        };
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
      let { price, tdQty, qtyBal, qtyStockBal , qtyStock} = item;
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
        else if(qtyStock && tdQty > qtyStock){
          item.tdQty = qtyStock;
        }
        else if(qtyBal && tdQty > qtyBal){
          item.tdQty = qtyBal;
        }
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
        wx.onHistoryBack(() => {
          return this.onHistoryBack ? this.onHistoryBack() : true;
        });
      })
    },
  },
  created() {
    let data = sessionStorage.getItem('ROSE_LOGIN_TOKEN');
    register();
    this.listenBack();
    if(data){
      this.entity.dealerName = JSON.parse(data).entityId
    }
    let {transCode, relationKey = ''} = this.$route.query;
    (async () => {
      this.getProcess();
      this.getBaseInfoData();
      this.getProcessStatus();  // 获取流程状态
      this.initRequest && await this.initRequest();   // 提交页面 不共用的数据 请求
      this.getPaymentTerm && await this.getPaymentTerm();   // 提交页面 结算方式 请求
      this.getLogisticsTerms && await this.getLogisticsTerms(); //提交页面 物流条款 请求
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
      this.$loading.hide();
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
