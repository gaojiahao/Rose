<template>
<!--项目任务-->
  <div class="detail_wrapper xmrw-detail-container" style="height:100%;">
    <div class="basicPart swiper-container task-form" ref="fill">
      <div class="wrapper">
        <div class="slide">
          <!-- 经办信息 （订单、主体等） -->
          <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
          <!-- 项目任务信息 -->
          <only-word :config="otherConfig" :info="projectTask"></only-word>
          <!-- 备注 -->
          <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
          <upload-file @on-upload="onUploadFile" :default-value="attachment" :biReferenceId="biReferenceId"></upload-file>
        </div>
      </div>
    </div>
    <r2-action v-if="showAction" :workFlowLogs="workflowLogs" :formStatus="formStatusArr"/>
    </div>
</template>

<script>
// vux组件引入
import { Cell, Group, dateFormat, XTextarea } from 'vux'
// 请求 引入
import { getSOList, findAllJobLog } from 'service/detailService'
import { findProjectTask, saveJobLog } from 'service/projectService'
// mixins 引入
import common from '@/mixins/common'
import detailCommon from 'mixins/detailCommon'
// 组件 引入
import RPicker from 'components/public/RPicker'
import RAction from 'components/public/RAction'
import onlyWord from 'components/detail/commonPart/form-part/onlyWord'
// 插件 引入
import Bscroll from "better-scroll";
export default {
  data() {
    return {
      taskLog: {
        taskDate: dateFormat(new Date().getTime(), 'YYYY-MM-DD'), // 默认日期为 今天
      },
      comment: {},
      projectTask: {},
      defaultUserInfo: {},//默认用户信息
      logList: [],
      pageSwiper: null,
      biReferenceId:'',
      showAction: false,
      workflowLogs:[],
    }
  },
  watch:{
    baseinfoConfig:{
      handler(val){
        let {currentUser} = val,
            {sysDeptList,sysRoleList} = currentUser;
            
          this.defaultUserInfo = {
            handler: currentUser.userId,  // 用户id
            handlerName: currentUser.nickname,  //用户名称
            handlerUnit: sysDeptList[0].groupId,  // 用户组织id
            handlerUnitName: sysDeptList[0].groupName,  // 用户组织名称
            handlerRole: sysRoleList[0].id || '',  // 用户职位id
            handlerRoleName: sysRoleList[0].name || '' // 用户职位名称
            // userCode: basicUserInfo.userCode, // 用户工号
          }
      }
    }
  },
  mixins: [detailCommon, common],
  components: {
    Cell, Group, RAction, 
    RPicker, onlyWord, XTextarea,
  },
  filters: {
    timeSplit(val) {
      return val ? val.split(' ')[0] : '';
    }
  },
  methods: {
    //选择默认图片
    getDefaultImg(item) {
      let url = require('assets/wl_default03.png');
      if (item) {
        item.inventoryPic = url;
      }
      return url
    },
    // 获取详情
    getOrderList(transCode = '') {
      return findProjectTask(transCode).then(({formData = {},attachment = []}) => {
        this.jsonData = formData;
        this.attachment = attachment;
        this.comment = formData.comment;
        this.projectTask = {
          ...formData.projectPlanTask,
          ...formData.projectApproval,
        };
        this.orderInfo = {
          ...formData.baseinfo,
          biStatus: '已生效'
        };
        this.biReferenceId = formData.biReferenceId;
      })
    },
    // 选择日期
    getDate(sItem, dItem){
      this.$vux.datetime.show({
        confirmText: '确认',
        cancelText: '取消',
        onConfirm: (val)=> {
          this.taskLog.taskDate = val;
        },
      })
    },
    checkHour(val){
      if (val < 0) {
        this.taskLog.logDeclarationHours = Math.abs(val)
      }
    },
    save(){
      let warn = '';
      if (!this.taskLog.logTitle){
        warn = '请输入标题'
      }
      if (!this.taskLog.logDeclarationHours){
        warn = '请输入申报工时'
      }
      if (warn) {
        this.$vux.alert.show({
          content: warn
        });
        return
      }
      this.$vux.confirm.show({
        content: '确认提交?',
        // 确定回调
        onConfirm: () => {
          this.$HandleLoad.show();
          let submitData = {
            listId: '2750a13d-295d-4776-9673-290c51bfc568', // 任务日志listId
            formData: {
              comment: {
                biComment: this.taskLog.biComment || '',
              },
              baseinfo: {
                ...this.defaultUserInfo,
                id: '',
                biProcessStatus: this.orderInfo.biProcessStatus,
                handlerEntity: this.orderInfo.handlerEntity,
                creator: this.defaultUserInfo.handler,                          
                modifer: this.defaultUserInfo.handler,
              },
              jobLog: {
                ...this.taskLog,
                projectTaskId: this.projectTask.projectPlanTaskId,
              }
            },
            wfParam: null
          };
          saveJobLog(submitData).then(data => {
            this.$HandleLoad.hide()
            let {success = false, message = '提交失败'} = data;
            if (success) {
              message = '提交成功';
            }
            this.$vux.alert.show({
              content: message,
              onHide: () => {
                this.findAllJobLog();
                this.taskLog = {
                  logTitle: '',
                  logDeclarationHours: 1,
                  taskDate: dateFormat(new Date().getTime(), 'YYYY-MM-DD'),
                  biComment: ''
                }
              }
            });
          }).catch(e => {
            this.$HandleLoad.hide();
          })
        }
      });
    },
    // swiper切换至 任务日志
    goSumbitTask() {
      this.pageSwiper.slideTo(1);
    },
    // 请求 任务列表
    findAllJobLog() {
      return findAllJobLog(this.transCode).then(({ tableContent }) => {
        this.logList = tableContent;
      })
    },
  },
  created() {
    this.$nextTick(() => {
      this.$parent.detailScroll.destroy();
          this.fillBscroll = new Bscroll(this.$refs.fill, {
            click: true
          });
        });
     
  }
}
</script>

<style lang='scss' scoped>
  @import '~scss/biz-app/bizDetail';
  .xmrw-detail-container {
    .main_content { 
      font-size: .14rem;
      padding: 0 .15rem;
      box-sizing: border-box;
      &.task_log {
        margin-bottom: unset;
        .log_title {
          display: block;
          font-size: 16px;
          padding: .1rem 0;
          line-height: 16px;
          font-weight: bold;
        }
      }
      .weui-cell {
        padding: .17rem 0;
        &:before {
          border: none;
          left: 0;
        }
        /deep/ .weui-label{
          font-size: .14rem;
          color: #999;
        }
      }
      /deep/ .weui-cells {
        margin-top: 0;
        font-size: .16rem;
        &:before {
          border-top: none;
        }
        &:after {
          border-bottom: none;
        }
        
      }
    }
    .each_info {
      input {
        outline: none;
        border: none;
      }
      .required {
        color: #3296FA;
        font-weight: bold;
      }
    }
    .handle {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      height: auto;
      padding: .1rem;
      line-height: .12rem;
      text-align: center;
      font-size: .12rem;
      box-sizing: border-box;
      margin: 0;
      background: #fff;
      .btn_item {
        display: inline-block;
        padding: .08rem .28rem;
        color: #fff;
        background-color: #3296FA;
        border-radius: .04rem;
      }
    }
    .log-list {
      @extend .form_content;
      padding: 0 .15rem;
      background: #FFF;
      .log_title {
        display: block;
        font-size: 16px;
        padding: .1rem 0;
        line-height: 16px;
        font-weight: bold;      
      }
      .each_log {
        display: flex;
        padding: .15rem 0;
        .log_man_avater {
          width: .4rem;
          height: .4rem;
          img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 50%;
          }
        }
        .log_main {
          flex: 1;
          margin-left: .06rem;
          .basic_info {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .user_name {
              color: #696969;
              font-size: .14rem;  
              line-height: .14rem;
            }
            .submit_time {
              color: #ccc;
              font-size: .12rem;            
              margin-top: .05rem;
              line-height: .12rem;
            }
            .man_hour {
              @extend .user_name;
              font-size: .12rem;
            }
          }
          .main_info {
            .each_log_title {
              color: #696969;
              font-size: .14rem;
              font-weight: bold;
              padding: .1rem 0 .04rem;
            }
            .each_log_comment {
              color: #999;
              font-size: .12rem;
            }
          }
        }
      }
    }
  }
  .task-form{
    height:calc(100% - 1.02rem)
  }
</style>
