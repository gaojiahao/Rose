<template>
  <div class="detail_wrapper xmrw-detail-container">
    <div class="basicPart swiper-container task-form">
      <div class="swiper-wrapper">
        <div class="swiper-slide">
          <div class="related_tips" @click="goSumbitTask">
            <span>有新的任务日志需要提交？</span>
            <x-icon class="r_arw" type="ios-arrow-forward" size="16"></x-icon>
          </div>
          <!-- 经办信息 （订单、主体等） -->
          <basic-info :work-flow-info="orderInfo" :order-info="orderInfo"></basic-info>
          <!-- 项目任务信息 -->
          <only-word :config="otherConfig" :info="projectTask"></only-word>
          <!-- 备注 -->
          <other-part :other-info="orderInfo" :attachment="attachment"></other-part>
          <!-- 审批操作 -->
          <r-action :code="transCode" :task-id="taskId" :actions="actions"
                    :name="$route.query.name" @on-submit-success="submitSuccessCallback"></r-action>
        </div>
        <div class="swiper-slide">
          <!-- 任务日志 -->
          <div class="form_content">
            <div class="main_content task_log">
              <span class="log_title vux-1px-b">任务日志</span>
              <div class="each_info vux-1px-b">
                <label class="required">标题</label>
                <input type='text' v-model="taskLog.logTitle" placeholder="请输入" class='field_value' @focus="getFocus($event)"/>
              </div>
              <div class="each_info vux-1px-b" @click="getDate">
                <label class="required">日期</label>
                <div class='picker'>
                  <span class='mater_nature'>{{taskLog.taskDate || "请选择"}}</span>
                  <span class='icon-right'></span>
                </div>
              </div>
              <div class="each_info vux-1px-b">
                <label class="required">申报工时</label>
                <input type='number' v-model.number="taskLog.logDeclarationHours" placeholder="请输入" class='field_value' @focus="getFocus($event)" 
                      @blur="checkHour(taskLog.logDeclarationHours)"/>
              </div>
              <x-textarea class="vux-1px-b" title="备注" v-model="taskLog.biComment" placeholder="请输入"></x-textarea>
            </div>
            <div class="handle">
              <span class="btn_item" @click="save">日志提交</span>
            </div>
            
          </div>
          <!-- 日志历史提交记录 -->
          <div class="log-list">
            <p class="log_title">提交记录</p>
            <div class="each_log vux-1px-t" v-for="(item, index) in logList" :key="index">
               <div class="log_man_avater">
                 <img :src=item.photo>
               </div>
              <div class="log_main">
                <div class="basic_info">
                  <div>
                    <p class="user_name">{{item.handlerName}}</p>
                    <p class="submit_time">{{item.taskDate}}</p>
                  </div>
                  <div>
                    <p class="man_hour">工时: {{item.logDeclarationHours}}小时</p>
                  </div>
                </div>
                <div class="main_info">
                  <p class="each_log_title">{{item.logTitle}}</p>
                  <p class="each_log_comment">备注: {{item.comment}}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
// vux组件引入
import { Cell, Group, dateFormat, XTextarea } from 'vux'
// 请求 引入
import { getSOList, findAllJobLog } from 'service/detailService'
import { getBaseInfoData } from 'service/commonService'
import { findProjectTask, saveJobLog } from 'service/projectService'
// mixins 引入
import common from '@/mixins/common'
import detailCommon from 'components/mixins/detailCommon'
// 组件 引入
import RPicker from 'components/RPicker'
import RAction from 'components/RAction'
import onlyWord from 'components/detail/commonPart/form-part/onlyWord'

export default {
  data() {
    return {
      taskLog: {
        taskDate: dateFormat(new Date().getTime(), 'YYYY-MM-DD'), // 默认日期为 今天
      },
      comment: {},
      projectTask: {},
      defaultUserInfo: {},
      logList: [],
      pageSwiper: null
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
                biComment: this.taskLog.biComment,
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
    // 获取用户基本信息
    getBaseInfoData() {
      getBaseInfoData().then(({handleORG, userRoleList, ...basicUserInfo}) => {
          this.defaultUserInfo = {
            handler: basicUserInfo.userId,  // 用户id
            handlerName: basicUserInfo.nickname,  //用户名称
            handlerUnit: handleORG[0].groupId,  // 用户组织id
            handlerUnitName: handleORG[0].groupName,  // 用户组织名称
            handlerRole: userRoleList[0].roleId || '',  // 用户职位id
            handlerRoleName: userRoleList[0].roleName || '',  // 用户职位名称
            userCode: basicUserInfo.userCode, // 用户工号
          }
      })
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
    // 初始化swiper
    initSwiper() {
      this.$nextTick(() => {
        this.pageSwiper = new this.Swiper('.task-form', {
          touchAngle: 30,
          iOSEdgeSwipeDetection: true
        });
      })
    }
  },
  created() {
    this.getBaseInfoData();
    this.initSwiper();
    this.findAllJobLog();  
  }
}
</script>

<style lang='scss' scoped>
  @import './../../scss/bizDetail';

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
</style>
