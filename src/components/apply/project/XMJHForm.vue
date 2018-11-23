<template>
  <div class="pages xmjh-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" :isRequired="false"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 项目计划基本信息-->
        <pop-name-list @sel-item="selProject" :default-value="project"></pop-name-list>

        <!-- 任务计划列表 -->
        <div class="materiel_list mg_auto" v-for="(item,index) in projectPlan" :key="index">
          <div class="title">任务计划</div>
          <group class="SJ_group" @group-title-margin-top="0">
            <x-input title="任务名称" v-model="item.taskName" text-align='right' placeholder='请填写'>
              <template slot="label">
                <span class='required'>任务名称</span>
              </template>
            </x-input>
            <popup-picker title="任务类型" :data="projectTypes" v-model="projectType[index]"
                          @on-change=" typeTask($event,item) "></popup-picker>
            <datetime title="截止日期" v-model='item.deadline'>
              <template slot="title">
                <span class='required'>计划截止日期</span>
              </template>
            </datetime>
            <x-input title="周期天数" type="number" v-model.number="item.cycleDays" text-align='right'
                     placeholder='请填写' @on-blur="checkTime(item,'cycleDays',2)"></x-input>
            <x-input title="标准工时" type="number" v-model.number="item.planTime" text-align='right'
                     placeholder='请填写' @on-blur="checkTime(item,'planTime')"></x-input>
            <x-input title="作业费率" type="number" v-model.number="item.jobRate" text-align='right'
                     placeholder='请填写' @on-blur="checkTime(item,'jobRate',2)"></x-input>
            <cell title="预算作业成本" :value="item.budgetHomeworkCost"></cell>
            <x-textarea title="任务说明" v-model="item.comment" :max="200"></x-textarea>
          </group>
        </div>
        <upload-file @on-upload="onUploadFile"></upload-file>
        <!-- 新增 -->
        <div class="XMJH_add">
          <div>您还需要添加新的计划? 请点击
            <span @click="addPlan">添加</span>
            <em v-if="projectPlan.length>1">或</em>
            <span @click="delatePlan" v-if="projectPlan.length>1"> 删除</span>
          </div>
        </div>
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
  import {
    Cell, Group, XInput,
    XTextarea, Datetime, PopupPicker
  } from 'vux'
  // 请求 引入
  import {saveProjectPlan, findProjectApproval} from 'service/projectService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import PopNameList from 'components/Popup/PopNameList'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  // 方法引入
  import {toFixed} from '@/plugins/calc'
  import {accMul} from '@/home/pages/maps/decimalsAdd'

  const DRAFT_KEY = 'XMJH_DATA';

  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, XInput,
      Datetime, XTextarea, PopNameList, PopupPicker, RPicker, PopBaseinfo,
    },
    data() {
      return {
        listId: '0281f8eb-f1d2-415c-b566-756fc749ccb3',
        projectTypes: [['设计类', '协调类', '执行类']],
        projectType: [],
        planModel: {
          taskName: '', // 任务名称
          taskType: '', // 任务类型
          comment: '', // 备注
          deadline: '', // 截止日期
          cycleDays: '', // 周期天数
          planTime: '', // 标准工时
          jobRate: '', // 作业费率
          budgetHomeworkCost: '', // 预算作业成本
        },
        projectPlan: [],
        formData: {},
        formDataComment: '', // 备注
        project: {}, // 项目计划默认值
      }
    },
    methods: {
      // 添加项目计划
      addPlan() {
        let planModel = JSON.stringify(this.planModel);
        this.projectPlan.push(JSON.parse(planModel));
        this.projectType.push([]);
      },
      // 删除项目计划
      delatePlan() {
        this.projectPlan.pop();
        this.projectType.pop();
      },
      // 任务类型选择
      typeTask(e, item) {
        item.taskType = e[0];
      },
      // TODO 选中项目计划项
      selProject(val) {
        let sel = JSON.parse(val);
        this.project = sel;
      },
      // TODO 提交
      save() {
        let warn = '';
        // 验证选择项目
        if (!this.project.PROJECT_NAME) {
          warn = '请选择项目';
        }
        let objArr = {
          taskName: '任务名称',
          deadline: '截止日期',
        };
        // 验证任务计划
        if (!warn) {
          this.projectPlan.every(item => {
            Object.entries(objArr).every(([key, value]) => {
              if (!item[key]) {
                warn = `${value}不能为空`;
                return false
              }
              return true
            });
            return !warn
          });
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
            let operation = saveProjectPlan;
            let submitData = {
              listId: this.listId,
              formData: {
                handlerEntity: this.entity.dealerName,
                comment: {
                  biComment: this.formDataComment,
                },
                baseinfo: {
                  creator: this.formData.handler,
                  handler: this.formData.handler,
                  handlerName: this.formData.handlerName,
                  handlerRole: this.formData.handlerRole,
                  handlerRoleName: this.formData.handlerRoleName,
                  handlerUnit: this.formData.handlerUnit,
                  handlerUnitName: this.formData.handlerUnitName,
                  id: '',
                  modifer: this.formData.handler,
                },
                projectApproval: {
                  projectName: this.project.PROJECT_NAME,
                  comment: this.project.COMMENT,
                  projectManager: this.project.PROJECT_MANAGER,
                  expectStartDate: this.project.EXPECT_START_DATE,
                  expectEndDate: this.project.EXPECT_END_DATE,
                },
                projectPlan: this.projectPlan
              },
            };
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 校验标准工时,保留小数位
      checkTime(item, key, length = 1) {
        let {planTime, jobRate} = item;
        if (item[key]) {
          item[key] = Math.abs(toFixed(item[key], length));
        }
        if (key === 'planTime' || key === 'jobRate') {
          item.budgetHomeworkCost = accMul(Number(planTime), Number(jobRate));
        }
      },
      // TODO 保存草稿数据
      hasDraftData() {
        // 是否选择项目
        if (!this.project.PROJECT_NAME) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            project: this.project,
            projectPlan: this.projectPlan
          }
        };
      },
      // TODO 获取关联数据
      getRelationData() {
        return findProjectApproval(this.relationKey).then(({formData = {}, attachment = []}) => {
          let data = JSON.parse(JSON.stringify(formData.approval));
          this.project = {
            BUDGET_CAPITAL: data.budgetCapital,
            BUDGET_COST: data.budgetCost,
            BUDGET_INCOME: data.budgetIncome,
            BUDGET_PROFIT: data.budgetProfit,
            BUDGET_PROFIT_MARGIN: data.budgetProfitMargin,
            COMMENT: data.comment,
            EXPECT_END_DATE: data.expectEndDate,
            EXPECT_START_DATE: data.expectStartDate,
            ID: data.projectApprovalId,
            PHONE_NUMBER: data.phoneNumber,
            PROJECT_MANAGER: data.projectManager,
            PROJECT_NAME: data.projectName,
            PROJECT_STATUS: data.projectStatus,
            PROJECT_SUBCLASS: data.projectSubclass,
            PROJECT_TYPE: data.projectType,
            REFERENCE_ID: data.referenceId
          }
          this.selProject(JSON.stringify(this.project));
        })
      }
    },
    created() {
      let plan = JSON.stringify(this.planModel);
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.project = draft.project;
        this.projectPlan = draft.projectPlan;
        this.projectPlan.forEach((item, index) => {
          this.projectType.push([]);
          this.projectType[index].push(item.taskType);
        });
        sessionStorage.removeItem(DRAFT_KEY);
        return
      }
      this.projectPlan.push(JSON.parse(plan));
      this.projectType.push([]);
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xmjh-apply-container {
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

  .vux-cell-box:not(:first-child):before {
    left: 0;
  }

  .XMJH_add {
    text-align: center;
    font-size: 0.12rem;
    padding: 0.1rem 0;
    color: #757575;
    span {
      color: #fff;
      padding: .01rem .04rem;
      border-radius: .12rem;
      &:nth-child(1) {
        background: #5077aa;
      }
      &:nth-child(3) {
        background: #fc3c3c;
      }
    }
    em {
      font-style: normal;
    }
  }
</style>
