<template>
  <div class="pages">
    <div id='mescroll' class="detail" :class="{no_padding:!taskStatus}">
      <div class='detail-list-container ' ref="detailList">
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
          <!--工作流 -->
          <group v-if='formInfo.transCode_fgPlanInv'>
            <cell
              title="工作流"
              is-link
              :border-intent="false"
              :arrow-direction="flowShow ? 'up' : 'down'"
              @click.native="flowShow = !flowShow">
            </cell>
            <div class='process vux-1px-t' v-if="flowShow">
              <div class='agree_status'>
                <div v-for="(tab,index) in infoList" class='allInfo' :key="index">
                  <flow orientation="vertical">
                    <flow-state :is-done="tab.status||index<infoList.length-1?true:false" :state="index+1"></flow-state>
                    <flow-line  :is-done="tab.status?true:false" ></flow-line>

                  </flow>
                  <div class='info vux-1px-b' >
                    <p>
                      <span class='node_name'>{{tab.nodeName}}</span>
                      <span class='user_name'>{{tab.userName}}</span>
                    </p>
                    <p>
                      <span v-if="tab.endTime">{{tab.endTime}}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div class="choice">
                <ul>
                  <li v-for="(tab,index) in infoList" :key="index" v-if="tab.message">
                    <p class='title'>审批意见</p>
                    <!-- <i class='iconfont icon-yonghu'></i> -->
                    <img src='../common/touxiang.png' alt='' class='iconfont'/>
                    <div class="choice_content">
                      <p>
                        <span>{{tab.userName}}</span>
                        <em>{{tab.endTime}}</em>
                      </p>
                      <p>{{tab.message}}</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </group>
        </div>
      </div>
    </div>
    <!-- 任务确认框-->
    <div v-transfer-dom >
      <confirm
        v-model="confirmshow"
        @on-cancel="onCancel"
        @on-confirm="onConfirm">
        <group>
          <x-input
            title='实际工时:'
            type='number'
            v-model='taskTime'>
          </x-input>
          <x-textarea
            title='任务备注:'
            v-model='remark'
            class='vux-1px-b'>
          </x-textarea>
        </group>
        <div class='transfer_info'
             v-if='transferUserList.length>0'>
          <div class='transfer_title vux-1px-b'>
            <span>序号</span>
            <span>工号</span>
            <span>姓名</span>
          </div>
          <div class='transfer_list' ref="transferList">
            <ul>
              <li
                v-for='(item1,index1) in transferUserList'
                :key='index1'
                @click='getTransfer(item1,index1)'
                :class="{ choiced: index1===choicedIndex }"
              >
                <span>{{index1+1}}</span>
                <span>{{item1.userCode}}</span>
                <span>{{item1.nickname}}</span>
              </li>
            </ul>
          </div>
        </div>
      </confirm>
    </div>
    <!-- 弹框提示 -->
    <toast v-model="showPositionValue" type="text" :text='warn' is-show-mask  position="middle"></toast>
    <!-- 操作按钮 -->
    <div class="btn" v-if="taskIdInfo.dataCount===1&&taskIdInfo.tableContent[0].isMyTask===1" >
      <span @click='transfer()' class='transfer'>转办</span>
      <span @click="reject()" class='reject' v-if='taskIdInfo.tableContent[0].actions&&taskIdInfo.tableContent[0].actions.indexOf("disagree")>=0'>拒绝</span>
      <span @click="agree()" class='agree' v-if='taskIdInfo.tableContent[0].actions&&taskIdInfo.tableContent[0].actions.indexOf("agreement")>=0'>同意</span>
    </div>
  </div>
</template>

<script>
  import getDetailService from './../service/getDetailService.js'
  import Ssxq from "./component/SSXQForm.vue"
  import Cpxq from "./component/CPXQForm.vue"
  import Mbgl from "./component/MBGLForm.vue"
  import {Group,Cell,Confirm,XInput ,XTextarea ,Toast ,Spinner,Flow, FlowState, FlowLine ,TransferDomDirective as TransferDom } from 'vux'
  import BScroll from 'better-scroll'
  export default {
    data() {
      return {
        formInfo : {},              //任务信息
        code : '',                  //任务编码
        taskStatus : true,          //是否代办
        taskIdInfo : [],            //任务id信息
        oldformInfo : {},           //旧接口任务信息
        infoList:[],                //工作流列表
        viewType:'',                //任务view类型
        confirmshow : false,        //任务确认框状态
        flowShow:false,             //工作流显示状态
        taskTime : 0.1,             //工时
        remark : '',                //备注
        etc : '',                   //预计交付时间
        showPositionValue:false,    //提示框状态
        warn:'',                    //提示内容
        userList:[],                //任务分配者列表
        assignStatus:false,         //是否有分配人
        assigned:{},                //任务被分配者
        agreeStatus:1,              //是否同意 1同意，0 拒绝
        transferUserList:[],        //转办人员列表
        transferInfo:{},            //选中转办人员信息
        choicedIndex:-1,            //转办人员选中的class
        devType:'',                 //业务类型
        detailListScroll: null,   // 最外层容器滚动对象
        transferListScroll: null, // 转办列表滚动对象
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
        Toast ,
        Cell,
        Spinner
    },
    methods: {
      getEventTar(e){
        console.log(e)
      },
      //任务同意
      agree(){
        this.confirmshow = true;
        this.agreeStatus = 1;
        this.transferUserList = [];
      },
      //拒绝任务
      reject(){
        this.confirmshow = true;
        this.agreeStatus = 0;
        this.transferUserList = [];
      },
      //转办任务
      transfer(){
        this.confirmshow = true;
        getDetailService.getTransferUserList().then( data=>{
          this.transferUserList = data.tableContent;
          this.$nextTick(() => {
            if(!this.transferListScroll) {
              this.transferListScroll = new BScroll(this.$refs.transferList, {
                click: true,
                top: false,
                bottom: false

              })
            }
          })
        })

      },
      //获取选中的转办人信息
      getTransfer(obj,i){
        this.transferInfo = obj;
        this.choicedIndex = i;
      },
      //取消提交
      onCancel(){

      },
      //viewType为marking的任务提交
      SaveData(){
        for(let key in this.oldformInfo){
          if(key === 'requirement'||key === 'requirementProject'){
            this.oldformInfo[key].etc = this.etc;
            //this.devType = this.oldformInfo[k].provideType.selection.data.text;
            if(this.oldformInfo[key].provideType){
              this.devType = this.oldformInfo[key].provideType.value;
            }
          }
        }
        let wfPara = {
          'taskId' : this.taskIdInfo.taskId,
          'businessKey':this.code,
          'devUser':this.assigned.userId,
          'devType':this.devType,
          'transCode':this.code,
          'result':this.agreeStatus,
          'comment':this.remark,
          'taskTime':this.taskTime
        }
        let data = {
          conn:20000,
          list:'trans_form_data',
          transCode:this.code,
          wfPara:JSON.stringify(wfPara),
          jsonData:JSON.stringify(this.oldformInfo)
        }
        getDetailService.saveAndCommitTask(data).then(data=>{
          if(data.success){
            this.showPositionValue = true;
            this.warn = '提交成功';
            setTimeout(()=>{
              this.$router.push("/home");
            },500)
          }
          else{
            this.showPositionValue = true;
            this.warn = data.message;
          }
        })

      },
      //viewType为view的任务提交
      commitTask(){
        let jsonData = {
            'transCode':this.code,
            'result':this.agreeStatus,
            'comment':this.remark,
            'taskTime':this.taskTime
          }
        let data = {
          jsonData:JSON.stringify(jsonData)
        }
        if(this.remark === ''){
          this.showPositionValue = true;
          this.warn = '【任务备注】不能为空'
        }
        else{
          getDetailService.commitTask(data,this.taskIdInfo.taskId).then( data=>{
            if(data.success){
              this.showPositionValue = true;
              this.warn = '提交成功';
              setTimeout(()=>{
                this.$router.push("/home");
              },500)
            }
            else{
              this.showPositionValue = true;
              this.warn = data.message;
            }
          })
        }
      },
      //确认提交任务
      onConfirm(){
        //转办
        if(this.transferUserList.length>0){
          if(this.remark === ''){
            this.showPositionValue = true;
            this.warn = '【备注】不能为空';
             this.choicedIndex = -1;
          }
          else if(!this.transferInfo.userId){
            this.showPositionValue = true;
            this.warn = '【转办人】不能为空'
          }
          else{
            let data = {
              userId : this.transferInfo.userId,
              userCode : this.transferInfo.userCode,
              taskId : this.taskIdInfo.taskId,
              comment : this.remark,
              taskTime : this.taskTime

            }
            getDetailService.transferTask(data).then( data=>{
              console.log(data);
              if(data.success){
                this.showPositionValue = true;
                this.warn = '转办成功';
                setTimeout(()=>{
                  this.$router.push("/home");
                },500)
              }
              else{
                this.showPositionValue = true;
                this.warn = '转办失败'
              }
            })
          }

        }
        //同意，拒绝
        else{
          if(this.viewType === 'marking'){
            if(this.agreeStatus === 0) {
              if(this.remark === ''){
                this.showPositionValue = true;
                this.warn = '【备注】不能为空'
              }
              else{
                this.SaveData()
              }
            }
            else{
              if(this.taskIdInfo.dataCount === 1&&this.taskIdInfo.tableContent[0].nodeName === '承接任务'&&this.etc === ''){
                this.showPositionValue = true;
                this.warn = '【预计交付时间】不能为空';
              }
              else if(this.formInfo.assignedTo_fgPlanInv&&!this.assigned.userId){
                this.showPositionValue = true;
                this.warn = '【分配给】不能为空';
              }
              else{
                this.SaveData()
              }
            }
          }
          else if(this.viewType === 'view'){
            this.commitTask()
          }
        }
      },
      //预计交付时间
      getDate(res){
        this.etc = res;
      },
      //任务被分配人
      getuser(res){
        this.assigned  = res;
        this.assignStatus = true;
      }
    },
    created() {
        let code = this.$route.query.code,
            status = this.$route.query.status,
            formId = '';
        this.code = code;
        if(status === 'done'){
          this.taskStatus = false;
        }
        (async()=>{
          //获取formId
          await getDetailService.getFormId(this.code).then(data=>{
            formId = data[0].uniqueId;
          })
          //获取任务的taskId
          await getDetailService.getTaskInfo(this.code).then( data=> {
            // this.taskIdInfo  = data.tableContent[0];
            this.taskIdInfo  = data;
            if(data.dataCount!=0){
              formId = data.tableContent[0].viewId;
            }
          })
          //获取要渲染的任务信息
          await getDetailService.getDetailInfo(formId,this.code).then( data=> {
            this.formInfo = data;
          })
          //获取viewType来确定提交的接口
          await getDetailService.getViewId(formId).then( data=>{
            //console.log(data[0].config);
            this.viewType = data[0].viewType;
            //console.log(this.viewType);

          })

        })()
        //获取老接口任务信息用于提交
        getDetailService.getDoInfo(this.code).then( data=> {
          this.oldformInfo = JSON.parse(data.tableContent[0].json_data);
          //this.oldformInfo = data.tableContent[0].json_data;
        })
        //获取任务分配人
        getDetailService.getUserList().then( data=>{
          this.userList = data.tableContent;
        })
        //获取任务流列表
        getDetailService.getFlowList(this.code).then( data=>{
          this.infoList = data.tableContent;
        })

    },
    mounted() {
      this.$nextTick(() => {
        if(!this.detailListScroll){
          this.detailListScroll = new BScroll(this.$refs.detailList, {
            click:true,
            bounce:{
              top: false,
              bottom: false
            }
          })
        }
      })
    }
  }
</script>

<style lang='scss' >
.pages{
  /** 重置vux */
  .vux-1px-b:after{
    border-color:#D9D9D9;
    color:#D9D9D9;
  }
  .vux-1px-t:before{
    border-color:#D9D9D9;
    color:#D9D9D9;
  }
  .vux-no-group-title,.vux-no-group-title{
    margin-top:0 ;
  }
  .weui-cell:before{
    left:0 ;
  }
  .vux-cell-primary {
  text-align: left ;
  }
  .vux-cell-box{
    color:#999;
  }
  .weui-cells:after{
    border-bottom: 0px solid #D9D9D9 ;
  }
  .vux-cell-box:not(:first-child):before{
      left:-10px ;
  }
  .weui-wepay-flow, .weui-wepay-flow-auto{
    padding: 0 ;
    position: absolute;
    left:-20px;
    top:15px;
    height:100%;
  }
  .weui-wepay-flow__li .weui-wepay-flow__state {
    width: 20px ;
    height: 20px ;
    border-radius: 50% ;
    line-height: 20px ;
    left: -2px ;

  }
}
 /** 重置vux */
.v-transfer-dom{
  .weui-dialog__bd:first-child {
    padding:0px ;
  }
  .weui-cells{
    margin-top:0;
  }
}
.detail{
  position: fixed;
  z-index:100;
  padding-bottom:46px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  background: #fff;
  overflow: auto;
  .detail-list-container {
    height: 100%;
    overflow: hidden;
  }
  /** 用户故事*/
  .htmlfiel{
    box-sizing: border-box;
    width:100%;
    color:#999;
    font-size:17px !important;
    line-height: 24px;
    padding:10px 15px;
    overflow-x: scroll;
    span{
      font-size:17px !important;
    }

  }
  /** 工作流*/
  .process{
    width:100%;
    background: #F0F2F5;
    .agree_status{
      background: #FFF;
      padding-bottom:0.2rem;
      .allInfo{
        margin-left:0.8rem;
        position: relative;
        .info{
          // border-bottom:1px solid #ccc;
          padding: 0.2rem;
          position: relative;
          vertical-align: middle;
          p{
            display: block;
            margin-left:0.6rem;
            span{
              display: inline-block;
              font-size:0.3rem;
              margin-bottom:0.1rem;
              margin-right: 0.4rem;
            }
            .node_name{
              float:right;
              width:3rem;
            }
          }
        }
        &:last-child {
          margin-bottom:0.2rem;
          .weui-wepay-flow__line{
            display: none;
          }
        }
      }

    }
    /** 审批意见*/
    .choice{
      width:100%;
      padding-top:0.9rem;
      box-sizing: border-box;
      background: #fff;
      ul{
        li{
          font-size:0.3rem;
          border-bottom: 1px solid #d9d9d9;
          position: relative;
          .iconfont{
            position: absolute;
            left:0.4rem;
            top:0.3rem;
            width:0.4rem;
            height:0.4rem;
          }
          .title{
            position:absolute;
            left:0;
            top:-0.64rem;
            width:100%;
            border-bottom: 1px solid #d9d9d9;
            padding-left: 0.4rem;
            background:#fff;
            display:none;
            margin-bottom:0;
            height:0.64rem;
            line-height:0.64rem;
          }
          &:first-child .title{
            display:block;
          }
          .choice_content{
            padding-left: 1rem;
            p{
              width:100%;
              line-height: 0.6rem;
              padding-right:0.2rem;
              em{
                float: right;
                font-style: normal;
                margin-right:0.2rem;
              }
            }
          }
        }
      }
    }


  }

}
.no_padding{
  padding-bottom:0;
}
/** 分配给 */
  .user_list{
    line-height: 0.8rem;
    text-align: center;

  }

/** 底部按钮 */
.btn{
  width:100%;
  height:46px;
  background: #fff;
  display: flex;
  position: fixed;
  left:0;
  bottom:0;
  z-index:110;
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

/** 转办人员信息*/
.transfer_info{
  width:100%;
  .transfer_title{
    height:0.6rem;
    display: flex;
    span{
      flex:1;
      line-height: 0.6rem;
    }
  }
  .transfer_list{
    height:4rem;
    overflow: hidden;
    li{
      display: flex;
      span{
        flex:1;
        line-height: 0.6rem;
      }
    }
     li.choiced{
      background-color: #ccc;
    }
  }
}


</style>
