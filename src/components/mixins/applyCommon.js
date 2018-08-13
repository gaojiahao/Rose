import {saveAndStartWf, saveAndCommitTask, commitTask, getBaseInfoData,} from 'service/commonService'
import {getListId, isMyflow, getSaleQuotePrice,} from 'service/detailService'
import {numberComma,} from 'vux'

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
    }
  },
  computed: {
    // 合计金额
    totalAmount() {
      let total = 0;
      this.matterList.forEach(item=>{
        total += item.tdQty * item.price;
      })
      return Number(total);
    },
    // 税金
    taxAmount() {
      return (this.totalAmount * this.taxRate).toFixed(2)
    },
    tdAmount(){
      return (this.totalAmount + Number(this.taxAmount)).toFixed(2)
    }
  },
  filters: {
    numberComma,
  },
  methods: {
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
        isMyflow({transCode}).then(({dataCount, tableContent}) => {
         
          if (dataCount > 0) {
            this.taskId = tableContent[0].taskId;
            if (tableContent[0].isMyTask === 1) {
              this.uniqueId = tableContent[0].viewId;
              this.formViewUniqueId = tableContent[0].viewId;
              this.btnInfo = tableContent[0];
              this.actions = tableContent[0].actions.split(',');
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
      this.$emit('close',true)
      request(submitData).then(data => {
        this.$emit('close',false)
        let {success = false, message = '提交失败'} = data;
        if (success) {
          message = '订单提交成功';
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
      }).catch(e=>{
        this.$emit('close',false)
      })
    },
    //终止订单
    stopOrder() {
      this.$vux.confirm.prompt('', {
        title: '审批意见',
        onConfirm: (value) => {
          this.$emit('close',true);
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
            this.$emit('close',false);
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
          }).catch(e=>{
            this.$emit('close',false);
          })
        }
      })
    },
    // TODO 获取用户基本信息
    getBaseInfoData() {
      getBaseInfoData().then(data => {
        if(!this.transCode){
          this.$emit('input',false)
        }
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
          item.price = lastest.price || 90;
        })
      });
    },
  },
  created() {
    let {transCode} = this.$route.query;
    this.getBaseInfoData();
    if (transCode) {
      this.isResubmit = true;
      this.transCode = transCode;
      (async () => {
        await this.getListId(transCode);
        await this.getUniqueId(transCode);
        this.getFormData && this.getFormData();
        this.$emit('input',false);
      })()
    }
  }
}
