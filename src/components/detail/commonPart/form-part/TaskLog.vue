<template>
  <!--任务日志-->
  <div class="task_container">
    <div class="task_log">
      <div class="task_log_status">
        <check-icon
          type="plain" 
          :value.sync="taskLog.logStatus">
          {{ taskLog.logStatus?'已办':'待办' }}
        </check-icon>
      </div>
      <div class="task_log_user">
        <search-selector 
          :title="'员工'" 
          @getSelectData="getSelectData" 
          :isRequired="isUserRequired">
        </search-selector>
      </div>
      <div class="task_log_title" :style="{borderColor:istitleRequired?'#e4393c':'#e8e8e8'}">
        <x-input ref="taskLogTitle" text-align="right" :max="100" v-model="logTitle" placeholder="请输入">
          <span 
            slot="label" 
            :style="{fontWeight:'bold',fontSize:'.14rem',color:istitleRequired?'#e4393c':'#4e9cec'}">
            标题
          </span>
        </x-input>
      </div>
      <div class="task_log_type">
        <popup-picker 
          v-if="taskLog.logType.length>0" 
          :data="logTypelist" 
          v-model="taskLog.logType" 
          placeholder="请选择">
          <span slot="title" :style="{color:'#4e9cec',fontSize:'.14rem',fontWeight:'bold'}">类型</span>
        </popup-picker>
      </div>
      <div class="task_log_date">
        <datetime title="日期" v-model="taskLog.taskDate"></datetime>
      </div>
      <div class="task_log_hour">
      
          <span>申报工时</span>
          <div>
            <r-number :num="1" :max="24" :min="0.1" v-model="taskLog.logDeclarationHours"></r-number>
          </div>
      </div>
      <div class="task_log_comment">
        <x-textarea 
          :max="200" 
          v-model="taskLog.comments" 
          placeholder="请输入您特别想要备注的信息">
        </x-textarea>
      </div>
      <div class="task_log_footer">
        <x-button :gradients="['#4CA3FB', '#4CA3FB']" @click.native="submitLog">提交</x-button>
      </div>
    </div>
  </div>
  
</template>

<script>
import { CheckIcon, XInput, PopupPicker, Datetime, XNumber, XTextarea, XButton, Toast } from 'vux'
import RNumber from 'components/public/RNumber'

import { getTaskLogType, saveTaskLog } from 'service/projectService'
import { initWebContext } from 'service/commonService'
import WebContext from 'service/commonService'

import SearchSelector from './FormSearchSelector'
export default {
  data() {
    return {
      logTitle: "",
      isUserRequired: false,
      istitleRequired: false,
      clearSelect: false,
      logTypelist: [[]],
      selectUsers: [],
      taskLog: {
        logStatus: false,
        taskDate: "",
        comments: "",
        logDeclarationHours: 1,
        logType: []
      }
    }
  },
  components: { 
    SearchSelector, 
    CheckIcon,
    XInput,
    PopupPicker,
    Datetime,
    XNumber,
    XTextarea,
    XButton,
    Toast,
    RNumber
  },
  watch: {
    logTitle(value) {
      if(value) this.istitleRequired = false;
    },
    selectUsers(value) {
      if(value.length > 0) this.isUserRequired = false;
    }
  },
  methods: {
    getSelectData(selectUser) {
      this.selectUsers = [];
      selectUser.forEach(val => {
        this.selectUsers.push(val.userId);
      })
    },
    submitLog() {
      const currentUser = WebContext.WebContext.currentUser;
      let formdata;
      if(this.taskLog.taskDate < this.formatDate(new Date()) && !this.taskLog.logStatus){
        this.$vux.toast.text('日期小于今日，日志类型应该为已办！');
      }else if(this.taskLog.taskDate > this.formatDate(new Date()) && this.taskLog.logStatus){
        this.$vux.toast.text('日期大于今日，日志类型应该为待办！');
      }else if(!this.logTitle){
        this.$vux.toast.text('有必填项未输入或选择！');
        this.istitleRequired = true;
      }else if(this.selectUsers.length === 0){
        this.$vux.toast.text('有必填项未输入或选择！');
        this.isUserRequired = true;
      }else{
        formdata = {
            listId: '2750a13d-295d-4776-9673-290c51bfc568',
            wfParam:null,
            userIds:this.selectUsers,
            formData:{
                baseinfo:{
                    handlerName: currentUser.name,
                    handlerUnitName: currentUser.depts && currentUser.depts[0] ? currentUser.depts[0].name : '',
                    handlerRoleName: currentUser.isSysRoleList[0].name,
                    handler: currentUser.userId,
                    handlerUnit:  currentUser.depts && currentUser.depts[0] ? currentUser.depts[0].id : '',
                    handlerRole: currentUser.isSysRoleList[0].id,
                    creator: currentUser.userId,
                    modifer: currentUser.userId,
                    id:'',
                    handlerEntity: currentUser.entityId,
                    biProcessStatus: this.taskLog.logStatus ? '已办' : '待办',
                    transType: 'YW146'
                },
                jobLog:{
                    logTitle: this.logTitle,
                    taskDate: this.taskLog.taskDate,
                    logDeclarationHours: this.taskLog.logDeclarationHours,
                    relTransCode: this.$route.params.transCode,
                    logType: this.taskLog.logType[0]
                },
                comment:{
                    biComment: this.taskLog.comments
                }
            } 
        };
        
        saveTaskLog(formdata).then(res => {
          if (res.success) {
              this.$vux.alert.show({
                title: "提示",
                content: "提交成功！",
                onHide: () => {
                  //跳转到日志列表
                  this.$router.replace({
                    path: '/taskLog',
                    query: {
                      listId: this.$route.params.listId,
                      transCode: this.$route.params.transCode
                    }
                  })
                }
              });
            }else{
              this.$vux.alert.show({
                title: "错误",
                content: res.message
              });
            }
        })
      }
    },
    //格式化日期方法
    formatDate(currentDate) {
      let date = new Date(currentDate),
          year = date.getFullYear(),
          month = date.getMonth() + 1,
          day = date.getDate();
      if (month >= 1 && month <= 9) {
        month = `0${month}`;
      }
      if (day >= 1 && day <= 9) {
        day = `0${day}`;
      }

      return `${year}-${month}-${day}`;
    },
    getLogType() {
      getTaskLogType('logType').then(res => {
        res.forEach(val => {
          this.logTypelist[0].push(val.name);
        })
        this.taskLog.logType.push(this.logTypelist[0][0])
      })
    }
  },
  created() {
    initWebContext().then(() => {
        this.taskLog.taskDate = this.formatDate(new Date());
        this.getLogType()
    })
    
  }
}
</script>

<style lang='scss' scoped>
  .task_log{
    color: #999;
    background-color: #fff;
    padding: .0rem .15rem;
    &_header{
      font-size: .17rem;
    }
    &_status{
      border-bottom: 1px solid #e8e8e8;
      padding: .1rem .03rem;
      color: #4e9cec;
      font-weight: bold;
    }
    .task_log_status /deep/ .weui-icon-success-circle:before{
      color: #4CA3FB;
    }
    &_title{
      border-bottom: 1px solid #e8e8e8;
      font-weight: bold;
      padding: .03rem 0rem;
      /deep/ .weui-cell{
        padding:10px 0px
      }
    }
    &_type{
      border-bottom: 1px solid #e8e8e8;
      padding: .03rem 0rem;
      font-size: .14rem;
      /deep/ .weui-cell{
        padding:10px 0px
      }
    }
    &_date{
      border-bottom: 1px solid #e8e8e8;
      color: #4e9cec;
      font-weight: bold;
      padding: .03rem 0rem;
      font-size: .14rem;
      /deep/ .weui-cell{
        padding:10px 0px
      }
    }
    &_hour{
      border-bottom: 1px solid #e8e8e8;
      color: #4e9cec;
      font-weight: bold;
      padding: .12rem 0rem;
      font-size: .14rem;
      div{
        float: right;
      }
    }
    &_comment{
      margin-left: -.15rem;
    }
    &_footer{
      position: fixed;
      left: 0;
      bottom: 0;
      width: 100%;
    }
  }
  .task_container{
    z-index: 1;
    height: 100%;
    overflow: auto;
    position:relative;
    background: #f8f8f8;
    -webkit-overflow-scrolling: touch;
  }
  .task_log_footer{
    button{
      border-radius: 0;
    }
  }
</style>
