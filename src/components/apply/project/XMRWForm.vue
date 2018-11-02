<template>
  <div class="pages xmrw-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <!-- 项目-->
        <r-picker title="项目名称" :data="projectList" mode="3" placeholder="请选择项目名称"
                  @on-change="projectChange" v-model="projectTask.projectName" required :has-border="false"></r-picker>
        <!-- 任务 -->
        <r-picker title="任务名称" :data="taskList" mode="3" placeholder="请选择任务名称"
                  @on-change="taskChange" v-model="projectTask.taskName" required :has-border="false"></r-picker>
        <!-- 任务详情 -->
        <div class="or_ads mg_auto " v-show="projectTask.taskName">
          <p class="title">任务详情</p>
          <group>
            <cell title="任务类型" :value="projectTask.taskType"></cell>
            <cell title="任务说明" :value="projectTask.comment" primary="content"></cell>
            <cell title="截止日期" :value="projectTask.deadline"></cell>
            <cell title="计划工时" :value="projectTask.planTime"></cell>
          </group>
        </div>
        <!-- 实际情况 -->
        <div class="or_ads mg_auto">
          <p class="title">实际情况</p>
          <group>
            <datetime title="实际完成日期" v-model="projectTask.actualCompleteTime">
              <span class="required" slot="title">实际完成日期</span>
            </datetime>
            <x-input type="number" title="实际工时" text-align="right" placeholder="请填写实际工时"
                     @on-blur="checkTime" v-model.number="projectTask.actualTime"></x-input>
          </group>
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
  import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton, Datetime, dateFormat,} from 'vux'
  // 请求 引入
  import {
    saveProjectTask, findProjectTask,
    updateProjectTask, getProjectTodoTask,
    getProjectPlanProjectName,findProjectPlan
  } from 'service/projectService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import RPicker from 'components/RPicker'
  // 方法引入
  import {toFixed} from '@/plugins/calc'

  const DRAFT_KEY = 'XMRW_DATA';
  export default {
    mixins: [ApplyCommon],
    components: {
      Icon, Cell, Group,
      XInput, Swipeout, SwipeoutItem,
      SwipeoutButton, RPicker, Datetime
    },
    data() {
      return {
        projectList: [], // 项目列表
        taskList: [], // 任务列表
        formData: {},
        jsonData: {
          baseinfo: {},
          comment: {
            biComment: ''
          },
        },
        projectTask: {
          projectName: '', // 项目名称
          taskName: '', // 任务名称
          taskType: '', // 任务类型
          comment: '', // 任务说明,
          deadline: '', // 截止时间
          planTime: '', // 计划工时
          actualCompleteTime: '', // 实际完成日期
          actualTime: '', // 实际工时
        },
      }
    },
    methods: {
      // TODO 提交
      save() {
        let warn = '';
        let dataSet = [];
        let validateMap = [
          {
            key: 'projectName',
            message: '项目'
          }, {
            key: 'taskName',
            message: '任务'
          }, {
            key: 'actualCompleteTime',
            message: '实际完成日期'
          },
        ];
        validateMap.every(item => {
          if (!this.projectTask[item.key]) {
            warn = `${item.message}不能为空`;
            return false
          }
          return true
        });
        if (warn) {
          this.$vux.alert.show({
            content: warn,
          });
          return
        }
        this.$vux.confirm.show({
          content: '确认提交?',
          // 确定回调
          onConfirm: () => {
            this.$HandleLoad.show();
            this.jsonData.baseinfo = {
              ...this.formData,
              creator: this.formData.handler,
              ...this.jsonData.baseinfo,
              modifer: this.formData.handler,
            };
            let operation = saveProjectTask;
            let submitData = {
              listId: 'ee4ff0a1-c612-419d-afd7-471913d57a2a',
              formData: {
                handlerEntity: this.entity.dealerName,
                ...this.jsonData,
                projectTask: this.projectTask,
              },
            };

            if (this.transCode) {
              operation = updateProjectTask
            }
            console.log(submitData)
            this.saveData(operation, submitData);
          }
        });
      },
      clickDateSelect() {
        this.$vux.datetime.show({
          confirmText: '确定',
          cancelText: '取消',
          value: this.formData.validUntil,
          onConfirm: (value) => {
            this.formData.validUntil = value;
          }
        })
      },
      // TODO 请求项目列表
      getProjectList() {
        return getProjectPlanProjectName().then(({tableContent = []}) => {
          let tmp = [];
          tableContent.forEach(item => {
            item.projectName && tmp.push(item.projectName);
          });
          this.projectList = tmp;
        })
      },
      // TODO 切换任务
      taskChange(val) {
        if(this.relationKey){
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
        }
      },
      // TODO 项目切换
      projectChange(val) {
        if(this.relationKey){
          return false;
        }
        this.projectTask = {
          ...this.projectTask,
          taskName: '', // 任务名称
          taskType: '', // 任务类型
          comment: '', // 任务说明,
          deadline: '', // 截止时间
          planTime: '', // 计划工时
        };
        this.getTaskList();
      },
      // TODO 获取详情
      getFormData() {
        return findProjectTask(this.transCode).then(({formData = {}}) => {
          let projectTask = formData.projectTask || {};
          this.jsonData = formData;
          this.projectTask = {
            ...projectTask,
            actualCompleteTime: dateFormat(projectTask.actualCompleteTime, 'YYYY-MM-DD')
          };
          this.$emit('input', false);
        })
      },
      // TODO 获取任务列表
      getTaskList() {
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
      // TODO 校验计划工时,保留一位小数
      checkTime(item) {
        let val = this.projectTask.actualTime;
        if (val) {
          this.projectTask.actualTime = Math.abs(toFixed(val, 1));
        }
      },
      // TODO 保存草稿数据
      hasDraftData() {
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
      // TODO 获取关联数据
      getRelationData() {
        return findProjectPlan(this.relationKey).then(({formData = {},attachment = []}) => {
          let plan =  formData.projectPlan[0];
          this.projectTask = {
            ...this.projectTask,
            projectName: formData.projectApproval.projectName, // 项目名称
            taskName: plan.taskName, // 任务名称
            taskType: plan.taskType, // 任务类型
            comment: plan.comment, // 任务说明,
            deadline: dateFormat(plan.deadline, 'YYYY-MM-DD'), // 截止时间
            planTime: plan.planTime, // 计划工时
          }
        })
      }
    },
    created() {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if(data){
        let draft = JSON.parse(data);
        this.projectTask = draft.projectTask;
        this.getTaskList();
        sessionStorage.removeItem(DRAFT_KEY);
      }
      this.getProjectList();
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xmrw-apply-container {
    .or_ads {
      padding: .06rem .08rem;
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
      .weui-cell {
        padding: 10px 0;
        &:before {
          left: 0;
        }
      }
    }
  }
</style>
