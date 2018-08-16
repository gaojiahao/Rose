<template>
  <div class="pages xmrw-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <!-- 项目-->
        <r-picker title="项目名称" :data="projectList" mode="3" placeholder="请选择项目名称"
                  v-model="projectTask.projectName"></r-picker>
        <!-- 任务 -->
        <r-picker title="任务名称" :data="taskList" mode="3" placeholder="请选择任务名称"
                  @on-change="taskChange" v-model="projectTask.taskName"></r-picker>
        <!-- 任务详情 -->
        <div class="or_ads mg_auto box_sd" v-show="projectTask.taskName">
          <p class="title">任务详情</p>
          <group>
            <cell title="任务类型" :value="projectTask.taskType"></cell>
            <cell title="任务说明" :value="projectTask.comment"></cell>
            <cell title="截止日期" :value="projectTask.deadline"></cell>
            <cell title="计划工时" :value="projectTask.planTime"></cell>
          </group>
        </div>
        <!-- 实际情况 -->
        <div class="or_ads mg_auto box_sd">
          <p class="title">实际情况</p>
          <group>
            <datetime title="实际完成日期" v-model="projectTask.actualCompleteTime"></datetime>
            <x-input type="number" title="实际工时" text-align="right" placeholder="请填写实际工时"
                     v-model.number="projectTask.actualTime"></x-input>
          </group>
        </div>
      </div>
    </div>
    <!-- 底部确认栏 -->
    <div class='btn vux-1px-t'>
      <div class="cfm_btn" @click="save">提交</div>
    </div>
  </div>
</template>

<script>
  import {Icon, Cell, Group, XInput, Swipeout, SwipeoutItem, SwipeoutButton, Datetime, dateFormat,} from 'vux'
  import ApplyCommon from './../mixins/applyCommon'
  import RPicker from 'components/RPicker'
  import {getProjectPlanProjectName, saveProjectTask, updateProjectTask, findProjectTask} from 'service/projectService'

  export default {
    mixins: [ApplyCommon],
    components: {
      Icon,
      Cell,
      Group,
      XInput,
      Swipeout,
      SwipeoutItem,
      SwipeoutButton,
      RPicker,
      Datetime,
    },
    data() {
      return {
        projectList: [], // 项目列表
        taskList: [
          {
            name: '任务1',
            value: '任务1',
            taskType: '任务类型1', // 任务类型
            deadline: '2018-08-18', // 截止时间
            planTime: 16, // 计划工时
            comment: '任务说明1', // 任务说明
          },
          {
            name: '任务2',
            value: '任务2',
            taskType: '任务类型2', // 任务类型
            deadline: '2018-08-19', // 截止时间
            planTime: 24, // 计划工时
            comment: '任务说明2', // 任务说明
          },
        ], // 任务列表
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
          }, {
            key: 'actualTime',
            message: '实际工时'
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
        let [sel = {}] = this.taskList.filter(item => {
          return item.value === val;
        });
        console.log(sel)
        this.projectTask = {
          ...this.projectTask,
          ...sel,
        }
      },
      // TODO 获取详情
      getFormData() {
        return findProjectTask(this.transCode).then(({formData = {}}) => {
          let {projectTask} = formData;
          this.jsonData = formData;
          this.projectTask = {
            ...projectTask,
            actualCompleteTime: dateFormat(projectTask.actualCompleteTime, 'YYYY-MM-DD')
          };
        })
      }
    },
    created() {
      this.getProjectList();
    },
  }
</script>

<style lang="scss" scoped>
  @import './../scss/bizApply';

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
