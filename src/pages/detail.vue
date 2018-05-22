<template>
  <div class="pages">
    <div id='mescroll' class="mescroll" style='padding-bottom:50px;'>
      <div class='vux-1px-b'>
          <!-- SSXQ -->
        <ssxq 
          :detailInfo='formInfo' 
          :status='taskStatus' 
          :task='taskIdInfo' 
          :oldDetailInfo='oldformInfo'
          :assignedList='userList'
          @date='getDate'
          @userId='getuser'
          v-if='code.indexOf("SSXQ")>=0'>
        </ssxq>
        <!-- CPXQ -->
        <cpxq 
          :detailInfo='formInfo' 
          :status='taskStatus' 
          :task='taskIdInfo'
          :oldDetailInfo='oldformInfo'
          :assignedList='userList'
          @date='getDate'
          @userId='getuser'
          v-if='code.indexOf("CPXQ")>=0'>
        </cpxq> 
      </div>
      <div class="btn" v-if="taskStatus">
        <span @click="agree()" class='agree' v-if='taskIdInfo.actions&&taskIdInfo.actions.indexOf("agreement")>=0'>同意</span>
        <span @click="reject()" class='reject' v-if='taskIdInfo.actions&&taskIdInfo.actions.indexOf("disagree")>=0'>拒绝</span>
        <span @click='transfer()' class='transfer'>转办</span>
      </div>
      <div v-transfer-dom>
        <confirm v-model="confirmshow"
        @on-cancel="onCancel"
        @on-confirm="onConfirm">
          <group>
            <x-input title="实际工时:" type="number" v-model="taskTime"></x-input>
            <x-textarea title="任务备注:" v-model="remark"></x-textarea>	
          </group>
        </confirm>
      </div>
      <toast v-model="showPositionValue" type="text" :text='warn' is-show-mask  position="middle"></toast>
    </div>
  </div>
</template>

<script>
  import getDetailService from './../service/getDetailService.js'
  import Ssxq from "./component/SSXQForm.vue"
  import Cpxq from "./component/CPXQForm.vue"
  import Mbgl from "./component/MBGLForm.vue"
  import {Group,Confirm,XInput ,XTextarea ,Toast ,Flow, FlowState, FlowLine ,TransferDomDirective as TransferDom } from 'vux'
import { get } from 'https';
  export default {
    data() {
      return {
        formInfo : {},              //任务信息
        code : '',                  //任务编码
        taskStatus : true,          //是否代办
        taskIdInfo : [],            //任务id信息
        oldformInfo : {},           //旧接口任务信息
        confirmshow : false, 
        taskTime : 0.1,             //工时
        remark : '',                //备注
        etc : '',                   //预计交付时间
        showPositionValue:false,    //提示框状态
        warn:'',                    //提示内容
        userList:[],                //任务分配者列表
        assigned:''                 //任务被分配者

      }
    },
    directives: {
      TransferDom
    },
    components: {
        Ssxq,
        Cpxq,
        Mbgl,
        Confirm,
        XInput ,
        XTextarea ,
        Flow, 
        FlowState,
        FlowLine ,
        Group,
        Toast 
    },
    methods: {
      //任务同意
      agree(){
        if(this.etc==''){
          this.showPositionValue = true;
          this.warn = '预计交付时间不能为空'
        }
        else{
          this.confirmshow = true;
        }
      },
      //拒绝任务
      reject(){
        this.confirmshow = true;
      },
      //取消提交
      onCancel(){
			
      },
      //确认提交任务
      onConfirm(){
        let wfPara = {
          taskId : this.taskIdInfo.taskId,
          businessKey:this.code,
          devTyp:"开发",
          devUser:this.assigned,
          transCode:this.code,
          result:1,
          comment:this.remark,
          taskTim:this.taskTime
        }
        console.log(wfPara);
        for(let key in this.oldformInfo){
          console.log(key);
          console.log(this.oldformInfo[key]);
          if(key=='requirement'||key=='requirementProject'){
            this.oldformInfo[key].etc = this.etc;
          }
        }
        let data = {
          conn:20000,
          list:'trans_form_data',
          transCode:this.code,
          wfPara:JSON.stringify(wfPara),
          jsonData:JSON.stringify(this.oldformInfo)
        }
        console.log(data);
        getDetailService.submitTask(data).then(data=>{
          console.log(data);
        })
      },
      //预计交付时间
      getDate(res){
        this.etc = res;
      },  
      getuser(res){
        this.assigned  = res;
        console.log(res);

      } 
    },
    created() {
        let code = this.$route.query.code,
            status = this.$route.query.status,
            formId = '';
        this.code = code;
        if(status == 'done'){
          this.taskStatus = false;
        }
        (async()=>{
          //获取formId
          await getDetailService.getFormId(this.code).then(data=>{
            console.log(data);
            formId = data[0].uniqueId;
          })
          //获取任务的taskId
          await getDetailService.getTaskInfo(this.code).then( data=> {
            this.taskIdInfo  = data.tableContent[0];
            if(data.dataCount!=0){
              formId = data.tableContent[0].viewId;
            }
            console.log(this.taskIdInfo);
          })
          //获取要渲染的任务信息
          await getDetailService.getDetailInfo(formId,this.code).then( data=> {
            this.formInfo = data;
          })

        })()
        
        // if(code.indexOf('SSXQ') >= 0){
        //   formId = 'a43aed46-8273-478a-9161-ef940542ed71'
        // }
        // else if(code.indexOf('CPXQ') >= 0){
        //   formId = '1b282c62-fca0-4929-a581-253fe8f528bd'
        // }
        
        //获取老接口任务信息用于提交
        getDetailService.getDoInfo(this.code).then( data=> {
          console.log(JSON.parse(data.tableContent[0].json_data));
          this.oldformInfo = JSON.parse(data.tableContent[0].json_data);
        })
        //获取任务分配人
        getDetailService.getUserList().then( data=>{
          this.userList = data.tableContent;
        })

    },
    mounted() {
      //上下滑动
        let Mescroll = this.Mescroll,
            mescroll = new Mescroll("mescroll",{
                up:{
                    use:false,
                    isBounce: true
                },
                down:{
                    use:false
                }
            })
    }
  }
</script>

<style lang='scss' >
.vux-1px-b:after{
  border-color:#D9D9D9;
  color:#D9D9D9;
}
.vux-1px-t:before{
  border-color:#D9D9D9;
  color:#D9D9D9;
}
.vux-no-group-title,.vux-no-group-title{
	margin-top:0 !important;
}
.weui-cell:before{
	left:0 !important;
}
.vux-cell-primary {
text-align: left !important;
}
.vux-cell-box{
	color:#999;
}
.htmlfiel{
  box-sizing: border-box;
  width:100%;
  padding:10px;
  color:#999;
  font-size:17px !important;
  line-height: 24px;
  padding:10px 15px;
  span{
    font-size:17px !important;
  }
  
}
.weui-cells:after{
  border-bottom: 0px solid #D9D9D9 !important;
}
.vux-cell-box:not(:first-child):before{
    left:-10px !important;
}
.weui-dialog__bd:first-child {
	padding:0px !important; 
}
.btn{
  width:100%;
  height:46px;
  margin-top:30px;
  display: flex;
  position: fixed;
  left:0;
  bottom:0;
  span{
    flex:1;
    text-align: center;
    line-height: 46px;
  }
  .agree{
    background-color: #09bb07;
    color:#fff;
  }
  .reject{
    background-color: rgb(219, 50, 28);
    color:#fff;
  }
  .transfer{
    background-color: #f6f6f6;
  }
}
.user_list{
    line-height: 40px;
    padding-left:20px;
}
  
</style>
