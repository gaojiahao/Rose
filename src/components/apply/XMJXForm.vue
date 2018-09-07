<template>
  <div class="pages xmjx-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <!-- 项目-->
        <pop-name-list @sel-item="selProject"></pop-name-list>
        <!-- 实际情况 -->
        <div class="or_ads mg_auto box_sd">
          <p class="title">实际情况</p>
          <group>
            <datetime title="实际开始日期" v-model="projectTime.actualStartTime">
              <span class="required" slot="title">实际开始日期</span>
            </datetime>
            <datetime title="实际完成日期" v-model="projectTime.actualCompleteTime">
              <span class="required" slot="title">实际完成日期</span>
            </datetime>
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
  // vux组件引入
  import {Cell, Group, XInput, Datetime, dateFormat,} from 'vux'
  // 请求 引入
  import {
    saveProjectConclusion, findProjectConclusion,
    updateProjectConclusion, getProjectTodoTask,
    getProjectPlanProjectName
  } from 'service/projectService'
  // mixins 引入
  import ApplyCommon from './../mixins/applyCommon'
  // 组件引入
  import PopNameList from 'components/Popup/PopNameList'

  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group,
      XInput, Datetime, PopNameList,
    },
    data() {
      return {
        listId: 'b87a513e-99ec-4608-89db-3d6e97ef1432',
        projectList: [], // 项目列表
        taskList: [], // 任务列表
        formData: {},
        projectApproval: {}, // 选中的项目
        jsonData: {
          baseinfo: {},
          comment: {
            biComment: ''
          },
        },
        projectConclusion: [{
          conclusionName: '收入', // 名称
          actual: 1500, // 实际
          budget: 1000, // 预算
          difference: 500 // 差额
        }],
        projectTime: {
          actualStartTime: '', // 实际开始日期,
          actualCompleteTime: '',// 实际完成日期
        }
      }
    },
    methods: {
      // TODO 提交
      save() {
        let warn = '';
        let dataSet = [];
        let validateMap = [
          {
            key: 'actualStartTime',
            message: '实际开始日期'
          }, {
            key: 'actualCompleteTime',
            message: '实际完成日期'
          },
        ];
        if (!this.projectApproval.PROJECT_NAME) {
          warn = '请选择项目'
        }
        validateMap.every(item => {
          if (!this.projectTime[item.key]) {
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
            let operation = saveProjectConclusion;
            let submitData = {
              listId: this.listId,
              formData: {
                handlerEntity: this.entity.dealerName,
                ...this.jsonData,
                projectApproval: {
                  projectName: this.projectApproval.PROJECT_NAME
                },
                projectConclusion: this.projectConclusion,
                projectTime: this.projectTime
              },
            };

            if (this.transCode) {
              operation = updateProjectConclusion
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
      // TODO 项目切换
      selProject(val = '{}') {
        this.projectApproval = JSON.parse(val);
      },
      // TODO 获取详情
      getFormData() {
        return findProjectConclusion(this.transCode).then(({formData = {}}) => {
        })
      },
    },
    created() {
    },
  }
</script>

<style lang="scss" scoped>
  @import './../scss/bizApply';

  .xmjx-apply-container {
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
