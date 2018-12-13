<template>
  <div class="pages xmlx-apply-container">
    <div class="basicPart no_count" ref="fill">
      <div class="fill_wrapper">
        <pop-baseinfo :defaultValue="handlerDefault" @sel-item="selItem" :isRequired="false"></pop-baseinfo>
        <r-picker title="流程状态" :data="currentStage" mode="3" placeholder="请选择流程状态" :hasBorder="false"
                  v-model="formData.biProcessStatus"></r-picker>
        <pop-manager-list @sel-item="selManager" :defaultValue="defaultManager"></pop-manager-list>
        <!-- 项目类型-->
        <r-picker title="项目大类" :data="typeList" mode="3" placeholder="请选择项目大类"
                  @on-change="projectBigChange" :has-border="false"
                  v-model="ProjectApproval.projectType" :required="ProjectApproval.projectType === ''"></r-picker>
        <r-picker title="项目子类" :data="subclassList" mode="3" placeholder="请选择项目子类" :has-border="false"
                  v-model="ProjectApproval.projectSubclass"></r-picker>
        <!-- 项目立项明细 -->
        <div class="materiel_list mg_auto">
          <div class="title">项目立项明细</div>
          <group @group-title-margin-top="0">
            <x-input title="项目名称" v-model="ProjectApproval.projectName" text-align='right' placeholder='请填写'>
              <template slot="label">
                <span class='required'>项目名称</span>
              </template>
            </x-input>
            <x-input title="预算收入" type="number" v-model.number="ProjectApproval.budgetIncome"
                     text-align='right' placeholder='请填写'
                     @on-blur="checkAmt('budgetIncome', $event)">
              <template slot="label">
                <span class='required'>预算收入</span>
              </template>
            </x-input>
            <x-input title="预算成本" type="number" v-model.number="ProjectApproval.budgetCapital"
                     text-align='right' placeholder='请填写'
                     @on-blur="checkAmt('budgetCapital', $event)">
              <template slot="label">
                <span class='required'>预算成本</span>
              </template>
            </x-input>
            <x-input title="预算费用" type="number" v-model.number="ProjectApproval.budgetCost"
                     text-align='right' placeholder='请填写'
                     @on-blur="checkAmt('budgetCost', $event)">
              <template slot="label">
                <span class='required'>预算费用</span>
              </template>
            </x-input>
            <datetime title="预期开始日期" v-model='ProjectApproval.expectStartDate'>
              <template slot="title">
                <span class='required'>预期开始日期</span>
              </template>
            </datetime>
            <datetime title="预期截止日期" v-model='ProjectApproval.expectEndDate'>
              <template slot="title">
                <span class='required'>预期截止日期</span>
              </template>
            </datetime>
            <cell title="预算利润" :value="profit"></cell>
            <cell title="预算利润率" :value="profitMargin"></cell>
            <x-textarea title="项目说明" v-model="ProjectApproval.comment" :max="200"></x-textarea>
          </group>
        </div>
        <div class="materiel_list">
          <group title="其他信息" class="costGroup">
            <x-textarea title="备注" v-model="formData.biComment" :max="100"></x-textarea>
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
  import {
    Cell, Group, XInput,
    XTextarea, Datetime, dateFormat
  } from 'vux'
  // 请求 引入
  import { saveProjectApproval, findProjectApproval } from 'service/projectService'
  import { getDictByType, getDictByValue } from 'service/commonService'
  // mixins 引入
  import ApplyCommon from 'pageMixins/applyCommon'
  import common from '@/mixins/common'
  // 组件 引入
  import RPicker from 'components/RPicker'
  import PopBaseinfo from 'components/apply/commonPart/BaseinfoPop'
  import PopManagerList from 'components/Popup/PopManagerList'

  const DRAFT_KEY = 'XMLX_DATA';
  export default {
    mixins: [ApplyCommon, common],
    components: {
      Cell, Group, XInput,
       RPicker, PopBaseinfo, Datetime, XTextarea, PopManagerList,
    },
    data() {
      return {
        listId: '630a9b96-f257-48b6-b0bc-fd64c455d92b',
        typeList: [], // 项目大类列表
        subclassList: [], // 项目子类列表
        ProjectApproval: {
          projectName: '', // 项目名称
          projectType: '', // 项目类型
          projectManager: '', // 项目经理
          phoneNumber: '', // 手机号
          expectStartDate: dateFormat(new Date, 'YYYY-MM-DD'), // 预期开始日期
          expectEndDate: dateFormat(new Date, 'YYYY-MM-DD'), // 预期截止日期
          budgetIncome: '', // 预算收入
          budgetCapital: '', // 预算成本
          budgetCost: '', // 预算费用
          budgetProfit: '', // 预算利润
          budgetProfitMargin: '', // 预算利润率
          comment: '', // 项目说明
          projectSubclass: '', // 项目子类
        },
        formData: {
          biComment: '',
          biProcessStatus: ''
        },
        defaultManager: {}, // 项目经理的默认值
        hasDefault: false, // 是否为界面回写
      }
    },
    computed: {
      // 利润
      profit () {
        let {budgetIncome = 0, budgetCapital = 0, budgetCost = 0} = this.ProjectApproval;
        let budgetProfit = Number(budgetIncome) - Number(budgetCapital) - Number(budgetCost);
        this.ProjectApproval.budgetProfit = budgetProfit;
        return budgetProfit;
      },
      // 利润率
      profitMargin () {
        let {budgetIncome = 0, budgetProfit = 1} = this.ProjectApproval;
        let budgetProfitMargin = Math.floor(Number(budgetProfit) / (Number(budgetIncome) || 1) * 10000) / 10000;
        this.ProjectApproval.budgetProfitMargin = budgetProfitMargin;
        return `${budgetProfitMargin * 10000 / 100}%`;
      }
    },
    methods: {
      // TODO 提交
      save () {
        let objArr = [
          {tip: 'projectManager', msg: '项目经理'},
          {tip: 'projectType', msg: '项目大类'},
          {tip: 'projectName', msg: '项目名称'},
          {tip: 'budgetIncome', msg: '预算收入'},
          {tip: 'budgetCapital', msg: '预算成本'},
          {tip: 'budgetCost', msg: '预算费用'},
          {tip: 'expectStartDate', msg: '预期开始日期'},
          {tip: 'expectEndDate', msg: '预期截止日期'},
        ];
        let selArr = ['projectManager', 'projectType'];
        let warn = '';
        objArr.every(item => {
          if (!this.ProjectApproval[item.tip]) {
            if (selArr.includes(item.tip)) {
              warn = `请选择${item.msg}`;
            } else {
              warn = `请填写${item.msg}`;
            }
            return false
          }
          return true
        });
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
            let operation = saveProjectApproval;
            let submitData = {
              listId: this.listId,
              formData: {
                handlerEntity: this.entity.dealerName,
                comment: {
                  biComment: this.formData.biComment,
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
                projectApproval: this.ProjectApproval
              },
              wfParam: null
            };
            this.saveData(operation, submitData);
          }
        });
      },
      // TODO 选中项目经理
      selManager (val) {
        let sel = JSON.parse(val);
        this.ProjectApproval.projectManager = sel.dealerName;
        this.ProjectApproval.phoneNumber = sel.dealerMobilePhone;
      },
      // TODO 检查金额
      checkAmt (key = '', val) {
        if (val) {
          this.ProjectApproval[key] = Math.abs(parseInt(val));
        }
      },
      // TODO 获取项目大类
      getBigType () {
        return getDictByType('projectType').then(({tableContent = []}) => {
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.typeList = tableContent;
        });
      },
      // TODO 获取项目子类
      getType () {
        let selected = this.typeList.find(item => {
          return item.name === this.ProjectApproval.projectType
        }) || {};
        return getDictByValue(selected.originValue).then(({tableContent = []}) => {
          tableContent && tableContent.forEach(item => {
            item.originValue = item.value;
            item.value = item.name;
          });
          this.subclassList = tableContent;
          return tableContent;
        });
      },
      // TODO 项目大类切换
      projectBigChange (val) {
        this.getType().then(data => {
          if (this.hasDefault) {
            return
          }
          // 默认取第一个
          let [defaultSelect = {}] = data;
          this.ProjectApproval.projectSubclass = defaultSelect.name;
        })
      },
      // TODO 获取显示数据
      getFormData () {
        return findProjectApproval(this.transCode).then(({formData = {}}) => {
          this.hasDefault = true;
          this.defaultManager = {
            dealerName: formData.projectApproval.projectManager,
            dealerMobilePhone: formData.projectApproval.phoneNumber,
          };
          formData.projectApproval.expectStartDate = this.changeDate(formData.projectApproval.expectStartDate);
          formData.projectApproval.expectEndDate = this.changeDate(formData.projectApproval.expectEndDate);
          this.ProjectApproval = formData.projectApproval;
          this.$nextTick(() => {
            // 渲染完后重置为false
            this.hasDefault = false;
          })
          this.handlerDefault = {
            handler: formData.baseinfo.handler,
            handlerName: formData.baseinfo.handlerName,
            handlerUnit: formData.baseinfo.handlerUnit,
            handlerUnitName: formData.baseinfo.handlerUnitName,
            handlerRole: formData.baseinfo.handlerRole,
            handlerRoleName: formData.baseinfo.handlerRoleName,
          };
          // 基本信息
          this.formData = {
            ...this.formData,
            ...this.handlerDefault,
            biComment: formData.baseinfo.biComment,
            biId: formData.baseinfo.biId,
            biProcessStatus: formData.baseinfo.biProcessStatus,
            creator: formData.baseinfo.creator,
            modifer: formData.baseinfo.modifer,
          }
          this.biReferenceId = formData.biReferenceId;
          this.$loading.hide()
        })
      },
      // TODO 初始化页面的数据
      initRequest () {
        let data = sessionStorage.getItem(DRAFT_KEY);
        let promises = [];
        if (data) {
          let draft = JSON.parse(data);
          this.ProjectApproval = draft.ProjectApproval;
          this.defaultManager = {
            dealerName: this.ProjectApproval.projectManager,
            dealerMobilePhone: this.ProjectApproval.phoneNumber,
          };
          this.getBigType().then(() => {
            this.getType();
          });
          sessionStorage.removeItem(DRAFT_KEY);
          return
        }
        promises.push(this.getBigType());
        return Promise.all(promises);
      },
      // TODO 保存草稿数据
      hasDraftData () {
        // 是否选择项目经理
        if (!this.ProjectApproval.projectManager) {
          return false
        }
        return {
          [DRAFT_KEY]: {
            ProjectApproval: this.ProjectApproval,
          }
        };
      },
    },
    created () {
    },
  }
</script>

<style lang="scss" scoped>
  @import './../../scss/bizApply';

  .xmlx-apply-container {
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
    .materiel_list{
      /deep/ .weui-cells__title {
        padding-left: 0;
        font-size: .12rem;
      }
      /deep/ .weui-cells{
        &:before{
          border-top: 1px solid #D9D9D9;
        }
      }
    }
  }
</style>
