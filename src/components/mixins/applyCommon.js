import {saveAndStartWf,saveAndCommitTask,commitTask} from 'service/commonService' 
import {getListId,isMyflow } from 'service/detailService.js'
export default{
  data(){
    return {
      uniqueId : '',
      isResubmit : false,    
      biComment : '',
      biReferenceId : '',
      transCode : '',
      taskId :'',
      btnInfo : {}, //操作按钮信息
      comment : '',//审批意见
    }
  },
  methods:{
    //获取listId
    getListId(transCode){
      return new Promise( resolve=>{
        getListId(transCode).then( data=>{
          this.uniqueId = data[0].uniqueId;
          resolve();
        })
      })
    },
    //获取uniqueid
    getUniqueId(transCode){
      return new Promise(resolve=>{
        isMyflow({transCode}).then( ({dataCount,tableContent})=>{
          if(dataCount > 0){
            this.taskId = tableContent[0].taskId;
            if(tableContent[0].isMyTask === 1){
              this.uniqueId = tableContent[0].viewId;
              this.btnInfo = tableContent[0];
            }
          }
          resolve()
        })        
      })
    },    
    //提交订单
    saveData(request,submitData){    
      request(submitData).then(data => {
        let {success = false, message = '提交失败'} = data;
        if (success) {
          message = '订单提交成功';
          this.$emit('change',true);
        }
        this.$vux.alert.show({
          content: message,
          onHide: () => {
            if (success) {
              this.$router.go(-1);
            }
          }
        });
      })    
    },
    //终止订单
    stopOrder(){
      this.$vux.confirm.prompt('', {
        title:'审批意见',
        onConfirm :(value)=>{
          if(value){
            this.comment = value;
          }
          let submitData = {
            taskId : this.taskId,
            taskData : JSON.stringify({
              result : -1,
              transCode : this.transCode,
              comment : this.comment
            })
          }
          commitTask(submitData).then(data=>{
            let {success = false, message = '提交失败'} = data;
            if (success) {
              message = '终止成功';
              this.$emit('change',true);
            }
            this.$vux.alert.show({
              content: message,
              onHide: () => {
                if (success) {
                  this.$router.go(-1);
                }
              }
            });
          })
        }
      })    
    }
  }
}