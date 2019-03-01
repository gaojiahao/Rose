<template>
  <div class="pages xmrw-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem"
                      :handle-org-list="handleORG" :user-role-list="userRoleList" :showStatus="false"></pop-baseinfo>
        <div class="materiel_list">
          <div :class="{'vux-1px-t': index > 0}" v-for="(item, index) in otherConfig" :key="index">
            <template v-if="!item.readOnly">
              <!--项目经理-->
              <template v-if="item.fieldCode === 'dealerName'">
                <div class='each_property' @click="showUserList = true">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <div class='picker'>
                    <span class='mater_nature'>{{projectTask[item.fieldCode] || "请选择"}}</span>
                    <span class='icon-right'></span>
                  </div>
                </div>
              </template>
              <template v-else>
                <!-- 下拉框 -->
                <r-picker :title="item.fieldLabel" :data="item.remoteData" :value="projectTask[item.fieldCode]"
                        v-model="projectTask[item.fieldCode]" :required="!item.allowBlank" @on-change="projectChange(item, projectTask[item.fieldCode])"
                        v-if="item.xtype === 'r2Combo' || item.xtype === 'r2Selector'"></r-picker>
                <!-- 输入框（文字） -->
                <div class='each_property' v-if="item.xtype === 'r2Textfield'">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <input type='text' v-model="projectTask[item.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
                </div>
                <!-- 输入框（数字） -->
                <div class='each_property ' v-if="item.xtype === 'r2Numberfield'">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <input type='number' v-model.number="projectTask[item.fieldCode]" placeholder="请输入" class='property_val' @focus="getFocus($event)"/>
                </div>
                <!-- 日期 -->
                <div class='each_property' v-if="item.xtype === 'r2Datefield'" @click="getDate(projectTask,item)">
                  <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                  <div class='picker'>
                    <span class='mater_nature'>{{projectTask[item.fieldCode] || "请选择"}}</span>
                    <span class='icon-right'></span>
                  </div>
                </div>
                <!-- 文本框 -->
                <x-textarea v-model="projectTask[item.fieldCode]" :max="100" v-if="item.xtype === 'r2TextArea'">
                  <template slot="label">
                    <span :class="{required : !item.allowBlank}" style="display: block; width: 4em;">{{item.fieldLabel}}</span>
                  </template>
                </x-textarea>
              </template>
            </template>
            <template v-else>
              <div class='each_property'>
                <label :class="{required: !item.allowBlank}">{{item.fieldLabel}}</label>
                <span class='property_val'>{{projectTask[item.fieldCode]}}</span>
              </div>
            </template>
          </div>
        </div>
        <pop-user-list :show="showUserList" :default-value="selectedUser" @sel-item="selUser"
                   v-model="showUserList"></pop-user-list>
        <!-- 备注 -->
        <div class="comment">         
          <x-textarea v-model="jsonData.comment.biComment" placeholder="备注"></x-textarea>
        </div>
        <upload-file @on-upload="onUploadFile"></upload-file>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn vux-1px-t' :class="{btn_hide : btnIsHide}">
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  // vux组件引入
  import { Icon, Cell, Group, XInput, Datetime, dateFormat, XTextarea } from 'vux'
  // 请求 引入
  import {
    saveProjectTask, findProjectTask,
    updateProjectTask, getProjectTodoTask,
    getProjectPlanProjectName, findProjectPlan
  } from 'service/projectService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import RPicker from 'components/basicPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopUserList from 'components/Popup/PopUserList'
  // 方法引入
  import { toFixed } from '@/plugins/calc'
  import {accMul} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'XMRW_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Icon, Cell, Group, XInput,
      RPicker, PopBaseinfo, Datetime, XTextarea, PopUserList
    },
    data () {
      return {
        projectList: [], // 项目列表
        taskList: [], // 任务列表
        formData: {
          biProcessStatus: '',
          id: ''
        },
        jsonData: {
          comment: {
            biComment: ''
          },
        },
        projectTask: {},
        defaultManager: {},
        showUserList: false,
        selectedUser: {}
      }
    },
    methods: {
      // 提交
      save () {
        /**
         * @warn 提示文字
         * 
         */
        let warn = '';
        // 校验 <项目> 必填字段
        warn = this.verifyData(this.otherConfig, this.projectTask);
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
            let operation = saveProjectTask;
            if (this.transCode) {
              operation = updateProjectTask
            }
            let submitData = {
              listId: 'ee4ff0a1-c612-419d-afd7-471913d57a2a',
              formData: {
                baseinfo: {
                  ...this.formData,
                  creator: this.formData.handler,
                  modifer: this.formData.handler,
                  handlerEntity: this.entity.dealerName,
                },
                comment: this.jsonData.comment,
                projectPlanTask: this.projectTask,
              },
              wfParam: null
            };
            this.saveData(operation, submitData);
          }
        });
      },
      // 选中执行者
      selUser(val) {
        this.selectedUser = {...val};
        this.projectTask.dealerName = val.nickname;
        this.projectTask.executor = val.userCode;
      },
      // 选择日期
      getDate(sItem, dItem) {
        let startDate = '', endDate = '';
        this.$vux.datetime.show({
          confirmText: '确认',
          cancelText: '取消',
          onConfirm: (val)=> {
            if(sItem[dItem.fieldCode] == null){
              this.$set(sItem, dItem.fieldCode, val)
              return
            }
            sItem[dItem.fieldCode] = val;
          },
        })
      }, 
      // 请求项目列表
      getProjectList () {
        return getProjectPlanProjectName().then(({tableContent = []}) => {
          let tmp = [];
          tableContent.forEach(item => {
            item.projectName && tmp.push({
              ...item,
              name: item.projectName,
              value: item.projectName,
            });
          });
          this.projectList = tmp;
        })
      },
      // 切换任务
      taskChange (val) {
        if (this.relationKey || this.transCode) {
          return false;
        }
        let [sel = {}] = this.taskList.filter(item => {
          return item.value === val;
        });
        this.projectTask = {
          ...this.projectTask,
          taskName: sel.TASK_NAME, // 任务名称
          taskType: sel.TASK_TYPE, // 任务类型
          comment: sel.COMMENT, // 任务说明,
          deadline: dateFormat(sel.DEADLINE, 'YYYY-MM-DD'), // 截止时间
          planTime: sel.PLAN_TIME, // 计划工时
          budgetHomeworkCost: sel.BUDGET_HOMEWORK_COST, // 预算作业成本
          operatingRate: sel.JOB_RATE , // 作业费率
          cycleNumber: sel.CYCLE_DAYS,
        }
      },
      // 项目切换
      projectChange (item, val) {
        if(item.fieldCode === 'projectName') {
          let matched = item.remoteData.find(dItem => dItem.projectName === val);
          this.projectTask = {
            ...this.projectTask,
            projectType: matched.projectType || '',
            projectSubclass: matched.projectSubclass || '',
            projectManagerName: matched.projectManagerName,
            projectManager: matched.projectManager,
          };
        }
        // this.getTaskList();
      },
      // 获取详情
      getFormData () {
        return findProjectTask(this.transCode).then(({formData = {}}) => {
          let projectApproval = formData.projectApproval;
          let projectPlanTask = formData.projectPlanTask;
          this.jsonData.comment = formData.comment;
          this.formData.id = formData.baseinfo.id;
          this.projectTask = {
            projectName: projectApproval.projectName,
            projectManager: projectApproval.projectManager,
            projectManagerName: projectApproval.projectManagerName,
            projectName: projectApproval.projectName,
            projectPlanTaskId: projectApproval.projectPlanTaskId,
            projectSubclass: projectApproval.projectSubclass,
            projectType: projectApproval.projectType,
            projectPlanTaskId: projectPlanTask.projectPlanTaskId,
            executor: projectPlanTask.executor,
            phoneNumber: projectApproval.phoneNumber,
            taskName: projectPlanTask.taskName,
            taskType: projectPlanTask.taskType,
            dealerName: projectPlanTask.dealerName,
            cycleDays: projectPlanTask.cycleDays,
            standardWorkingHours: projectPlanTask.standardWorkingHours,
            startTime: projectPlanTask.startTime,
            deadline: projectPlanTask.deadline,
            completeTime: projectPlanTask.completeTime,
            taskComment: projectPlanTask.taskComment,
          };
          this.handlerDefault = {
            handler: formData.baseinfo.handler,
            handlerName: formData.baseinfo.handlerName,
            handlerUnit: formData.baseinfo.handlerUnit,
            handlerUnitName: formData.baseinfo.handlerUnitName,
            handlerRole: formData.baseinfo.handlerRole,
            handlerRoleName: formData.baseinfo.handlerRoleName,
          };
          // this.getTaskList()
          this.$loading.hide()
        })
      },
      // 获取任务列表
      getTaskList () {
        return getProjectTodoTask({
          projectName: this.projectTask.projectName
        }).then(({tableContent = []}) => {
          this.taskList = tableContent.map(item => {
            return item = {
              ...item,
              name: item.TASK_NAME,
              value: item.TASK_NAME,
            }
          });
        })
      },
      // 校验计划工时,保留一位小数
      checkTime () {
        let val = this.projectTask.actualTime;
        if (val) {
          this.projectTask.actualTime = Math.abs(toFixed(val, 1));
        }
        if(this.projectTask.operatingRate && this.projectTask.actualTime){
          this.projectTask.actualtHomeworkCost = accMul(this.projectTask.operatingRate, this.projectTask.actualTime)
        }
      },
      // 保存草稿数据
      hasDraftData () {
        // 是否选择项目
        if (!this.projectTask.projectName) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            projectTask: this.projectTask
          }
        };
      },
      // 获取关联数据
      getRelationData () {
        return findProjectPlan(this.relationKey).then(({formData = {},attachment = []}) => {
          let plan =  formData.projectPlan[0];
          this.projectTask = {
            ...formData.projectApproval,
          }
        })
      }
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if(data){
        let draft = JSON.parse(data);
        this.projectTask = draft.projectTask;
        this.getTaskList();
        sessionStorage.removeItem(DRAFT_KEY);
      }
      // this.getProjectList();
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';
  .no_count {
    height: calc(100% - .8rem);
  }
  .materiel_list {
    background: #fff;
    padding: 0 .15rem;
    font-size: .14rem;
    color: #333;
    .weui-cell {
      padding: .1rem 0;
      /deep/ .weui-textarea {
        text-align: right;
      }
    }
  }
  .each_property {
    padding: .18rem 0;
    display: flex;
    justify-content: space-between;
    line-height: .14rem;
    input {  
      border: none;
      outline: none;
      font-size: .14rem;
    } 
    label {
      color: #696969;
    }
    .required {
      color: #3296FA;
      font-weight: bold;
    }
    .property_val {
      text-align: right;
      flex: 1;
      margin-left: .1rem;
    }
    .readonly {
      color: #999;
    }
    .picker {
      display: flex;
      align-items: center;
      .icon-right{
        width: .08rem;
        height: .14rem;
        margin-left: .1rem;
      }
    }
  }
</style>
