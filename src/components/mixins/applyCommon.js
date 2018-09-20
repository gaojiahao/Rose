import {commitTask, getBaseInfoData, getProcess,submitAndCalc} from 'service/commonService'
import {getListId, isMyflow, getSaleQuotePrice,} from 'service/detailService'
import {numberComma,} from 'vux'
import Bscroll from 'better-scroll'
import {accAdd, accMul} from '@/home/pages/maps/decimalsAdd'
import {toFixed} from '@/plugins/calc'

export default {
  data() {
    return {
      uniqueId: '',
      isResubmit: false,
      biComment: '',
      biReferenceId: '',
      transCode: '',
      taskId: '',
      btnInfo: {}, //操作按钮信息
      comment: '',//审批意见
      formViewUniqueId: '',
      fillBscroll: null,
      actions: [],
      processCode: '', // 流程编码，用于新建的工作流
      entity: {
        dealerName: '中国特瑞'
      },
      matterModifyClass : false,
      selItems : [], //选中的要删除的物料
    }
  },
  computed: {
    // 合计金额
    totalAmount() {
      let total = 0;
      this.matterList.forEach(item => {
        total = accAdd(total, accMul(item.tdQty, item.price));
      });
      return Number(total);
    },
    // 税金
    taxAmount() {
      return (accMul(this.totalAmount, this.taxRate)).toFixed(2)
    },
    tdAmount() {
      return parseFloat(accAdd(this.totalAmount, this.taxAmount).toFixed(2))
    }
  },
  filters: {
    numberComma,
  },
  methods: {
    //展开可删除装填
    showDelete(){
      this.matterModifyClass = ! this.matterModifyClass;
      this.selItems = [];
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
        };
      })
    },
    // TODO 获取物料价格
    getMatPrice() {
      this.matterList.forEach((item, index) => {
        // 如果已有价格，则不发起请求
        // if (item.price) {
        //   return
        // }
        getSaleQuotePrice({
          drDealerCode: this.dealerInfo.dealerCode,
          matCode: item.inventoryCode,
          noCount: 1,
        }).then(({tableContent = []}) => {
          let [lastest = {}] = tableContent; // 取第一个价格
          item.price = lastest.price || item.price;
        })
      });
    },
    // TODO 获取工作流的processCode
    getProcess() {
      return getProcess(this.listId).then(([data = {}]) => {
        this.processCode = data.processCode || '';
      })
    },
    // TODO 检查金额，取正数、保留两位小数
    checkAmt(item){
      let { price, tdQty } = item;
      // 金额
      if (price) {
        item.price = Math.abs(toFixed(price));
      }
      // 数量
      if(tdQty){
        item.tdQty = Math.abs(toFixed(tdQty));
      }
    },
  },
  created() {
    let data = sessionStorage.getItem('ROSE_LOGIN_TOKEN');
    if(data){
      this.entity.dealerName = JSON.parse(data).entityId
    }
    let {transCode} = this.$route.query;
    (async () => {
      this.getBaseInfoData();
      this.getProcess();
      this.initRequest && await this.initRequest(); // 提交页面不共用的数据请求
      if (transCode) {
        this.isResubmit = true;
        this.transCode = transCode;
        await this.getListId(transCode);
        await this.getUniqueId(transCode);
        this.getFormData && await this.getFormData();
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
  }
}
