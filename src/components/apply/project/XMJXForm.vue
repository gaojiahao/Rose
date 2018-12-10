<template>
  <div class="pages xmjx-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" :isRequired="false"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <!-- 项目-->
        <pop-name-list @sel-item="selProject" :default-value="projectApproval"></pop-name-list>
        <!-- 实际情况 -->
        <div class="materiel_list">
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
        <!-- 资金明细 -->
        <!--<div class="" v-show="projectConclusion.length">-->
        <div class="materiel_list project-amt" v-show="projectConclusion.length">
          <p class="title">资金明细</p>
          <div class="project_content" :class="{'vux-1px-b': index !== projectConclusion.length - 1}"
               v-for="(item, index) in projectConclusion">
            <form-cell :cellTitle="`实际${item.conclusionName}`" :showSymbol="item.conclusionName !== '利润率'" textRight
                       :cellContent="numberComma(item.actual)" :showTopBorder="false"></form-cell>
            <form-cell :cellTitle="`预算${item.conclusionName}`" :showSymbol="item.conclusionName !== '利润率'" textRight
                       :cellContent="numberComma(item.budget)" :showTopBorder="false"></form-cell>
            <form-cell :cellTitle="`差额${item.conclusionName}`" :showSymbol="item.conclusionName !== '利润率'" textRight
                       :cellContent="numberComma(item.difference)" :showTopBorder="false"></form-cell>
          </div>
        </div>
        <upload-file @on-upload="onUploadFile"></upload-file>
        <!-- 资金明细 -->
        <!--<div class="or_ads mg_auto box_sd" v-show="projectConclusion.length">
          <div :class="{'vux-1px-b': index !== projectConclusion.length - 1}"
               v-for="(item, index) in projectConclusion">
            <div class="amt-title"><span class="iconfont icon-yusuan2"></span>{{item.conclusionName}}</div>
            <form-cell cellTitle="实际" showSymbol textRight :cellContent="numberComma(item.actual)"></form-cell>
            <form-cell cellTitle="预算" showSymbol textRight :cellContent="numberComma(item.budget)"></form-cell>
            <form-cell cellTitle="差额" showSymbol textRight :cellContent="numberComma(item.difference)"></form-cell>
          </div>
        </div>-->
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
  import { Cell, Group, XInput, Datetime, dateFormat, numberComma } from 'vux'
  // 请求 引入
  import {
    saveProjectConclusion, findProjectConclusion,
    updateProjectConclusion, getProjectTodoTask,
    findConclusion,findProjectApproval
  } from 'service/projectService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  // 组件引入
  import PopNameList from 'components/Popup/PopNameList'
  import FormCell from 'components/detail/commonPart/FormCell'
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  const DRAFT_KEY = 'XMJX_DATA';

  export default {
    mixins: [ApplyCommon],
    components: {
      Cell, Group, XInput, Datetime,
      PopNameList, FormCell, RPicker, PopBaseinfo,
    },
    data () {
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
        projectConclusion: [],
        projectTime: {
          actualStartTime: '', // 实际开始日期,
          actualCompleteTime: '',// 实际完成日期
        },
      }
    },
    methods: {
      // TODO 提交
      save () {
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
            let projectConclusion = this.projectConclusion.map(item => {
              return {
                conclusionName: item.conclusionName,
                actual: item.actual,
                budget: item.budget,
                difference: item.difference,
              }
            });
            let submitData = {
              listId: this.listId,
              formData: {
                handlerEntity: this.entity.dealerName,
                ...this.jsonData,
                projectApproval: {
                  projectName: this.projectApproval.PROJECT_NAME,
                  projectType: this.projectApproval.PROJECT_TYPE,
                  comment: this.projectApproval.COMMENT,
                  projectManager: this.projectApproval.PROJECT_MANAGER,
                  expectStartDate: this.projectApproval.EXPECT_START_DATE,
                  expectEndDate: this.projectApproval.EXPECT_END_DATE,
                },
                projectConclusion: projectConclusion,
                projectTime: this.projectTime
              },
            };

            if (this.transCode) {
              operation = updateProjectConclusion
            }
            this.saveData(operation, submitData);
          }
        });
      },
      clickDateSelect () {
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
      selProject (val = '{}') {
        this.projectApproval = JSON.parse(val);
        findConclusion(this.projectApproval.PROJECT_NAME).then(({data = []}) => {
          this.projectConclusion = data;
        })
      },
      // TODO 获取详情
      getFormData () {
        return findProjectConclusion(this.transCode).then(({formData = {}}) => {
        })
      },
      // TODO 使用千分符
      numberComma (val) {
        if (!val && val !== 0) {
          return '无';
        }
        return numberComma(val);
      },
      // TODO 保存草稿数据
      hasDraftData () {
        // 是否选择订单
        if (!this.projectApproval.PROJECT_NAME) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            projectApproval: this.projectApproval,
            jsonData: this.jsonData,
            projectConclusion: this.projectConclusion,
            projectTime: this.projectTime,
          }
        };
      },
      // TODO 获取关联数据
      getRelationData () {
        return findProjectApproval(this.relationKey).then(({formData = {},attachment = []}) => {
          let data = JSON.parse(JSON.stringify(formData.approval));
          this.projectApproval = {
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
          this.selProject(JSON.stringify(this.projectApproval));
        })

      }
    },
    created () {
      let data = sessionStorage.getItem(DRAFT_KEY);
      if (data) {
        let draft = JSON.parse(data);
        this.projectApproval = draft.projectApproval;
        this.jsonData = draft.jsonData;
        this.projectConclusion = draft.projectConclusion;
        this.projectTime = draft.projectTime;
        sessionStorage.removeItem(DRAFT_KEY);
      }
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xmjx-apply-container {
    .or_ads {
      padding: .06rem .08rem;
    }
    .project-amt {
      .project_content {
        padding: .05rem 0;
      }
      .each_cell {
        padding: 0;
      }
    }
    .amt-title {
      padding: .1rem 0;
    }
    .vux-1px-b:after {
      border-top: 1px solid #e8e8e8;
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
